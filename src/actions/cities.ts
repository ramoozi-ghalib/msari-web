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

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { mapPrismaCityToType } from '@/lib/mappers';
import { adminGuard, handleActionSafe } from '@/lib/action-guard';
import { clampLimit, validateInput } from '@/lib/action-utils';
import { CreateCitySchema, UpdateCitySchema, DeleteCitySchema } from '@/schemas/actions.schema';
import type { City } from '@/types';

// ─── Read Actions (public — no auth required) ─────────────────────────────────

export async function getActiveCities(params?: { limit?: unknown }): Promise<City[]> {
  try {
    const cities = await prisma.city.findMany({
      take: clampLimit(params?.limit, 10, 100),
      where: { isActive: true },
      include: {
        _count: {
          select: { hotels: { where: { isActive: true } } },
        },
      },
    });

    return cities.map((city: any) => {
      const mapped = mapPrismaCityToType(city);
      mapped.hotelCount = city._count.hotels;
      return mapped;
    });
  } catch (error) {
    console.error('Error fetching active cities:', error);
    return [];
  }
}

export async function getAllCities(params?: { limit?: unknown }): Promise<City[]> {
  try {
    const cities = await prisma.city.findMany({
      take: clampLimit(params?.limit, 10, 100),
      include: {
        _count: { select: { hotels: true } },
      },
    });

    return cities.map((city: any) => {
      const mapped = mapPrismaCityToType(city);
      mapped.hotelCount = city._count.hotels;
      return mapped;
    });
  } catch (error) {
    console.error('Error fetching all cities:', error);
    return [];
  }
}

// ─── Create City ──────────────────────────────────────────────────────────────

export async function createCity(rawData: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(CreateCitySchema, rawData);
  if (!validation.success) return validation;

  const data = validation.data;

  try {
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

    revalidatePath('/admin/destinations');
    revalidatePath('/destinations');
    revalidatePath('/');
    return { success: true as const, id: city.id };
  } catch (error) {
    return handleActionSafe('createCity', error);
  }
}

// ─── Update City ──────────────────────────────────────────────────────────────

export async function updateCity(rawId: unknown, rawData: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(UpdateCitySchema, { id: rawId, data: rawData });
  if (!validation.success) return validation;

  const { id, data } = validation.data;

  try {
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

    revalidatePath('/admin/destinations');
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
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(DeleteCitySchema, { id: rawId });
  if (!validation.success) return validation;

  const { id } = validation.data;

  try {
    // Prevent deleting a city that still has hotels — cascade would orphan data
    const city = await prisma.city.findUnique({
      where: { id },
      include: { _count: { select: { hotels: true } } },
    });

    if (city && city._count.hotels > 0) {
      return {
        success: false as const,
        error: 'لا يمكن حذف مدينة تحتوي على فنادق. يرجى حذف الفنادق أولاً.',
        code: 'CONFLICT' as const,
      };
    }

    await prisma.city.delete({ where: { id } });

    revalidatePath('/admin/destinations');
    revalidatePath('/destinations');
    revalidatePath('/');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('deleteCity', error);
  }
}
