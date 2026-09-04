'use server';

/**
 * actions/hotels.ts — Server Actions لجلب بيانات الفنادق من Firestore و Cloud Functions.
 */

import { apiClient, mapApiHotelToHotel, mapApiRoomToRoom, generateSlugFromHotel } from '@/lib/api-client';
import type { Hotel } from '@/types';
import { clampLimit } from '@/lib/action-utils';
import { db } from '@/lib/firebase-admin';
import { CityService } from '@/services/city.service';
import { unstable_cache } from 'next/cache';

// Phase 2: كاش 60s لقوائم الفنادق (قرار المستخدم) — تُبطلها mutations الفنادق عبر tag 'hotels'
const HOTELS_REVALIDATE = 60;

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
};

export async function getLocalHotels(params?: GetLocalHotelsParams): Promise<{
  data:     Hotel[];
  total:    number;
  page:     number;
  pageSize: number;
}> {
  // Normalise params so the cache key is stable (clampLimit also guards junk input)
  const normalised = {
    city: params?.city,
    q: params?.q,
    minPrice: params?.minPrice,
    maxPrice: params?.maxPrice,
    ratings: params?.ratings ? [...params.ratings].sort((a, b) => a - b) : undefined,
    sort: params?.sort ?? 'recommended',
    page: Math.max(1, params?.page ?? 1),
    pageSize: clampLimit(params?.pageSize, 12, 100),
  };
  return getLocalHotelsCached(normalised);
}

const getLocalHotelsCached = unstable_cache(
  async (params: {
    city?: string;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    ratings?: number[];
    sort?: 'recommended' | 'price_asc' | 'price_desc' | 'rating';
    page: number;
    pageSize: number;
  }): Promise<{
    data:     Hotel[];
    total:    number;
    page:     number;
    pageSize: number;
  }> => {
  const page      = params.page;
  const pageSize  = params.pageSize;
  const skip      = (page - 1) * pageSize;

  try {
    const apiCities = await CityService.getActiveCities(100);

    // جلب الوثائق المنشورة من Firestore دون استبعاد الوثائق التي تفتقر لحقل isDeleted: false
    const snapshot = await db.collection("hotels")
      .where("isPublished", "==", true)
      .get();

    const hotelDocs = snapshot.docs.filter(doc => doc.data().isDeleted !== true);

    // Phase 2 (N+1 fix): نبني السعر الصريح أولاً WITHOUT أي قراءة rooms،
    // ثم نصفّي/نرتّب/نرقّم، ثم نجلب rooms للشريحة المعروضة فقط (≤ pageSize بدل كل الفنادق)
    type Prepared = { docId: string; data: FirebaseFirestore.DocumentData; explicitPrice: number; starsCount: number };
    const prepared: Prepared[] = hotelDocs.map((doc) => {
      const data = doc.data();
      return {
        docId: doc.id,
        data,
        starsCount: Math.max(1, Math.min(5, Number(data.stars) || 3)),
        explicitPrice: Number(data.price || data.priceFrom || data.minPrice || data.startingPrice || 0),
      };
    });

    const toHotel = (
      p: Prepared,
      minRoomPrice: number,
    ): Hotel => {
      const { data, starsCount, explicitPrice } = p;
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
        id: p.docId,
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
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isDeleted: data.isDeleted || false,
      };

      return mapApiHotelToHotel(apiHotel, [], apiCities);
    };

    // 4. تطبيق الفلترة في الذاكرة خادمياً (على السعر الصريح أولياً)
    let filtered = prepared.filter((p) => {
      const probe = toHotel(p, 0);
      if (!probe.isActive) return false;

      if (params?.city) {
        const cityFilter = params.city.toLowerCase().trim();
        const matchesCity =
          (probe.city && probe.city.toLowerCase().includes(cityFilter)) ||
          (probe.cityEn && probe.cityEn.toLowerCase().includes(cityFilter)) ||
          (probe.cityId && probe.cityId.toLowerCase() === cityFilter) ||
          (probe.governorate && probe.governorate.toLowerCase().includes(cityFilter));
        if (!matchesCity) return false;
      }

      if (params?.q) {
        const q = params.q.toLowerCase().trim();
        const matchesName = probe.name.toLowerCase().includes(q) || probe.nameEn.toLowerCase().includes(q);
        const matchesAddress = probe.address.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress) return false;
      }

      if (params?.minPrice !== undefined && params?.maxPrice !== undefined) {
        if (probe.priceFrom < params.minPrice || probe.priceFrom > params.maxPrice) {
          return false;
        }
      }

      if (params?.ratings?.length) {
        if (!params.ratings.includes(probe.stars)) {
          return false;
        }
      }

      return true;
    });

    // 5. تطبيق الترتيب (على السعر الصريح؛ يُعاد ضبط الصفحة المعروضة بعد تكرير الأسعار)
    if (params?.sort === 'price_asc') {
      filtered.sort((a, b) => a.explicitPrice - b.explicitPrice);
    } else if (params?.sort === 'price_desc') {
      filtered.sort((a, b) => b.explicitPrice - a.explicitPrice);
    } else if (params?.sort === 'rating') {
      filtered.sort((a, b) => toHotel(b, 0).rating - toHotel(a, 0).rating);
    } else {
      filtered.sort((a, b) => {
        const ah = a.data.isFeatured ? 1 : 0;
        const bh = b.data.isFeatured ? 1 : 0;
        if (ah !== bh) return bh - ah;
        const at = a.data.createdAt?.toDate?.()?.getTime?.() ?? 0;
        const bt = b.data.createdAt?.toDate?.()?.getTime?.() ?? 0;
        return bt - at;
      });
    }

    const total = filtered.length;
    const pageSlice = filtered.slice(skip, skip + pageSize);

    // rooms للشريحة المعروضة فقط — من O(N) إلى O(pageSize)
    const hotels: Hotel[] = await Promise.all(pageSlice.map(async (p) => {
      let minRoomPrice = 0;
      // تخطّي قراءة rooms عند وجود سعر صريح؟ لا — الغرف قد تكون أرخص، لكن نقرأ فقط لصفحة العرض
      try {
        const roomsSnap = await db.collection("hotels").doc(p.docId).collection("rooms")
          .select('price', 'pricePerNight', 'isDeleted')
          .get();
        if (!roomsSnap.empty) {
          const prices = roomsSnap.docs
            .filter(rdoc => rdoc.data().isDeleted !== true)
            .map(rdoc => Number(rdoc.data().price || rdoc.data().pricePerNight || 0))
            .filter(pr => pr > 0);
          if (prices.length > 0) {
            minRoomPrice = Math.min(...prices);
          }
        }
      } catch {
        // ignore fallback
      }
      return toHotel(p, minRoomPrice);
    }));

    // إعادة ترتيب الشريحة بالسعر النهائي عند فرز سعري
    if (params?.sort === 'price_asc') {
      hotels.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (params?.sort === 'price_desc') {
      hotels.sort((a, b) => b.priceFrom - a.priceFrom);
    }

    return {
      data: hotels,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Error fetching local hotels:', error);
    return { data: [], total: 0, page: 1, pageSize: 12 };
  }
  },
  ['hotels:list'],
  { revalidate: HOTELS_REVALIDATE, tags: ['hotels'] }
);

// Admin/Public fetch all hotels using getLocalHotels
export async function getHotels(params?: GetLocalHotelsParams) {
  return getLocalHotels(params);
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {

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
      console.warn('Error fetching room subcollection for hotel:', foundDoc.id, e);
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
      createdAt: foundDoc.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: foundDoc.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      isDeleted: foundDoc.isDeleted || false,
    };

    return mapApiHotelToHotel(apiHotel, rooms, apiCities);
  } catch (error) {
    console.error('Error fetching hotel by slug:', error);
    return null;
  }
}

function mapAmenitiesToDTO(rawAmenities: any): any[] {
  if (!Array.isArray(rawAmenities)) return [];
  return rawAmenities.map((a: any, idx: number) => {
    if (typeof a === 'string') {
      return {
        id: `amenity-${idx}`,
        name: { ar: a, en: a },
        iconKey: a.toLowerCase(),
        isFeatured: true
      };
    }
    if (typeof a === 'object' && a !== null) {
      const arName = a.ar || a.nameAr || a.name || '';
      const enName = a.en || a.nameEn || a.name || '';
      const iconKey = a.icon || a.key || a.iconKey || '';
      return {
        id: a.id || `amenity-${idx}`,
        name: { ar: arName, en: enName },
        iconKey: iconKey,
        isFeatured: true
      };
    }
    return {
      id: `amenity-${idx}`,
      name: { ar: '', en: '' },
      iconKey: '',
      isFeatured: false
    };
  });
}
