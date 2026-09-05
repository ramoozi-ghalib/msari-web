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

export async function getLocalHotels(params?: GetLocalHotelsParams): Promise<{
  data:     Hotel[];
  total:    number;
  page:     number;
  pageSize: number;
}> {
  const page      = Math.max(1, params?.page ?? 1);
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

    // 4. تطبيق الفلترة في الذاكرة خادمياً
    hotels = hotels.filter((hotel) => {
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

      if (params?.minPrice !== undefined && params?.maxPrice !== undefined) {
        if (hotel.priceFrom < params.minPrice || hotel.priceFrom > params.maxPrice) {
          return false;
        }
      }

      if (params?.ratings?.length) {
        if (!params.ratings.includes(hotel.stars)) {
          return false;
        }
      }

      return true;
    });

    // 5. تطبيق الترتيب
    if (params?.sort === 'price_asc') {
      hotels.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (params?.sort === 'price_desc') {
      hotels.sort((a, b) => b.priceFrom - a.priceFrom);
    } else if (params?.sort === 'rating') {
      hotels.sort((a, b) => b.rating - a.rating);
    } else {
      // الترتيب الافتراضي: المميز أولاً، ثم الأحدث، ثم معرّف الوثيقة ككاسر
      // تعادل حتمي (P1: يمنع انزياح نوافذ slice بين الطلبات).
      hotels.sort((a, b) => {
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
        if (a.id === b.id) return 0;
        return a.id < b.id ? -1 : 1;
      });
    }

    const total = hotels.length;
    const paginatedHotels = hotels.slice(skip, skip + pageSize);

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

// Admin/Public fetch all hotels using getLocalHotels
export async function getHotels(params?: GetLocalHotelsParams) {
  return getLocalHotels(params);
}

// CLOSURE Phase 2 (nearby): جلب فنادق محددة بالمعرفات — قراءات مفردة محدودة
// (doc.get لكل معرف) بدل مسح المجموعة كاملة. تُطبق نفس فلاتر القائمة
// (isPublished + غير محذوف) ونفس حساب السعر النهائي تماماً، وتُحفظ رتبة الإدخال.
export async function getHotelsByIds(ids: string[]): Promise<Hotel[]> {
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

// B4: per-request dedup — generateMetadata و Page يطلبان نفس الفندق في نفس الطلب.
// cache() لا يشارك بين الطلبات: لا قيم stale عبر المستخدمين.
export const getHotelBySlug = cache(async (slug: string): Promise<Hotel | null> => {

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
});

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
