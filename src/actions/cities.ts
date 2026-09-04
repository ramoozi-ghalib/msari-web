'use server';

/**
 * cities.ts — Server Actions for city/destination management.
 *
 * Read actions (getActiveCities, getAllCities) are public — they power the
 * public hotels listing and homepage city section.
 *
 * Mutation actions (create, update, delete) require ADMIN or SUPER_ADMIN.
 * The guard runs as the FIRST operation in every mutation.
 */

import { revalidatePath } from 'next/cache';
import { adminGuard, handleActionSafe } from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { clampLimit, validateInput } from '@/lib/action-utils';
import { CreateCitySchema, UpdateCitySchema, DeleteCitySchema } from '@/schemas/actions.schema';
import type { City } from '@/types';
import { CityService } from '@/services/city.service';

// ─── Read Actions (public — no auth required) ─────────────────────────────────

export async function getActiveCities(params?: { limit?: unknown }): Promise<City[]> {
  try {
    const limit = clampLimit(params?.limit, 10, 100);
    return await CityService.getActiveCities(limit);
  } catch (error) {
    console.error('Error fetching active cities:', error);
    return [];
  }
}

export async function getAllCities(params?: { limit?: unknown }): Promise<City[]> {
  try {
    const limit = clampLimit(params?.limit, 10, 100);
    return await CityService.getAllCities(limit);
  } catch (error) {
    console.error('Error fetching all cities:', error);
    return [];
  }
}

export async function getDestinationBySlug(slug: string) {
  try {
    return await CityService.getDestinationBySlug(slug);
  } catch (error) {
    console.error('Error fetching destination by slug:', error);
    return null;
  }
}

// ─── Create City ──────────────────────────────────────────────────────────────

export async function createCity(rawData: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard(Policies.canManageDestinations);
  if (!guard.ok) return guard.error;

  const validation = validateInput(CreateCitySchema, rawData);
  if (!validation.success) return validation;

  const data = validation.data;

  try {
    const id = await CityService.createCity(data);

    revalidatePath('/destinations');
    revalidatePath('/');
    return { success: true as const, id };
  } catch (error) {
    return handleActionSafe('createCity', error);
  }
}

// ─── Update City ──────────────────────────────────────────────────────────────

export async function updateCity(rawId: unknown, rawData: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard(Policies.canManageDestinations);
  if (!guard.ok) return guard.error;

  const validation = validateInput(UpdateCitySchema, { id: rawId, data: rawData });
  if (!validation.success) return validation;

  const { id, data } = validation.data;

  try {
    await CityService.updateCity(id, data);

    revalidatePath('/destinations');
    revalidatePath('/');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('updateCity', error);
  }
}

// ─── Delete City ──────────────────────────────────────────────────────────────

export async function deleteCity(rawId: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard(Policies.canManageDestinations);
  if (!guard.ok) return guard.error;

  const validation = validateInput(DeleteCitySchema, { id: rawId });
  if (!validation.success) return validation;

  const { id } = validation.data;

  try {
    await CityService.deleteCity(id);

    revalidatePath('/destinations');
    revalidatePath('/');
    return { success: true as const };
  } catch (error: any) {
    if (error.message === 'HAS_HOTELS') {
      return {
        success: false as const,
        error: 'لا يمكن حذف مدينة تحتوي على فنادق. يرجى حذف الفنادق أولاً.',
        code: 'CONFLICT' as const,
      };
    }
    return handleActionSafe('deleteCity', error);
  }
}
