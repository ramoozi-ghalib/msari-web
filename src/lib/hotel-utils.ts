/**
 * Pure hotel list helpers — shared by BOTH direct Firestore and API paths so
 * filtering/sorting semantics stay identical across data sources.
 *
 * Lives outside 'use server' files because Next.js forbids exporting sync
 * functions from Server Action modules (build error otherwise).
 */
import type { Hotel } from '@/types';
import type { GetLocalHotelsParams } from '@/actions/hotels';

/**
 * Shared in-memory filter — identical semantics on direct and API hotel lists.
 */
export function filterHotels(hotels: Hotel[], params?: GetLocalHotelsParams): Hotel[] {
  return hotels.filter((hotel) => {
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
}

/**
 * Shared in-memory sort — identical semantics on direct and API hotel lists.
 * Default: featured-first, deterministic id tie-break (createdAt absent on all docs).
 */
export function sortHotels(
  hotels: Hotel[],
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'rating'
): Hotel[] {
  const sorted = [...hotels];
  if (sort === 'price_asc') {
    sorted.sort((a, b) => a.priceFrom - b.priceFrom);
  } else if (sort === 'price_desc') {
    sorted.sort((a, b) => b.priceFrom - a.priceFrom);
  } else if (sort === 'rating') {
    sorted.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (a.id === b.id) return 0;
      return a.id < b.id ? -1 : 1;
    });
  } else {
    sorted.sort((a, b) => {
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
  return sorted;
}

export function mapAmenitiesToDTO(rawAmenities: any): any[] {
  if (!Array.isArray(rawAmenities)) return [];
  return rawAmenities.map((a: any, idx: number) => {
    if (typeof a === 'string') {
      return {
        id: `amenity-${idx}`,
        name: { ar: a, en: a },
        iconKey: a.toLowerCase(),
        isFeatured: true,
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
        isFeatured: true,
      };
    }
    return {
      id: `amenity-${idx}`,
      name: { ar: '', en: '' },
      iconKey: '',
      isFeatured: false,
    };
  });
}
