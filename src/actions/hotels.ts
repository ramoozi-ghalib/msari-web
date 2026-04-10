'use server';

import { prisma } from '@/lib/prisma';
import { mapPrismaHotelToType } from '@/lib/mappers';
import type { Hotel } from '@/types';
import { clampLimit } from '@/lib/action-utils';

export async function getLocalHotels(params?: { limit?: unknown }): Promise<Hotel[]> {
  try {
    const hotels = await prisma.hotel.findMany({
      take: clampLimit(params?.limit, 10, 100),
      where: {
        isActive: true,
        type: 'LOCAL',
      },
      include: {
        city: { select: { id: true, nameAr: true, nameEn: true, governorateAr: true, governorateEn: true } },
        images: { select: { url: true, order: true }, orderBy: { order: 'asc' }, take: 5 },
        amenities: {
          select: {
            amenity: { select: { id: true, nameAr: true, nameEn: true, icon: true, category: true } }
          },
          take: 20,
        },
        _count: { select: { reviews: true } },
      },
      orderBy: {
        isFeatured: 'desc',
      },
    });
    
    return hotels.map(mapPrismaHotelToType);
  } catch (error) {
    console.error('Error fetching local hotels:', error);
    return [];
  }
}

// Admin: fetch all hotels without filters
export async function getHotels(params?: { limit?: unknown }): Promise<Hotel[]> {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        city: { select: { id: true, nameAr: true, nameEn: true, governorateAr: true, governorateEn: true } },
        images: { select: { url: true, order: true }, orderBy: { order: 'asc' }, take: 5 },
        discount: { select: { id: true, percentage: true, validFrom: true, validTo: true } },
        amenities: { select: { amenity: { select: { id: true, nameAr: true, nameEn: true, icon: true, category: true } } }, take: 20 },
        rooms: { 
          select: { 
            id: true, hotelId: true, nameAr: true, nameEn: true, descriptionAr: true, capacity: true, pricePerNight: true, isAvailable: true,
            images: { select: { url: true }, orderBy: { order: 'asc' }, take: 5 },
            amenities: { select: { amenity: { select: { id: true, nameAr: true, nameEn: true, icon: true, category: true } } }, take: 20 }
          }, 
          take: 5 
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { isFeatured: 'desc' },
      take: clampLimit(params?.limit, 10, 100),
    });
    return hotels.map(hotel => {
      try { return mapPrismaHotelToType(hotel); } catch { return null; }
    }).filter(Boolean) as Hotel[];
  } catch (error) {
    console.error('Error fetching all hotels (admin):', error);
    return [];
  }
}


export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  // DB stores slugs as lowercase URL-encoded strings, e.g. "%d9%81%d9%86..."
  // Next.js params may come as:
  //   - Uppercase encoded: "%D9%81%D9%86..." (from Next.js Link normalization)
  //   - Decoded Arabic text: "فندق-..." (in some cases)
  // Fix: decode → re-encode → lowercase to match DB format exactly.
  let slugToSearch: string;
  try {
    const decoded = decodeURIComponent(slug); // Always try to decode first
    slugToSearch = encodeURIComponent(decoded).toLowerCase(); // Re-encode to lowercase %d9%...
  } catch {
    slugToSearch = slug.toLowerCase(); // Fallback
  }

  try {
    const hotel = await prisma.hotel.findFirst({
      where: {
        slug: {
          equals: slugToSearch,
          mode: 'insensitive', // Safety net for any remaining case differences
        },
      },
      include: {
        city: { select: { id: true, nameAr: true, nameEn: true, governorateAr: true, governorateEn: true } },
        images: { select: { url: true, order: true }, orderBy: { order: 'asc' }, take: 5 },
        discount: { select: { id: true, percentage: true, validFrom: true, validTo: true } },
        amenities: {
          select: {
            amenity: { select: { id: true, nameAr: true, nameEn: true, icon: true, category: true } }
          },
          take: 20,
        },
        rooms: {
          where: { isAvailable: true },
          take: 5,
          select: {
            id: true, hotelId: true, nameAr: true, nameEn: true, descriptionAr: true, capacity: true, pricePerNight: true, isAvailable: true,
            images: { select: { url: true }, orderBy: { order: 'asc' }, take: 5 },
            amenities: {
              select: {
                amenity: { select: { id: true, nameAr: true, nameEn: true, icon: true, category: true } }
              },
              take: 20,
            },
          },
        },
        reviews: {
          where: { isVisible: true },
          select: {
            id: true, rating: true, comment: true, createdAt: true, isVisible: true,
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    
    if (!hotel) {
      console.warn(`[getHotelBySlug] Not found — searched for: "${slugToSearch}" (original param: "${slug}")`);
      return null;
    }

    try {
      return mapPrismaHotelToType(hotel);
    } catch (mapError) {
      console.error(`[getHotelBySlug] Failed to map hotel "${slug}":`, mapError);
      return null;
    }
  } catch (error) {
    console.error(`[getHotelBySlug] DB error for slug "${slug}":`, error);
    return null;
  }
}

