import type { Hotel, Room, City, Amenity, Discount, Offer } from '@/types';

/**
 * Maps a Prisma Hotel object (with relations) to the Frontend Hotel UI interface
 */
export function mapPrismaHotelToType(prismaHotel: any): Hotel {
  return {
    id: prismaHotel.id,
    name: prismaHotel.nameAr || prismaHotel.nameEn || '',
    nameEn: prismaHotel.nameEn || prismaHotel.nameAr || '',
    slug: prismaHotel.slug,
    description: prismaHotel.descriptionAr || '',
    descriptionEn: prismaHotel.descriptionEn || '',
    city: prismaHotel.city?.nameAr || 'غير محدد',
    cityEn: prismaHotel.city?.nameEn || 'N/A',
    governorate: prismaHotel.city?.governorateAr || 'غير محدد',
    governorateEn: prismaHotel.city?.governorateEn || 'N/A',
    address: prismaHotel.address || '',
    lat: prismaHotel.lat ?? undefined,
    lng: prismaHotel.lng ?? undefined,
    stars: (prismaHotel.stars as 1 | 2 | 3 | 4 | 5) || 3,
    rating: Number(prismaHotel.rating) || 4.0,
    reviewCount: prismaHotel._count?.reviews ?? prismaHotel.reviewCount ?? 0,
    priceFrom: Number(prismaHotel.priceFrom) || 0,
    currency: (prismaHotel.currency as 'USD' | 'SAR' | 'YER' | 'YER_NEW' | 'YER_OLD') || 'USD',
    images: prismaHotel.images?.map((img: any) => img?.url).filter(Boolean) || [],
    thumbnail: prismaHotel.thumbnailUrl || (prismaHotel.images?.length > 0 ? prismaHotel.images[0]?.url : '') || '',
    // Filter out null amenities (e.g. deleted amenity records)
    amenities: prismaHotel.amenities
      ?.filter((ha: any) => ha?.amenity != null)
      .map((ha: any) => mapPrismaAmenityToType(ha.amenity)) || [],
    rooms: prismaHotel.rooms?.map(mapPrismaRoomToType) || [],
    discount: prismaHotel.discount ? mapPrismaDiscountToType(prismaHotel.discount) : undefined,
    isFeatured: prismaHotel.isFeatured || false,
    isActive: prismaHotel.isActive !== false,
    cityId: prismaHotel.cityId,
    policyAr: prismaHotel.policyAr || '',
    policyEn: prismaHotel.policyEn || '',
    mapUrl: prismaHotel.mapUrl || '',
    createdAt: prismaHotel.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: prismaHotel.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export function mapPrismaRoomToType(prismaRoom: any): Room {
  return {
    id: prismaRoom.id,
    hotelId: prismaRoom.hotelId,
    name: prismaRoom.nameAr || prismaRoom.nameEn || 'غرفة',
    nameEn: prismaRoom.nameEn || prismaRoom.nameAr || 'Room',
    description: prismaRoom.descriptionAr || '',
    capacity: prismaRoom.capacity || 2,
    pricePerNight: Number(prismaRoom.pricePerNight) || 0,
    images: prismaRoom.images?.map((img: any) => img?.url).filter(Boolean) || [],
    // Filter out null amenities (e.g. deleted amenity records)
    amenities: prismaRoom.amenities
      ?.filter((ra: any) => ra?.amenity != null)
      .map((ra: any) => mapPrismaAmenityToType(ra.amenity)) || [],
    isAvailable: prismaRoom.isAvailable !== false,
  };
}

export function mapPrismaAmenityToType(prismaAmenity: any): Amenity {
  return {
    id: prismaAmenity.id,
    name: prismaAmenity.nameAr,
    nameEn: prismaAmenity.nameEn,
    icon: prismaAmenity.icon || 'star',
    category: (prismaAmenity.category?.toLowerCase() || 'general') as any,
  };
}

export function mapPrismaDiscountToType(prismaDiscount: any): Discount {
  return {
    id: prismaDiscount.id,
    percentage: Number(prismaDiscount.percentage) || 0,
    validFrom: prismaDiscount.validFrom?.toISOString() || '',
    validTo: prismaDiscount.validTo?.toISOString() || '',
  };
}

export function mapPrismaCityToType(prismaCity: any): City {
  return {
    id: prismaCity.id,
    name: prismaCity.nameAr,
    nameEn: prismaCity.nameEn,
    governorate: prismaCity.governorateAr,
    governorateEn: prismaCity.governorateEn,
    image: prismaCity.imageUrl || '',
    hotelCount: prismaCity.hotelCount || 0,
    isActive: prismaCity.isActive !== false,
  };
}

export function mapPrismaOfferToType(prismaOffer: any): Offer {
  return {
    id: prismaOffer.id,
    title: prismaOffer.titleAr,
    titleEn: prismaOffer.titleEn || prismaOffer.titleAr,
    image: prismaOffer.imageUrl,
    link: prismaOffer.link || '/',
    isActive: prismaOffer.isActive !== false,
    order: prismaOffer.order || 0,
  };
}
