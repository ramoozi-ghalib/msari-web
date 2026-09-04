import { unstable_cache } from 'next/cache';
import { apiClient } from '@/lib/api-client';
import { db } from '@/lib/firebase-admin';
import type { City } from '@/types';
import { getDestinationData } from '@/data/destinations';

// Phase 2: كاش 60s لقراءات الصفحة الرئيسية + select() لتقليل حمولة عدّ الفنادق
const CITIES_REVALIDATE = 60;

export class CityService {
  /**
   * Fetch active cities with count of active hotels (cached 60s)
   */
  static getActiveCities = unstable_cache(
    async (limit: number): Promise<City[]> => {
      try {
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

        // عدّ الفنادق بحقول مصغّرة فقط بدل الوثائق الكاملة
        const hotelsSnap = await db.collection('hotels')
          .select('destination', 'cityId', 'city', 'cityEn', 'isPublished', 'isDeleted')
          .get();
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

        return mapped.slice(0, limit);
      } catch (error) {
        console.error('Error in getActiveCities:', error);
        return [];
      }
    },
    ['cities:active'],
    { revalidate: CITIES_REVALIDATE, tags: ['cities'] }
  );

  /**
   * Fetch all cities with count of all hotels (cached 60s)
   */
  static getAllCities = unstable_cache(
    async (limit: number): Promise<City[]> => {
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

        const hotelsSnap = await db.collection('hotels')
          .select('destination', 'cityId', 'city', 'cityEn', 'isDeleted')
          .get();
        const hotels = hotelsSnap.docs.map((doc) => doc.data());

        const mapped = cities.map((city) => {
          const hotelCount = hotels.filter((h) => {
            const d = (h.destination || '').toLowerCase();
            const isMatch =
              d === city.id.toLowerCase() ||
              (city.nameEn && d === city.nameEn.toLowerCase()) ||
              (city.name && d === city.name.toLowerCase()) ||
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
    },
    ['cities:all'],
    { revalidate: CITIES_REVALIDATE, tags: ['cities'] }
  );

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
   * Resolves a destination by slug or city name and combines Firestore operational data + CMS editorial guide
   */
  static async getDestinationBySlug(slug: string) {
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Look up operational city from Firestore destinations collection (Core SoT)
    const snap = await db.collection("destinations").get();
    let firestoreCity: any = null;

    const norm = (s: string) => s.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').trim().toLowerCase();
    const slugNorm = norm(cleanSlug);

    snap.docs.forEach(doc => {
      const d = doc.data();
      const nameAr = d.name || d.nameAr || '';
      const nameEn = d.nameEn || '';
      if (doc.id.toLowerCase() === cleanSlug || norm(nameAr).includes(slugNorm) || nameEn.toLowerCase().includes(cleanSlug)) {
        firestoreCity = { id: doc.id, ...d };
      }
    });

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
  }
}
