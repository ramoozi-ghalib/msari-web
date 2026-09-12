import { apiClient } from '@/lib/api-client';
import { db } from '@/lib/firebase-admin';
import type { City } from '@/types';
import { getDestinationData } from '@/data/destinations';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getPhaseMigrationMode, getCanaryRatio, inCanaryBucket } from '@/lib/api-migration/flags';
import { shadowCompare, diffJson } from '@/lib/api-migration/shadow';
import { safeLog } from '@/lib/api-migration/log';

// B6: كاش شبه ثابت 60s لبيانات المدن (أسماء/صور/عدادات) — تصنيف B.
// تُبطل عند إنشاء/تعديل/حذف مدينة (actions/cities.ts). عدادات الفنادق قد
// تتأخر ≤60s بعد نشر فندق (LOW RISK، موثق). الأسعار/التوفر لا تمر هنا إطلاقاً.
//
// Phase A (SHADOW only): عند MSARI_API_CITIES_MODE=shadow تُقارَن النتيجة المباشرة
// مع GET /v1/cities ويُسجَّل الفرق، مع خدمة المباشر دائماً. الوضع الافتراضي OFF:
// صفر تغيير سلوكي. مفتاح الخادم المؤقت هو قيمة NEXT_PUBLIC_API_KEY المقروءة
// خادمياً فقط (لا تعرض جديد؛ الاعتماد server-only لاحقاً عند توفره).
async function fetchActiveCitiesViaApi(limit: number): Promise<Array<{
  id: string; name: string; nameEn: string; image: string; hotelCount: number;
}>> {
  const base = (
    process.env.MSARI_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://us-central1-msariapp-v2.cloudfunctions.net/api/v1'
  ).replace(/\/$/, '');
  const key = process.env.MSARI_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
  // Bounded 8s (same rationale as hotels adapter): on serverless timeouts the
  // caller must retain budget for the direct-Firestore fallback.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${base}/cities`, {
      headers: key ? { 'x-api-key': key } : {},
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API /v1/cities -> HTTP ${res.status}`);
  const body = (await res.json()) as { data?: Array<{
    id: string; nameAr?: string; name?: string; nameEn?: string;
    imageUrl?: string; image?: string; hotelCount?: number;
  }> };
  const list = Array.isArray(body?.data) ? body.data : [];
  return list.map((c) => ({
    id: String(c.id ?? ''),
    name: String(c.nameAr ?? c.name ?? ''),
    nameEn: String(c.nameEn ?? ''),
    image: String(c.imageUrl ?? c.image ?? ''),
    hotelCount: typeof c.hotelCount === 'number' ? c.hotelCount : -1,
  })).slice(0, limit);
  } finally {
    clearTimeout(timeout);
  }
}
/** Direct Firestore fetch (destinations + JS hotel counts). Primary before C5;
 * explicit resilience fallback from C5 onward. Never deleted (rollback path). */
async function fetchActiveCitiesDirect(limit: number): Promise<City[]> {
  let cities: City[] = [];

  // Query Firestore destinations directly for fast response
  const snap = await db.collection("destinations").get();
  const validDocs = snap.docs.filter((doc) => doc.data().isDeleted !== true);
    if (validDocs.length > 0) {
      cities = validDocs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || d.nameAr || '',
          nameEn: d.nameEn || '',
          governorate: d.name || d.nameAr || '',
          governorateEn: d.nameEn || '',
          image: d.imageUrl || '',
          hotelCount: 0,
          isActive: true,
        };
      });
    } else {
      cities = await apiClient.getCities();
    }

    const hotelsSnap = await db.collection('hotels').get();
    const hotels = hotelsSnap.docs.map((doc) => doc.data());

    const mapped = cities.map((city) => {
      const hotelCount = hotels.filter((h) => {
        const dest = (h.destination || '').toLowerCase();
        const isMatch =
          dest === city.id.toLowerCase() ||
          (city.nameEn && dest === city.nameEn.toLowerCase()) ||
          (city.name && dest === city.name.toLowerCase()) ||
          h.cityId === city.id ||
          h.city === city.name ||
          h.cityEn === city.nameEn;
        return isMatch && h.isPublished !== false && h.isDeleted !== true;
      }).length;

      return {
        ...city,
        hotelCount,
      };
    });

    const result = mapped.slice(0, limit);
    return result;
}

async function fetchActiveCitiesFresh(limit: number): Promise<City[]> {
  try {
    // Phase C5 (CUTOVER): default ON — API is primary, direct is explicit
    // resilience fallback (logged, never silent). Rollback = MSARI_API_CITIES_MODE=off.
    // NOTE: unstable_cache (60s) sits above: mode applies per cache-miss window.
    let mode: 'OFF' | 'SHADOW' | 'CANARY' | 'ON' = 'ON';
    try {
      mode =
        process.env.MSARI_API_CITIES_MODE !== undefined
          ? getPhaseMigrationMode('cities')
          : 'ON';
    } catch {
      mode = 'OFF';
    }

    if (mode === 'ON') {
      try {
        const apiList = await fetchActiveCitiesViaApi(limit);
        const served = apiList.map((a) => ({
          id: a.id,
          name: a.name,
          nameEn: a.nameEn,
          governorate: a.name,
          governorateEn: a.nameEn,
          image: a.image,
          hotelCount: a.hotelCount,
          isActive: true,
        })) as City[];
        try {
          safeLog('cities-serve', { servedFrom: 'api', count: served.length });
        } catch { /* never break */ }
        return served;
      } catch (e) {
        try {
          safeLog('cities-serve', {
            servedFrom: 'direct-fallback',
            reason: e instanceof Error ? e.message.slice(0, 120) : String(e).slice(0, 120),
          });
        } catch { /* never break */ }
        return fetchActiveCitiesDirect(limit);
      }
    }

    const result = await fetchActiveCitiesDirect(limit);

    const directSnapshot = result.map((c: City) => ({
      id: c.id, name: c.name, nameEn: c.nameEn, image: c.image, hotelCount: c.hotelCount,
    }));

    if (mode === 'CANARY' && result.length > 0) {
      try {
        const ratio = getCanaryRatio();
        const bucketKey = `cities:${limit}:${Math.floor(Date.now() / 60000)}`;
        if (inCanaryBucket(bucketKey, ratio)) {
          const apiList = await fetchActiveCitiesViaApi(limit);
          const order = new Map(result.map((c, i) => [c.id, i] as const));
          const sameSet =
            apiList.length === result.length && apiList.every((a) => order.has(a.id));
          if (sameSet) {
            const ordered = [...apiList].sort((a, b) => order.get(a.id)! - order.get(b.id)!);
            const diffs = diffJson(directSnapshot, ordered);
            if (diffs.length === 0) {
              try {
                safeLog('canary-serve', {
                  phase: 'cities', servedFrom: 'api', ratio, count: ordered.length,
                });
              } catch { /* never break */ }
              return ordered.map((a) => ({
                id: a.id,
                name: a.name,
                nameEn: a.nameEn,
                governorate: a.name,
                governorateEn: a.nameEn,
                image: a.image,
                hotelCount: a.hotelCount,
                isActive: true,
              })) as City[];
            }
            try {
              safeLog('canary-fallback', {
                phase: 'cities', servedFrom: 'direct', reason: 'diff', diffCount: diffs.length,
              });
            } catch { /* never break */ }
          }
        }
      } catch {
        // Any canary failure → serve direct below.
      }
    }

    if (mode !== 'OFF' && result.length > 0) {
      try {
        void shadowCompare({
          phase: 'cities',
          route: 'getActiveCities',
          direct: async () => directSnapshot,
          api: () => fetchActiveCitiesViaApi(limit),
          normalize: (v) => v,
        }).catch(() => {
          // الظل لا يكسر الطلب أبداً.
        });
      } catch {
        // الظل لا يكسر الطلب أبداً.
      }
    }

    return result;
  } catch (error) {
    console.error('Error in getActiveCities:', error);
    return [];
  }
}

const getActiveCitiesPersistent = unstable_cache(fetchActiveCitiesFresh, ['cities:active'], {
  revalidate: 60,
  tags: ['cities'],
});

export class CityService {
  /**
   * Fetch active cities with count of active hotels.
   * B5: per-request dedup — تُستدعى مرتين في نفس طلب الصفحة
   * (مباشرة + داخل getLocalHotels). cache() على مستوى الطلب فقط: لا stale.
   */
  static getActiveCities = cache((limit: number): Promise<City[]> => getActiveCitiesPersistent(limit));

  /**
   * Fetch all cities with count of all hotels
   */
  static async getAllCities(limit: number): Promise<City[]> {
    try {
      let cities: City[] = [];

      const snap = await db.collection("destinations").get();
      if (!snap.empty) {
        cities = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || d.nameAr || '',
            nameEn: d.nameEn || '',
            governorate: d.name || d.nameAr || '',
            governorateEn: d.nameEn || '',
            image: d.imageUrl || '',
            hotelCount: 0,
            isActive: true,
          };
        });
      } else {
        cities = await apiClient.getCities();
      }

      const hotelsSnap = await db.collection('hotels').get();
      const hotels = hotelsSnap.docs.map((doc) => doc.data());

      const mapped = cities.map((city) => {
        const hotelCount = hotels.filter((h) => {
          const dest = (h.destination || '').toLowerCase();
          const isMatch =
            dest === city.id.toLowerCase() ||
            (city.nameEn && dest === city.nameEn.toLowerCase()) ||
            (city.name && dest === city.name.toLowerCase()) ||
            h.cityId === city.id ||
            h.city === city.name ||
            h.cityEn === city.nameEn;
          return isMatch && h.isDeleted !== true;
        }).length;
        return {
          ...city,
          hotelCount,
        };
      });

      return mapped.slice(0, limit);
    } catch (error) {
      console.error('Error in getAllCities:', error);
      return [];
    }
  }

  static async createCity(data: {
    nameAr: string;
    nameEn: string;
    governorateAr: string;
    governorateEn: string;
    imageUrl?: string;
    isActive?: boolean;
  }): Promise<string> {
    const docRef = db.collection('destinations').doc();
    await docRef.set({
      id: docRef.id,
      name: data.nameAr,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      governorate: data.governorateAr,
      governorateEn: data.governorateEn,
      imageUrl: data.imageUrl || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  static async updateCity(
    id: string,
    data: Partial<{
      nameAr: string;
      nameEn: string;
      governorateAr: string;
      governorateEn: string;
      imageUrl?: string;
      isActive: boolean;
    }>
  ): Promise<void> {
    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (data.nameAr !== undefined) {
      updatePayload.name = data.nameAr;
      updatePayload.nameAr = data.nameAr;
    }
    if (data.nameEn !== undefined) updatePayload.nameEn = data.nameEn;
    if (data.governorateAr !== undefined) updatePayload.governorate = data.governorateAr;
    if (data.governorateEn !== undefined) updatePayload.governorateEn = data.governorateEn;
    if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    await db.collection('destinations').doc(id).update(updatePayload);
  }

  static async deleteCity(id: string): Promise<void> {
    await db.collection('destinations').doc(id).update({
      isDeleted: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Resolves a destination by slug or city name and combines Firestore operational data + CMS editorial guide.
   * B4: per-request dedup — generateMetadata و Page يطلبانها معاً. cache() فقط.
   */
  static getDestinationBySlug = cache(async (slug: string) => {
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Resolve operational city identity — API-first (C5), direct scan fallback.
    // Same fuzzy predicate on both paths; API rows carry {id, name, nameEn}.
    const norm = (s: string) => s.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').trim().toLowerCase();
    const slugNorm = norm(cleanSlug);
    const matchesSlug = (id: string, nameAr: string, nameEn: string) =>
      id.toLowerCase() === cleanSlug ||
      (nameAr !== '' && norm(nameAr).includes(slugNorm)) ||
      (nameEn !== '' && nameEn.toLowerCase().includes(cleanSlug));

    let citiesMode: string = 'ON';
    try {
      citiesMode =
        process.env.MSARI_API_CITIES_MODE !== undefined
          ? getPhaseMigrationMode('cities')
          : 'ON';
    } catch {
      citiesMode = 'OFF';
    }

    let firestoreCity: any = null;
    if (citiesMode === 'ON') {
      try {
        const apiCities = await fetchActiveCitiesViaApi(100);
        const hit = apiCities.find((c) => matchesSlug(c.id, c.name, c.nameEn));
        if (hit) {
          firestoreCity = {
            id: hit.id, name: hit.name, nameAr: hit.name,
            nameEn: hit.nameEn, imageUrl: hit.image,
          };
          try {
            safeLog('cities-serve', { route: 'getDestinationBySlug', servedFrom: 'api', id: hit.id });
          } catch { /* never break */ }
        }
      } catch {
        // Fall through to the direct scan below (explicit fallback).
      }
    }
    if (!firestoreCity) {
      // Direct Firestore destinations scan (Core SoT read; fallback/resilience path).
      const snap = await db.collection("destinations").get();

      snap.docs.forEach(doc => {
        const d = doc.data();
        const nameAr = d.name || d.nameAr || '';
        const nameEn = d.nameEn || '';
        if (matchesSlug(doc.id, nameAr, nameEn)) {
          firestoreCity = { id: doc.id, ...d };
        }
      });
    }

    // 2. Fetch editorial CMS content from website_destinations (Editorial SoT)
    const { DestinationsCmsService } = await import('@/services/cms');
    const editorial = await DestinationsCmsService.getEditorialGuide(cleanSlug);
    const curated = getDestinationData(cleanSlug);

    const cityName = firestoreCity?.name || firestoreCity?.nameAr || curated?.name || cleanSlug;
    const cityNameEn = firestoreCity?.nameEn || curated?.nameEn || cleanSlug;

    // 3. Fetch operational hotels for this destination
    const { getLocalHotels } = await import('@/actions/hotels');
    const { data: hotels = [] } = await getLocalHotels({ city: cityName, pageSize: 100 });

    return {
      id: firestoreCity?.id || curated?.id || cleanSlug,
      slug: cleanSlug,
      name: cityName,
      nameEn: cityNameEn,
      governorate: firestoreCity?.governorate || curated?.governorate || 'اليمن',
      governorateEn: firestoreCity?.governorateEn || curated?.governorateEn || 'Yemen',
      heroImage: editorial?.heroImage || firestoreCity?.heroImage || firestoreCity?.imageUrl || curated?.heroImage || '/images/destinations/sanaa.jpg',
      tagline: editorial?.tagline || curated?.tagline || `اكتشف أجمل المعالم والفنادق في ${cityName}`,
      overview: {
        history: editorial?.overview?.history || curated?.overview?.history || `تعتبر ${cityName} من أهم المدن اليمنية التاريخية والثقافية وتتميز بعمارتها العريقة وطبيعتها الساحرة.`,
        climate: editorial?.overview?.climate || curated?.overview?.climate || `مناخ معتدل ولطيف يتيح للزوار التمتع بالأجواء الأنيقة والتجول في أرجاء المدينة.`,
        culture: editorial?.overview?.culture || curated?.overview?.culture || `ثقافة غنية بالتقاليد الشعبية والأسواق التراثية والمأكولات اليمنية الشهيرة.`,
        bestTimeToVisit: editorial?.overview?.bestTimeToVisit || curated?.overview?.bestTimeToVisit || `متاحة للزيارة والاستمتاع بطقسها ورونقها على مدار العام.`,
      },
      landmarks: Array.isArray(editorial?.landmarks) && editorial.landmarks.length > 0
        ? editorial.landmarks
        : (Array.isArray(curated?.landmarks) && curated.landmarks.length > 0 ? curated.landmarks : []),
      hotelCount: hotels.length,
      rawHotels: hotels,
    };
  });
}
