'use server';

import { prisma } from '@/lib/prisma';
import { mapPrismaOfferToType } from '@/lib/mappers';
import type { Offer } from '@/types';
import { clampLimit } from '@/lib/action-utils';

export async function getActiveOffers(params?: { limit?: unknown }): Promise<Offer[]> {
  try {
    const offers = await prisma.offer.findMany({
      take: clampLimit(params?.limit, 10, 100),
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return offers.map(mapPrismaOfferToType);
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return [];
  }
}

export async function getAllOffers(params?: { limit?: unknown }): Promise<Offer[]> {
  try {
    const offers = await prisma.offer.findMany({
      take: clampLimit(params?.limit, 10, 100),
      orderBy: {
        order: 'asc',
      },
    });
    return offers.map(mapPrismaOfferToType);
  } catch (error) {
    console.error('Error fetching all offers:', error);
    return [];
  }
}
