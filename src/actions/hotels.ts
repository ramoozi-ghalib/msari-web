'use server';

/**
 * actions/hotels.ts — Server Actions لجلب بيانات الفنادق من Firestore و Cloud Functions.
 */

import { apiClient, mapApiHotelToHotel, mapApiRoomToRoom, generateSlugFromHotel } from '@/lib/api-client';
import type { Hotel } from '@/types';
import { clampLimit } from '@/lib/action-utils';
import { db } from '@/lib/firebase-admin';
import { CityService } from '@/services/city.service';
import { cache } from 'react';
import { filterHotels, sortHotels, mapAmenitiesToDTO } from '@/lib/hotel-utils';
import { getPhaseMigrationMode, getCanaryRatio, inCanaryBucket } from '@/lib/api-migration/flags';
import { safeLog } from '@/lib/api-migration/log';
import { diffJson } from '@/lib/api-migration/shadow';
import {
  apiFetchAllHotels,
  apiFetchHotelBySlug,
  apiFetchHotelById,
  apiFetchRooms,
  toWebsiteHotel,
  applyWebsiteListSemantics,
} from '@/lib/api-migration/hotels-api';
import { mapApiCityToCity } from '@/lib/api-client';

type HotelsApiMode = 'OFF' | 'SHADOW' | 'CANARY' | 'ON';

/** Phase B migration flag (default CANARY 5%: diff-gated API serving with direct fallback).
 * ON is capped to CANARY until cutover approval. Rollback = MSARI_API_HOTELS_MODE=off. */
function getHotelsApiMode(): HotelsApiMode {
  try {
    if (process.env.MSARI_API_HOTELS_MODE !== undefined) {
      const m = getPhaseMigrationMode('hotels' as never);
      return m === 'ON' ? 'CANARY' : m;
    }
    return 'CANARY';
  } catch {
    return 'OFF';
  }
}

function stripVolatile(hotel: Hotel): unknown {
  const { updatedAt: _u, ...rest } = hotel as unknown as Record<string, unknown>;
  void _u;
  return rest;
}

/** API cities for mapping (transitional: direct getActiveCities stays authoritative elsewhere). */
async function fetchApiCitiesForMapping(): Promise<import('@/types').City[]> {
  const { getServerApiBaseUrl, getServerApiKey } = await import('@/lib/api-migration/msari-api');
  const base = getServerApiBaseUrl();
  const res = await fetch(`${base}/cities`, {
    headers: { 'x-api-key': getServerApiKey() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API /v1/cities -> HTTP ${res.status}`);
  const body = (await res.json()) as { data?: any[] };
  const list = Array.isArray(body?.data) ? body.data : [];
  return list.map((c: any) => mapApiCityToCity(c, c.hotelCount ?? 0));
}

export type GetLocalHotelsParams = {
  limit?:    unknown;
  city?:     string;   // nameAr للمدينة
  q?:        string;   // بحث نصي
  minPrice?: number;
  maxPrice?: number;
  ratings?:  number[]; // [1,2,3,4,5]
  sort?:     'recommended' | 'price_asc' | 'price_desc' | 'rating';
  page?:     number;
  pageSize?: number;
  // CLOSURE Phase 2: تخطّي أسعار الغرف (تُستخدم مع التكرير اللاحق عبر getHotelsByIds).
  // داخلي فقط — لا يغيّر أي سلوك عام ما لم يُمرَّر صراحةً.
  skipRoomPrices?: boolean;
};

export async function getLocalHotelsDirect(params?: GetLocalHotelsParams): Promise<{
  data:     Hotel[];
  total:    number;
  page:     number;
  pageSize: number;
}> {  const page      = Math.max(1, params?.page ?? 1);
  const pageSize  = clampLimit(params?.pageSize, 12, 100);
  const skip      = (page - 1) * pageSize;

  try {
    const apiCities = await CityService.getActiveCities(100);

    // جلب الوثائق المنشورة من Firestore دون استبعاد الوثائق التي تفتقر لحقل isDeleted: false
    const snapshot = await db.collection("hotels")
      .where("isPublished", "==", true)
      .get();

    const hotelDocs = snapshot.docs.filter(doc => doc.data().isDeleted !== true);

    // B1: مسار الشريحة — عندما لا تدخل أسعار الغرف في الفرز/الفلترة
    // (الموصى به/التقييم، بلا min/max)، نحدد الشريحة أولاً ثم نجلب الغرف لها فقط.
    // القيم المستخدمة (isActive/city/q/stars/isFeatured/createdAt/id) لا تتأثر بالغرف،
    // فيبقى التحديد والترتيب والمجموع مطابقين تماماً للمسار الكامل أدناه.
    const priceSensitive =
      params?.sort === 'price_asc' ||
      params?.sort === 'price_desc' ||
      params?.minPrice !== undefined ||
      params?.maxPrice !== undefined;

    if (!priceSensitive) {
      type SlicePrep = {
        docId: string;
        data: FirebaseFirestore.DocumentData;
        hotel: Hotel;
      };
      const buildProbe = (doc: FirebaseFirestore.QueryDocumentSnapshot): SlicePrep | null => {
        const data = doc.data();
        const starsCount = Math.max(1, Math.min(5, Number(data.stars) || 3));
        const explicitPrice = Number(data.price || data.priceFrom || data.minPrice || data.startingPrice || 0);
        const finalMinPrice = explicitPrice > 0 ? explicitPrice : 30;
        const apiHotel: any = {
          id: doc.id,
          destination: data.destination || '',
          name: data.name || { ar: '', en: '' },
          address: data.address || { ar: '', en: '' },
          overview: data.overview || { ar: '', en: '' },
          mainImageUrl: data.mainImageUrl || '',
          images: data.images || [],
          amenities: mapAmenitiesToDTO(data.amenities),
          policies: (data.policies || []).map((pol: any) => {
            if (typeof pol === 'object' && pol !== null) {
              return pol.ar || pol.en || '';
            }
            return String(pol);
          }),
          stars: starsCount,
          price: finalMinPrice,
          isSpecial: data.isSpecial || false,
          isPublished: data.isPublished !== false,
          mapLink: data.mapLink || data.mapUrl || '',
          lat: data.lat || data.latitude || data.location?.latitude || data.location?._latitude || data.coordinates?.lat,
          lng: data.lng || data.longitude || data.location?.longitude || data.location?._longitude || data.coordinates?.lng,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || '1970-01-01T00:00:00.000Z',
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          isDeleted: data.isDeleted || false,
        };
        return { docId: doc.id, data, hotel: mapApiHotelToHotel(apiHotel, [], apiCities) };
      };

      const sortSlice = (
        list: SlicePrep[],
        cmp: (a: Hotel, b: Hotel, ai: SlicePrep, bi: SlicePrep) => number
      ): SlicePrep[] => [...list].sort((x, y) => cmp(x.hotel, y.hotel, x, y));

      const byIdTiebreak = (a: SlicePrep, b: SlicePrep): number => {
        if (a.docId === b.docId) return 0;
        return a.docId < b.docId ? -1 : 1;
      };

      let candidates = hotelDocs
        .map(buildProbe)
        .filter((p): p is SlicePrep => {
          if (!p) return false;
          const hotel = p.hotel;
          if (!hotel.isActive) return false;
          if (params?.city) {
            const cityFilter = params.city.toLowerCase().trim();
            const matchesCity =
              (hotel.city && hotel.city.toLowerCase().includes(cityFilter)) ||
              (hotel.cityEn && hotel.cityEn.toLowerCase().includes(cityFilter)) ||
              (hotel.cityId && hotel.cityId.toLowerCase() === cityFilter) ||
              (hotel.governorate && hotel.governorate.toLowerCase().includes(cityFilter));
            if (!matchesCity) return false;
          }
          if (params?.q) {
            const q = params.q.toLowerCase().trim();
            const matchesName = hotel.name.toLowerCase().includes(q) || hotel.nameEn.toLowerCase().includes(q);
            const matchesAddress = hotel.address.toLowerCase().includes(q);
            if (!matchesName && !matchesAddress) return false;
          }
          if (params?.ratings?.length) {
            if (!params.ratings.includes(hotel.stars)) return false;
          }
          return true;
        });

      if (params?.sort === 'rating') {
        // rating ثابت (4.5) → الفرز القديم كان اعتباطياً؛ كاسر id يجعله حتمياً.
        candidates = sortSlice(candidates, (a, b, ai, bi) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return byIdTiebreak(ai, bi);
        });
      } else {
        // الموصى به: نفس comparator المسار الكامل (مميز → أحدث → id).
        candidates = sortSlice(candidates, (a, b, ai, bi) => {
          if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1;
          }
          const bt = new Date(b.createdAt).getTime();
          const at = new Date(a.createdAt).getTime();
          const safeBt = Number.isNaN(bt) ? 0 : bt;
          const safeAt = Number.isNaN(at) ? 0 : at;
          if (safeBt !== safeAt) {
            return safeBt - safeAt;
          }
          return byIdTiebreak(ai, bi);
        });
      }

      const total = candidates.length;
      const slice = candidates.slice(skip, skip + pageSize);
      // نفس حساب السعر النهائي تماماً، لكن ل فنادق الشريحة فقط (≤pageSize بدل N).
      // skipRoomPrices: تُستخدم مع التكرير اللاحق عبر getHotelsByIds (nearby) —
      // لا تُمرَّر من أي مسار عرض مباشر.
      const skipRooms = params?.skipRoomPrices === true;
      const paginatedHotels = await Promise.all(
        slice.map(async ({ docId, data }) => {
          let minRoomPrice = 0;
          if (!skipRooms) {
          try {
            const roomsSnap = await db.collection("hotels").doc(docId).collection("rooms").get();
            if (!roomsSnap.empty) {
              const prices = roomsSnap.docs
                .filter(rdoc => rdoc.data().isDeleted !== true)
                .map(rdoc => Number(rdoc.data().price || rdoc.data().pricePerNight || 0))
                .filter(p => p > 0);
              if (prices.length > 0) {
                minRoomPrice = Math.min(...prices);
              }
            }
          } catch {
            // ignore fallback
          }
          }
          const explicitPrice = Number(data.price || data.priceFrom || data.minPrice || data.startingPrice || 0);
          let finalMinPrice = 0;
          if (explicitPrice > 0 && minRoomPrice > 0) {
            finalMinPrice = Math.min(explicitPrice, minRoomPrice);
          } else if (minRoomPrice > 0) {
            finalMinPrice = minRoomPrice;
          } else if (explicitPrice > 0) {
            finalMinPrice = explicitPrice;
          } else {
            finalMinPrice = 30;
          }
          const starsCount = Math.max(1, Math.min(5, Number(data.stars) || 3));
          const apiHotel: any = {
            id: docId,
            destination: data.destination || '',
            name: data.name || { ar: '', en: '' },
            address: data.address || { ar: '', en: '' },
            overview: data.overview || { ar: '', en: '' },
            mainImageUrl: data.mainImageUrl || '',
            images: data.images || [],
            amenities: mapAmenitiesToDTO(data.amenities),
            policies: (data.policies || []).map((pol: any) => {
              if (typeof pol === 'object' && pol !== null) {
                return pol.ar || pol.en || '';
              }
              return String(pol);
            }),
            stars: starsCount,
            price: finalMinPrice,
            isSpecial: data.isSpecial || false,
            isPublished: data.isPublished !== false,
            mapLink: data.mapLink || data.mapUrl || '',
            lat: data.lat || data.latitude || data.location?.latitude || data.location?._latitude || data.coordinates?.lat,
            lng: data.lng || data.longitude || data.location?.longitude || data.location?._longitude || data.coordinates?.lng,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || '1970-01-01T00:00:00.000Z',
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            isDeleted: data.isDeleted || false,
          };
          return mapApiHotelToHotel(apiHotel, [], apiCities);
        })
      );

      return {
        data: paginatedHotels,
        total,
        page,
        pageSize,
      };
    }

    let hotels: Hotel[] = await Promise.all(hotelDocs.map(async (doc) => {
      const data = doc.data();

      const starsCount = Math.max(1, Math.min(5, Number(data.stars) || 3));
      const explicitPrice = Number(data.price || data.priceFrom || data.minPrice || data.startingPrice || 0);

      let minRoomPrice = 0;
      try {
        const roomsSnap = await db.collection("hotels").doc(doc.id).collection("rooms").get();
        if (!roomsSnap.empty) {
          const prices = roomsSnap.docs
            .filter(rdoc => rdoc.data().isDeleted !== true)
            .map(rdoc => Number(rdoc.data().price || rdoc.data().pricePerNight || 0))
            .filter(p => p > 0);
          if (prices.length > 0) {
            minRoomPrice = Math.min(...prices);
          }
        }
      } catch (e) {
        // ignore fallback
      }

      let finalMinPrice = 0;
      if (explicitPrice > 0 && minRoomPrice > 0) {
        finalMinPrice = Math.min(explicitPrice, minRoomPrice);
      } else if (minRoomPrice > 0) {
        finalMinPrice = minRoomPrice;
      } else if (explicitPrice > 0) {
        finalMinPrice = explicitPrice;
      } else {
        finalMinPrice = 30;
      }

      const apiHotel: any = {
        id: doc.id,
        destination: data.destination || '',
        name: data.name || { ar: '', en: '' },
        address: data.address || { ar: '', en: '' },
        overview: data.overview || { ar: '', en: '' },
        mainImageUrl: data.mainImageUrl || '',
        images: data.images || [],
        amenities: mapAmenitiesToDTO(data.amenities),
        policies: (data.policies || []).map((p: any) => {
          if (typeof p === 'object' && p !== null) {
            return p.ar || p.en || '';
          }
          return String(p);
        }),
        stars: starsCount,
        price: finalMinPrice,
        isSpecial: data.isSpecial || false,
        isPublished: data.isPublished !== false,
        mapLink: data.mapLink || data.mapUrl || '',
        lat: data.lat || data.latitude || data.location?.latitude || data.location?._latitude || data.coordinates?.lat,
        lng: data.lng || data.longitude || data.location?.longitude || data.location?._longitude || data.coordinates?.lng,
        // P1: fallback حتمي — new Date() كان يولّد طابعاً مختلفاً كل طلب (بعد awaits
        // متداخلة زمنياً) فيكسر حتمية الفرز. القيمة الثابتة تحفظ الترتيب عبر الطلبات.
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '1970-01-01T00:00:00.000Z',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isDeleted: data.isDeleted || false,
      };

      return mapApiHotelToHotel(apiHotel, [], apiCities);
    }));

    // 4+5. فلترة وفرز مشتركان مع مسار API (نفس الدلالة حرفياً — hotel-utils).
    hotels = filterHotels(hotels, params);
    const sortedHotels = sortHotels(hotels, params?.sort);

    const total = sortedHotels.length;
    const paginatedHotels = sortedHotels.slice(skip, skip + pageSize);

    return {
      data: paginatedHotels,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Error fetching local hotels:', error);
    return { data: [], total: 0, page: 1, pageSize: 12 };
  }
}

/** API equivalent of getLocalHotelsDirect (single bounded call, no rooms fan-out). */
async function getLocalHotelsViaApi(params?: GetLocalHotelsParams): Promise<{
  data: Hotel[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = clampLimit(params?.pageSize, 12, 100);
  const [{ hotels }, apiCities] = await Promise.all([
    apiFetchAllHotels(),
    fetchApiCitiesForMapping(),
  ]);
  return { ...applyWebsiteListSemantics(hotels, apiCities, params, page, pageSize), page, pageSize };
}

function compareHotelLists(a: Hotel[], b: Hotel[]): number {
  return diffJson(a.map(stripVolatile), b.map(stripVolatile)).length;
}

/**
 * Phase B router: OFF → direct only; SHADOW → serve direct + background compare;
 * CANARY → bucketed API serving with diff-gate fallback; ON → API with error fallback.
 * Default SHADOW. Rollback = MSARI_API_HOTELS_MODE=off (or revert).
 */
export async function getLocalHotels(params?: GetLocalHotelsParams): Promise<{
  data:     Hotel[];
  total:    number;
  page:     number;
  pageSize: number;
}> {
  const mode = getHotelsApiMode();
  if (mode === 'OFF') {
    return getLocalHotelsDirect(params);
  }
  if (mode === 'SHADOW') {
    const res = await getLocalHotelsDirect(params);
    void (async () => {
      try {
        const apiRes = await getLocalHotelsViaApi(params);
        const diffs = compareHotelLists(res.data, apiRes.data);
        safeLog('hotels-shadow', {
          route: 'getLocalHotels', params: params ?? null,
          match: diffs === 0 && res.total === apiRes.total, diffCount: diffs,
          totalDirect: res.total, totalApi: apiRes.total,
        });
      } catch (e) {
        safeLog('hotels-shadow', { route: 'getLocalHotels', error: e instanceof Error ? e.message : String(e) });
      }
    })().catch(() => undefined);
    return res;
  }
  if (mode === 'CANARY') {
    const ratio = getCanaryRatio();
    const key = `hotels:${JSON.stringify(params ?? {})}:${Math.floor(Date.now() / 60000)}`;
    if (inCanaryBucket(key, ratio)) {
      try {
        const [apiRes, directRes] = await Promise.all([
          getLocalHotelsViaApi(params),
          getLocalHotelsDirect(params),
        ]);
        const diffs = compareHotelLists(directRes.data, apiRes.data);
        safeLog('hotels-canary', {
          route: 'getLocalHotels', servedFrom: diffs === 0 && directRes.total === apiRes.total ? 'api' : 'direct',
          diffCount: diffs, ratio,
        });
        if (diffs === 0 && directRes.total === apiRes.total) return apiRes;
        return directRes;
      } catch {
        return getLocalHotelsDirect(params);
      }
    }
    return getLocalHotelsDirect(params);
  }
  // ON (post-cutover approval only): serve API, fallback direct on error.
  try {
    return await getLocalHotelsViaApi(params);
  } catch {
    return getLocalHotelsDirect(params);
  }
}

// Admin/Public fetch all hotels using getLocalHotels
export async function getHotels(params?: GetLocalHotelsParams) {
  return getLocalHotels(params);
}

// CLOSURE Phase 2 (nearby): جلب فنادق محددة بالمعرفات — قراءات مفردة محدودة
// (doc.get لكل معرف) بدل مسح المجموعة كاملة. تُطبق نفس فلاتر القائمة
// (isPublished + غير محذوف) ونفس حساب السعر النهائي تماماً، وتُحفظ رتبة الإدخال.
export async function getHotelsByIdsDirect(ids: string[]): Promise<Hotel[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];
  try {
    const apiCities = await CityService.getActiveCities(100);
    const results = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const doc = await db.collection("hotels").doc(id).get();
          if (!doc.exists) return null;
          const data = doc.data() as FirebaseFirestore.DocumentData;
          if (data.isPublished !== true || data.isDeleted === true) return null;

          let minRoomPrice = 0;
          try {
            const roomsSnap = await db.collection("hotels").doc(id).collection("rooms").get();
            if (!roomsSnap.empty) {
              const prices = roomsSnap.docs
                .filter(rdoc => rdoc.data().isDeleted !== true)
                .map(rdoc => Number(rdoc.data().price || rdoc.data().pricePerNight || 0))
                .filter(p => p > 0);
              if (prices.length > 0) {
                minRoomPrice = Math.min(...prices);
              }
            }
          } catch {
            // ignore fallback
          }
          const explicitPrice = Number(data.price || data.priceFrom || data.minPrice || data.startingPrice || 0);
          let finalMinPrice = 0;
          if (explicitPrice > 0 && minRoomPrice > 0) {
            finalMinPrice = Math.min(explicitPrice, minRoomPrice);
          } else if (minRoomPrice > 0) {
            finalMinPrice = minRoomPrice;
          } else if (explicitPrice > 0) {
            finalMinPrice = explicitPrice;
          } else {
            finalMinPrice = 30;
          }
          const starsCount = Math.max(1, Math.min(5, Number(data.stars) || 3));
          const apiHotel: any = {
            id: doc.id,
            destination: data.destination || '',
            name: data.name || { ar: '', en: '' },
            address: data.address || { ar: '', en: '' },
            overview: data.overview || { ar: '', en: '' },
            mainImageUrl: data.mainImageUrl || '',
            images: data.images || [],
            amenities: mapAmenitiesToDTO(data.amenities),
            policies: (data.policies || []).map((pol: any) => {
              if (typeof pol === 'object' && pol !== null) {
                return pol.ar || pol.en || '';
              }
              return String(pol);
            }),
            stars: starsCount,
            price: finalMinPrice,
            isSpecial: data.isSpecial || false,
            isPublished: data.isPublished !== false,
            mapLink: data.mapLink || data.mapUrl || '',
            lat: data.lat || data.latitude || data.location?.latitude || data.location?._latitude || data.coordinates?.lat,
            lng: data.lng || data.longitude || data.location?.longitude || data.location?._longitude || data.coordinates?.lng,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || '1970-01-01T00:00:00.000Z',
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            isDeleted: data.isDeleted || false,
          };
          return mapApiHotelToHotel(apiHotel, [], apiCities);
        } catch {
          return null;
        }
      })
    );
    const byId = new Map(results.filter((h): h is Hotel => h !== null).map((h) => [h.id, h]));
    return uniqueIds.map((id) => byId.get(id)).filter((h): h is Hotel => h !== undefined);
  } catch (error) {
    console.error('Error fetching hotels by ids:', error);
    return [];
  }
}

/** API equivalent of getHotelsByIdsDirect (bounded :id fetches, order preserved). */
async function getHotelsByIdsViaApi(ids: string[]): Promise<Hotel[]> {
  const { apiFetchHotelById, toWebsiteHotel } = await import('@/lib/api-migration/hotels-api');
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];
  const apiCities = await CityService.getActiveCities(100);
  const results = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const apiH = await apiFetchHotelById(id);
        if (!apiH || (apiH as any).isPublished === false || (apiH as any).isDeleted === true) return null;
        return toWebsiteHotel(apiH, apiCities, [], 'display');
      } catch {
        return null;
      }
    })
  );
  const byId = new Map(results.filter((h): h is Hotel => h !== null).map((h) => [h.id, h]));
  return uniqueIds.map((id) => byId.get(id)).filter((h): h is Hotel => h !== undefined);
}

/** Phase B router for id-batches (nearby). Same OFF/SHADOW/CANARY/ON semantics. */
export async function getHotelsByIds(ids: string[]): Promise<Hotel[]> {
  const mode = getHotelsApiMode();
  if (mode === 'OFF') {
    return getHotelsByIdsDirect(ids);
  }
  if (mode === 'SHADOW') {
    const res = await getHotelsByIdsDirect(ids);
    void (async () => {
      try {
        const apiRes = await getHotelsByIdsViaApi(ids);
        const diffs = compareHotelLists(res, apiRes);
        safeLog('hotels-shadow', { route: 'getHotelsByIds', count: ids.length, match: diffs === 0, diffCount: diffs });
      } catch (e) {
        safeLog('hotels-shadow', { route: 'getHotelsByIds', error: e instanceof Error ? e.message : String(e) });
      }
    })().catch(() => undefined);
    return res;
  }
  if (mode === 'CANARY') {
    const ratio = getCanaryRatio();
    const key = `ids:${ids.join(',')}:${Math.floor(Date.now() / 60000)}`;
    if (inCanaryBucket(key, ratio)) {
      try {
        const [apiRes, directRes] = await Promise.all([
          getHotelsByIdsViaApi(ids),
          getHotelsByIdsDirect(ids),
        ]);
        const diffs = compareHotelLists(directRes, apiRes);
        safeLog('hotels-canary', { route: 'getHotelsByIds', servedFrom: diffs === 0 ? 'api' : 'direct', diffCount: diffs, ratio });
        if (diffs === 0) return apiRes;
        return directRes;
      } catch {
        return getHotelsByIdsDirect(ids);
      }
    }
    return getHotelsByIdsDirect(ids);
  }
  try {
    return await getHotelsByIdsViaApi(ids);
  } catch {
    return getHotelsByIdsDirect(ids);
  }
}

// B4: per-request dedup — generateMetadata و Page يطلبان نفس الفندق في نفس الطلب.
// cache() لا يشارك بين الطلبات: لا قيم stale عبر المستخدمين.
export const getHotelBySlugDirect = async (slug: string): Promise<Hotel | null> => {

  try {
    const snapshot = await db.collection("hotels")
      .where("isPublished", "==", true)
      .get();

    let foundDoc: any = null;
    snapshot.docs.filter(doc => doc.data().isDeleted !== true).forEach(doc => {
      const data = doc.data();
      const nameEn = typeof data.name === 'object' ? data.name.en : '';
      const generatedSlug = generateSlugFromHotel(doc.id, nameEn);
      const generatedDocSlug = doc.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (
        doc.id === slug || 
        generatedSlug === slug || 
        generatedDocSlug === slug || 
        data.slug === slug
      ) {
        foundDoc = { id: doc.id, ...data };
      }
    });

    if (!foundDoc) {
      return null;
    }

    const apiCities = await CityService.getActiveCities(100);

    const rooms: any[] = [];
    try {
      const roomsSnapshot = await db.collection("hotels")
        .doc(foundDoc.id)
        .collection("rooms")
        .where("isPublished", "==", true)
        .get();

      roomsSnapshot.docs.filter(rdoc => rdoc.data().isDeleted !== true).forEach(rdoc => {
        const rdata = rdoc.data();
        const rawFeatures = rdata.features || rdata.amenities || [];
        rooms.push(mapApiRoomToRoom({
          id: rdoc.id,
          hotelId: foundDoc.id,
          name: rdata.name || { ar: '', en: '' },
          description: rdata.description || { ar: '', en: '' },
          price: Number(rdata.price || rdata.pricePerNight || 0),
          numberOfPersons: Number(rdata.numberOfPersons || rdata.capacity || rdata.maxGuests || 2),
          numberOfBeds: Number(rdata.numberOfBeds || 1),
          numberOfBathrooms: Number(rdata.numberOfBathrooms || 1),
          numberOfRooms: Number(rdata.numberOfRooms || 1),
          area: rdata.area || rdata.roomArea || rdata.space,
          images: rdata.images || (rdata.mainImageUrl ? [rdata.mainImageUrl] : []),
          mainImageUrl: rdata.mainImageUrl || '',
          features: mapAmenitiesToDTO(rawFeatures),
          isPublished: rdata.isPublished !== false,
          updatedAt: rdata.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  isDeleted: rdata.isDeleted || false,
        }));
      });
    } catch (e) {
      console.error('Error fetching room subcollection for hotel:', foundDoc.id, e);
    }

    const apiHotel: any = {
      id: foundDoc.id,
      destination: foundDoc.destination || '',
      name: foundDoc.name || { ar: '', en: '' },
      address: foundDoc.address || { ar: '', en: '' },
      overview: foundDoc.overview || { ar: '', en: '' },
      mainImageUrl: foundDoc.mainImageUrl || '',
      images: foundDoc.images || [],
      amenities: mapAmenitiesToDTO(foundDoc.amenities),
      policies: (foundDoc.policies || []).map((p: any) => {
        if (typeof p === 'object' && p !== null) {
          return p.ar || p.en || '';
        }
        return String(p);
      }),
      stars: Math.max(1, Math.min(5, Number(foundDoc.stars) || 3)),
      price: Number(foundDoc.price || foundDoc.priceFrom || 0),
      isSpecial: foundDoc.isSpecial || false,
      isPublished: foundDoc.isPublished !== false,
      mapLink: foundDoc.mapLink || foundDoc.mapUrl || '',
        lat: foundDoc.lat || foundDoc.latitude || foundDoc.location?.latitude || foundDoc.location?._latitude || foundDoc.coordinates?.lat,
        lng: foundDoc.lng || foundDoc.longitude || foundDoc.location?.longitude || foundDoc.location?._longitude || foundDoc.coordinates?.lng,
        // Deterministic fallback (matches getLocalHotels + API adapter): createdAt is
        // absent on all docs and never rendered in UI — only sort-ties on it (all tie).
        // The previous new-Date() fallback made every render differ; behavior identical.
        createdAt: foundDoc.createdAt?.toDate?.()?.toISOString() || '1970-01-01T00:00:00.000Z',
      updatedAt: foundDoc.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      isDeleted: foundDoc.isDeleted || false,
    };

    return mapApiHotelToHotel(apiHotel, rooms, apiCities);
  } catch (error) {
    console.error('Error fetching hotel by slug:', error);
    return null;
  }
};

/** API equivalent of getHotelBySlugDirect (by-slug + rooms, explicit price). */
async function getHotelBySlugViaApi(slug: string): Promise<Hotel | null> {
  const { apiFetchHotelBySlug, apiFetchHotelById, toWebsiteHotel } = await import(
    '@/lib/api-migration/hotels-api'
  );
  const clean = slug.trim().toLowerCase();
  let apiH = await apiFetchHotelBySlug(clean);
  if (!apiH) {
    // Mirror direct fallbacks (doc.id / generated slugs): single-doc fetch by id.
    apiH = await apiFetchHotelById(slug);
  }
  if (!apiH || (apiH as any).isPublished === false) return null;
  if ((apiH as any).isDeleted === true) return null;
  const apiCities = await CityService.getActiveCities(100);
  const { apiFetchRooms } = await import('@/lib/api-migration/hotels-api');
  const rooms = await apiFetchRooms((apiH as any).id);
  return toWebsiteHotel(apiH, apiCities, rooms, 'explicit');
}

/**
 * Phase B router (cached per request): OFF → direct; SHADOW → serve direct +
 * background compare; CANARY → bucketed API with diff-gate fallback; ON → API.
 * Default SHADOW. Rollback = MSARI_API_HOTELS_MODE=off (or revert).
 */
export const getHotelBySlug = cache(async (slug: string): Promise<Hotel | null> => {
  const mode = getHotelsApiMode();
  if (mode === 'OFF') {
    return getHotelBySlugDirect(slug);
  }
  if (mode === 'SHADOW') {
    const res = await getHotelBySlugDirect(slug);
    void (async () => {
      try {
        const apiRes = await getHotelBySlugViaApi(slug);
        const diffArr = diffJson(
          res ? [stripVolatile(res)] : [],
          apiRes ? [stripVolatile(apiRes)] : []
        );
        safeLog('hotels-shadow', {
          route: 'getHotelBySlug', slug,
          match: diffArr.length === 0, diffCount: diffArr.length,
          diffs: diffArr.slice(0, 5),
        });
      } catch (e) {
        safeLog('hotels-shadow', { route: 'getHotelBySlug', slug, error: e instanceof Error ? e.message : String(e) });
      }
    })().catch(() => undefined);
    return res;
  }
  if (mode === 'CANARY') {
    const ratio = getCanaryRatio();
    const key = `hotel:${slug}:${Math.floor(Date.now() / 60000)}`;
    if (inCanaryBucket(key, ratio)) {
      try {
        const [apiRes, directRes] = await Promise.all([
          getHotelBySlugViaApi(slug),
          getHotelBySlugDirect(slug),
        ]);
        const diffs = compareHotelLists(
          directRes ? [directRes] : [],
          apiRes ? [apiRes] : []
        );
        safeLog('hotels-canary', {
          route: 'getHotelBySlug', slug,
          servedFrom: diffs === 0 ? 'api' : 'direct', diffCount: diffs, ratio,
        });
        if (diffs === 0) return apiRes;
        return directRes;
      } catch {
        return getHotelBySlugDirect(slug);
      }
    }
    return getHotelBySlugDirect(slug);
  }
  try {
    return await getHotelBySlugViaApi(slug);
  } catch {
    return getHotelBySlugDirect(slug);
  }
});
