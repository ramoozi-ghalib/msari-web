import { prisma } from '@/lib/prisma';
import { apiClient } from '@/lib/api-client';
import { db } from '@/lib/firebase-admin';
import type { City } from '@/types';
import { getDestinationData } from '@/data/destinations';

export class CityService {
  /**
   * Fetch active cities with count of active hotels
   */
  static async getActiveCities(limit: number): Promise<City[]> {
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

      return mapped.slice(0, limit);
    } catch (error) {
      console.error('Error in getActiveCities:', error);
      return [];
    }
  }

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
    const city = await prisma.city.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        governorateAr: data.governorateAr,
        governorateEn: data.governorateEn,
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return city.id;
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
    await prisma.city.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        governorateAr: data.governorateAr,
        governorateEn: data.governorateEn,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      },
    });
  }

  static async deleteCity(id: string): Promise<void> {
    const city = await prisma.city.findUnique({
      where: { id },
      include: { _count: { select: { hotels: true } } },
    });

    if (city && city._count.hotels > 0) {
      throw new Error('HAS_HOTELS');
    }

    await prisma.city.delete({
      where: { id },
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
      overview: editorial?.overview || curated?.overview || {
        history: `تعتبر ${cityName} من أهم المدن اليمنية التاريخية والثقافية وتتميز بعمارتها العريقة وطبيعتها الساحرة.`,
        climate: `مناخ معتدل ولطيف يتيح للزوار التمتع بالأجواء الأنيقة والتجول في أرجاء المدينة.`,
        culture: `ثقافة غنية بالتقاليد الشعبية والأسواق التراثية والمأكولات اليمنية الشهيرة.`,
        bestTimeToVisit: `متاحة للزيارة والاستمتاع بطقسها ورونقها على مدار العام.`,
      },
      landmarks: editorial?.landmarks || curated?.landmarks || [],
      hotelCount: hotels.length,
      rawHotels: hotels,
    };
  }
}
