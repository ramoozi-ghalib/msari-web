'use server';

/**
 * admin.ts — Server Actions for admin hotel/room management.
 *
 * SECURITY: Every mutation calls adminGuard() as its FIRST operation.
 * No database query runs before the caller is verified as ADMIN/SUPER_ADMIN.
 * Raw errors are never returned to the client — only generic safe messages.
 */

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getHotels } from './hotels';
import { adminGuard, handleActionSafe } from '@/lib/action-guard';
import { validateInput } from '@/lib/action-utils';
import {
  CreateHotelSchema,
  UpdateHotelSchema,
  SetHotelDiscountSchema,
  DeleteHotelSchema,
  UpsertRoomSchema,
  DeleteRoomSchema,
} from '@/schemas/actions.schema';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateSlug = (nameEn: string) =>
  nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
  '-' +
  Date.now().toString(36);

// ─── Create Hotel ─────────────────────────────────────────────────────────────

export async function createHotel(rawData: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(CreateHotelSchema, rawData);
  if (!validation.success) return validation;

  const data = validation.data;

  try {
    const { amenities, images, ...rest } = data;

    const hotel = await prisma.hotel.create({
      data: {
        ...rest,
        slug: generateSlug(data.nameEn || 'hotel'),
        amenities: {
          create: amenities?.map((amenityId) => ({ amenityId })),
        },
        images: {
          create: images?.map((url, idx) => ({ url, order: idx })),
        },
      },
    });

    revalidatePath('/admin/hotels');
    revalidatePath('/hotels');
    return { success: true as const, id: hotel.id };
  } catch (error) {
    return handleActionSafe('createHotel', error);
  }
}

// ─── Update Hotel ─────────────────────────────────────────────────────────────

export async function updateHotel(rawId: unknown, rawData: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(UpdateHotelSchema, { id: rawId, data: rawData });
  if (!validation.success) return validation;

  const { id, data } = validation.data;

  try {
    const { amenities, images, ...rest } = data;

    // Fetch current slug so we can revalidate the correct public URL
    const current = await prisma.hotel.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.hotel.update({
      where: { id },
      data: {
        ...rest,
        ...(amenities && {
          amenities: {
            deleteMany: {},
            create: amenities.map((amenityId) => ({ amenityId })),
          },
        }),
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url, idx) => ({ url, order: idx })),
          },
        }),
      },
    });

    revalidatePath('/admin/hotels');
    revalidatePath('/hotels');
    // Revalidate the correct slug-based public page
    if (current?.slug) {
      revalidatePath(`/hotels/${current.slug}`, 'page');
    }

    return { success: true as const };
  } catch (error) {
    return handleActionSafe('updateHotel', error);
  }
}

// ─── Set Hotel Discount ───────────────────────────────────────────────────────

export async function setHotelDiscount(rawHotelId: unknown, rawPercentage: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(SetHotelDiscountSchema, { hotelId: rawHotelId, percentage: rawPercentage });
  if (!validation.success) return validation;

  const { hotelId, percentage } = validation.data;

  try {
    if (percentage <= 0) {
      await prisma.discount.deleteMany({ where: { hotelId } });
    } else {
      const existing = await prisma.discount.findFirst({ where: { hotelId } });
      if (existing) {
        await prisma.discount.update({
          where: { id: existing.id },
          data: { percentage },
        });
      } else {
        const today = new Date();
        const future = new Date(today);
        future.setFullYear(future.getFullYear() + 1);
        await prisma.discount.create({
          data: { hotelId, percentage, validFrom: today, validTo: future },
        });
      }
    }

    revalidatePath('/admin/hotels');
    revalidatePath('/hotels');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('setHotelDiscount', error);
  }
}

// ─── Delete Hotel ─────────────────────────────────────────────────────────────

export async function deleteHotel(rawId: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(DeleteHotelSchema, { id: rawId });
  if (!validation.success) return validation;

  const { id } = validation.data;

  try {
    await prisma.hotel.delete({ where: { id } });
    revalidatePath('/admin/hotels');
    revalidatePath('/hotels');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('deleteHotel', error);
  }
}

// ─── Upsert Room ──────────────────────────────────────────────────────────────

export async function upsertRoom(rawHotelId: unknown, rawRoomData: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(UpsertRoomSchema, { hotelId: rawHotelId, roomData: rawRoomData });
  if (!validation.success) return validation;

  const { hotelId, roomData } = validation.data;

  try {
    const { id, amenities, images, ...rest } = roomData;

    // Treat any ID starting with 'new-' or absent as a create request
    const isExisting = id && !id.startsWith('new-');

    if (isExisting) {
      // Verify the room actually belongs to the hotel being edited —
      // prevents an admin from editing rooms in a different hotel's context
      const existingRoom = await prisma.room.findFirst({
        where: { id, hotelId },
        select: { id: true },
      });

      if (!existingRoom) {
        return {
          success: false as const,
          error: 'الغرفة غير موجودة أو لا تنتمي لهذا الفندق',
          code: 'NOT_FOUND' as const,
        };
      }

      await prisma.room.update({
        where: { id },
        data: {
          ...rest,
          ...(amenities && {
            amenities: {
              deleteMany: {},
              create: amenities.map((amenityId) => ({ amenityId })),
            },
          }),
          ...(images && {
            images: {
              deleteMany: {},
              create: images.map((url, idx) => ({ url, order: idx })),
            },
          }),
        },
      });
    } else {
      await prisma.room.create({
        data: {
          ...rest,
          hotelId,
          amenities: {
            create: amenities?.map((amenityId) => ({ amenityId })),
          },
          images: {
            create: images?.map((url, idx) => ({ url, order: idx })),
          },
        },
      });
    }

    revalidatePath('/admin/hotels');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('upsertRoom', error);
  }
}

// ─── Delete Room ──────────────────────────────────────────────────────────────

export async function deleteRoom(rawId: unknown) {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  const validation = validateInput(DeleteRoomSchema, { id: rawId });
  if (!validation.success) return validation;

  const { id } = validation.data;

  try {
    await prisma.room.delete({ where: { id } });
    revalidatePath('/admin/hotels');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('deleteRoom', error);
  }
}

// ─── Re-export read action ────────────────────────────────────────────────────
// getHotels is a read-only action — it's protected at the layout level
// (adminGuard in admin layout) and does not mutate data.
export { getHotels };
