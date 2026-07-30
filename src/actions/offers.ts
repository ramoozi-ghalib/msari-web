'use server';

import type { Offer } from '@/types';
import { clampLimit } from '@/lib/action-utils';
import { OfferService } from '@/services/offer.service';

export async function getActiveOffers(params?: { limit?: unknown }): Promise<Offer[]> {
  try {
    const limit = clampLimit(params?.limit, 10, 100);
    return await OfferService.getActiveOffers(limit);
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return [];
  }
}

export async function getAllOffers(params?: { limit?: unknown }): Promise<Offer[]> {
  try {
    const limit = clampLimit(params?.limit, 10, 100);
    return await OfferService.getAllOffers(limit);
  } catch (error) {
    console.error('Error fetching all offers:', error);
    return [];
  }
}
