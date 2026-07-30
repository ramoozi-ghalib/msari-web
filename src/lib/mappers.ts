/**
 * mappers.ts — دوال تحويل بيانات Prisma إلى أنواع الواجهة الأمامية.
 *
 * [FIX H-2] استبدال `any` بأنواع Prisma المُولَّدة بالكامل.
 * هذا يضمن اكتشاف أي تغيير في Schema كـ TypeScript error وقت الترجمة،
 * بدلاً من أخطاء runtime غير متوقعة.
 */
import type { Hotel, Room, City, Amenity, Discount, Offer } from '@/types';
import type { Prisma } from '@prisma/client';
import { normalizeAddress } from '@/lib/utils';

// ─── أنواع Prisma المُولَّدة (مع العلاقات المُضمَّنة) ──────────────────────────

export type PrismaHotelFull = Prisma.HotelGetPayload<{
  include: {
    city:      { select: { id: true; nameAr: true; nameEn: true; governorateAr: true; governorateEn: true } };
    images:    { select: { url: true; order: true } };
    discount:  { select: { id: true; percentage: true; validFrom: true; validTo: true } };
    amenities: { select: { amenity: { select: { id: true; nameAr: true; nameEn: true; icon: true; category: true } } } };
    rooms: {
      select: {
        id: true; hotelId: true; nameAr: true; nameEn: true; descriptionAr: true;
        capacity: true; pricePerNight: true; isAvailable: true;
        images:    { select: { url: true } };
        amenities: { select: { amenity: { select: { id: true; nameAr: true; nameEn: true; icon: true; category: true } } } };
      }
    };
    _count: { select: { reviews: true } };
  }
}>;

export type PrismaRoomFull = Prisma.RoomGetPayload<{
  select: {
    id: true; hotelId: true; nameAr: true; nameEn: true; descriptionAr: true;
    capacity: true; pricePerNight: true; isAvailable: true;
    images:    { select: { url: true } };
    amenities: { select: { amenity: { select: { id: true; nameAr: true; nameEn: true; icon: true; category: true } } } };
  }
}>;

export type PrismaAmenityRaw = Prisma.AmenityGetPayload<{
  select: { id: true; nameAr: true; nameEn: true; icon: true; category: true }
}>;

export type PrismaDiscountRaw = Prisma.DiscountGetPayload<{
  select: { id: true; percentage: true; validFrom: true; validTo: true }
}>;

export type PrismaCityFull = Prisma.CityGetPayload<{
  select: {
    id: true; nameAr: true; nameEn: true; governorateAr: true; governorateEn: true;
    imageUrl: true; isActive: true;
    _count: { select: { hotels: true } };
  }
}>;

export type PrismaOfferRaw = Prisma.OfferGetPayload<Record<string, never>>;

// ─── Mapper Functions ──────────────────────────────────────────────────────────

export function mapPrismaHotelToType(prismaHotel: PrismaHotelFull): Hotel {
  return {
    id:           prismaHotel.id,
    name:         prismaHotel.nameAr || prismaHotel.nameEn || '',
    nameEn:       prismaHotel.nameEn || prismaHotel.nameAr || '',
    slug:         prismaHotel.slug,
    description:  prismaHotel.descriptionAr || '',
    descriptionEn: prismaHotel.descriptionEn || '',
    city:         prismaHotel.city?.nameAr || 'غير محدد',
    cityEn:       prismaHotel.city?.nameEn || 'N/A',
    governorate:  prismaHotel.city?.governorateAr || 'غير محدد',
    governorateEn: prismaHotel.city?.governorateEn || 'N/A',
    address:      normalizeAddress(prismaHotel.address || '', prismaHotel.city?.nameAr || 'غير محدد'),
    lat:          prismaHotel.lat ?? undefined,
    lng:          prismaHotel.lng ?? undefined,
    stars:        (prismaHotel.stars as 1 | 2 | 3 | 4 | 5) || 3,
    rating:       Number(prismaHotel.rating) || 4.0,
    reviewCount:  prismaHotel._count?.reviews ?? 0,
    priceFrom:    Number(prismaHotel.priceFrom) || 0,
    currency:     (prismaHotel.currency as 'USD' | 'SAR' | 'YER' | 'YER_NEW' | 'YER_OLD') || 'USD',
    images:       prismaHotel.images?.map((img) => img.url).filter(Boolean) || [],
    thumbnail:    prismaHotel.thumbnailUrl || prismaHotel.images?.[0]?.url || '',
    amenities:    prismaHotel.amenities
                    ?.filter((ha) => ha.amenity != null)
                    .map((ha) => mapPrismaAmenityToType(ha.amenity)) || [],
    rooms:        prismaHotel.rooms?.map(mapPrismaRoomToType) || [],
    discount:     prismaHotel.discount ? mapPrismaDiscountToType(prismaHotel.discount) : undefined,
    isFeatured:   prismaHotel.isFeatured || false,
    isActive:     prismaHotel.isActive !== false,
    cityId:       prismaHotel.cityId,
    policyAr:     prismaHotel.policyAr || '',
    policyEn:     prismaHotel.policyEn || '',
    mapUrl:       prismaHotel.mapUrl || '',
    createdAt:    prismaHotel.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt:    prismaHotel.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export function mapPrismaRoomToType(prismaRoom: PrismaRoomFull): Room {
  return {
    id:           prismaRoom.id,
    hotelId:      prismaRoom.hotelId,
    name:         prismaRoom.nameAr || prismaRoom.nameEn || 'غرفة',
    nameEn:       prismaRoom.nameEn || prismaRoom.nameAr || 'Room',
    description:  prismaRoom.descriptionAr || '',
    capacity:     prismaRoom.capacity || 2,
    pricePerNight: Number(prismaRoom.pricePerNight) || 0,
    images:       prismaRoom.images?.map((img) => img.url).filter(Boolean) || [],
    amenities:    prismaRoom.amenities
                    ?.filter((ra) => ra.amenity != null)
                    .map((ra) => mapPrismaAmenityToType(ra.amenity)) || [],
    isAvailable:  prismaRoom.isAvailable !== false,
  };
}

export function mapPrismaAmenityToType(prismaAmenity: PrismaAmenityRaw): Amenity {
  return {
    id:       prismaAmenity.id,
    name:     prismaAmenity.nameAr,
    nameEn:   prismaAmenity.nameEn,
    icon:     prismaAmenity.icon || 'star',
    category: (prismaAmenity.category?.toLowerCase() || 'general') as Amenity['category'],
  };
}

export function mapPrismaDiscountToType(prismaDiscount: PrismaDiscountRaw): Discount {
  return {
    id:         prismaDiscount.id,
    percentage: Number(prismaDiscount.percentage) || 0,
    validFrom:  prismaDiscount.validFrom?.toISOString() || '',
    validTo:    prismaDiscount.validTo?.toISOString() || '',
  };
}

export function mapPrismaCityToType(prismaCity: PrismaCityFull): City {
  return {
    id:           prismaCity.id,
    name:         prismaCity.nameAr,
    nameEn:       prismaCity.nameEn,
    governorate:  prismaCity.governorateAr,
    governorateEn: prismaCity.governorateEn,
    image:        prismaCity.imageUrl || '',
    // [FIX C-5] hotelCount مأخوذ من _count دائماً — لا حقل مُزمَّن
    hotelCount:   prismaCity._count?.hotels ?? 0,
    isActive:     prismaCity.isActive !== false,
  };
}

export function mapPrismaOfferToType(prismaOffer: PrismaOfferRaw): Offer {
  return {
    id:       prismaOffer.id,
    title:    prismaOffer.titleAr,
    titleEn:  prismaOffer.titleEn || prismaOffer.titleAr,
    image:    prismaOffer.imageUrl,
    link:     prismaOffer.link || '/',
    isActive: prismaOffer.isActive !== false,
    order:    prismaOffer.order || 0,
  };
}
