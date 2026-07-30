'use server';

/**
 * admin.ts — Server Actions for admin hotel/room management.
 *
 * Fully migrated to Firebase Firestore (db) to match Architecture Freeze guidelines.
 * All mutations write directly to Firestore collections ('hotels', 'rooms').
 * SECURITY: Every mutation calls adminGuard() as its FIRST operation.
 */

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { getHotels } from './hotels';
import { adminGuard, handleActionSafe } from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { validateInput } from '@/lib/action-utils';
import { db } from '@/lib/firebase-admin';
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
  nameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-'
    + crypto.randomUUID().slice(0, 8);

// ─── Create Hotel ─────────────────────────────────────────────────────────────

export async function createHotel(rawData: unknown) {
  const guard = await adminGuard(Policies.canCreateHotel);
  if (!guard.ok) return guard.error;

  const validation = validateInput(CreateHotelSchema, rawData);
  if (!validation.success) return validation;

  const data = validation.data;

  try {
    const { amenities, images, ...rest } = data;
    const docRef = db.collection('hotels').doc();
    const now = new Date().toISOString();

    const hotelData = {
      ...rest,
      id: docRef.id,
      slug: generateSlug(data.nameEn || 'hotel'),
      amenities: amenities || [],
      images: images || [],
      mainImageUrl: images && images.length > 0 ? images[0] : '',
      isDeleted: false,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(hotelData);

    revalidatePath('/admin/hotels');
    revalidatePath('/hotels');
    return { success: true as const, id: docRef.id };
  } catch (error) {
    return handleActionSafe('createHotel', error);
  }
}

// ─── Update Hotel ─────────────────────────────────────────────────────────────

export async function updateHotel(rawId: unknown, rawData: unknown) {
  const guard = await adminGuard(Policies.canUpdateHotel);
  if (!guard.ok) return guard.error;

  const validation = validateInput(UpdateHotelSchema, { id: rawId, data: rawData });
  if (!validation.success) return validation;

  const { id, data } = validation.data;

  try {
    const { amenities, images, ...rest } = data;
    const docRef = db.collection('hotels').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false as const, error: 'الفندق غير موجود', code: 'NOT_FOUND' as const };
    }

    const currentData = docSnap.data();
    const updateData: Record<string, any> = {
      ...rest,
      updatedAt: new Date().toISOString(),
    };

    if (amenities !== undefined) updateData.amenities = amenities;
    if (images !== undefined) {
      updateData.images = images;
      if (images.length > 0) updateData.mainImageUrl = images[0];
    }

    await docRef.update(updateData);

    revalidatePath('/admin/hotels');
    revalidatePath('/hotels');
    if (currentData?.slug) {
      revalidatePath(`/hotels/${currentData.slug}`, 'page');
    }

    return { success: true as const };
  } catch (error) {
    return handleActionSafe('updateHotel', error);
  }
}

// ─── Set Hotel Discount ───────────────────────────────────────────────────────

export async function setHotelDiscount(rawHotelId: unknown, rawPercentage: unknown, rawDates?: unknown) {
  const guard = await adminGuard(Policies.canManageOffers);
  if (!guard.ok) return guard.error;

  const validation = validateInput(SetHotelDiscountSchema, {
    hotelId:    rawHotelId,
    percentage: rawPercentage,
    ...(rawDates && typeof rawDates === 'object' ? rawDates : {}),
  });
  if (!validation.success) return validation;

  const { hotelId, percentage, validFrom, validTo } = validation.data;

  try {
    const docRef = db.collection('hotels').doc(hotelId);
    
    if (percentage <= 0) {
      await docRef.update({
        discountPercentage: 0,
        discountValidFrom: null,
        discountValidTo: null,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await docRef.update({
        discountPercentage: percentage,
        discountValidFrom: validFrom ? new Date(validFrom).toISOString() : new Date().toISOString(),
        discountValidTo: validTo ? new Date(validTo).toISOString() : null,
        updatedAt: new Date().toISOString(),
      });
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
  const guard = await adminGuard(Policies.canDeleteHotel);
  if (!guard.ok) return guard.error;

  const validation = validateInput(DeleteHotelSchema, { id: rawId });
  if (!validation.success) return validation;

  const { id } = validation.data;

  try {
    // Check active bookings in Firestore
    const bookingsSnap = await db.collection('bookings')
      .where('hotelId', '==', id)
      .where('status', 'in', ['PENDING', 'CONFIRMED'])
      .get();

    if (!bookingsSnap.empty) {
      return {
        success: false as const,
        error: `لا يمكن حذف هذا الفندق — يوجد ${bookingsSnap.size} حجز نشط. يرجى إلغاء أو إكمال الحجوزات أولاً.`,
        code: 'CONFLICT' as const,
      };
    }

    // Soft delete in Firestore
    await db.collection('hotels').doc(id).update({
      isDeleted: true,
      isPublished: false,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath('/admin/hotels');
    revalidatePath('/hotels');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('deleteHotel', error);
  }
}

// ─── Upsert Room ──────────────────────────────────────────────────────────────

export async function upsertRoom(rawHotelId: unknown, rawRoomData: unknown) {
  const guard = await adminGuard(Policies.canUpdateHotel);
  if (!guard.ok) return guard.error;

  const validation = validateInput(UpsertRoomSchema, { hotelId: rawHotelId, roomData: rawRoomData });
  if (!validation.success) return validation;

  const { hotelId, roomData } = validation.data;

  try {
    const { id, amenities, images, ...rest } = roomData;
    const isExisting = id && !id.startsWith('new-');
    const now = new Date().toISOString();

    const roomsRef = db.collection('hotels').doc(hotelId).collection('rooms');

    if (isExisting) {
      const roomDoc = roomsRef.doc(id);
      const roomSnap = await roomDoc.get();

      if (!roomSnap.exists) {
        return {
          success: false as const,
          error: 'الغرفة غير موجودة أو لا تنتمي لهذا الفندق',
          code: 'NOT_FOUND' as const,
        };
      }

      await roomDoc.update({
        ...rest,
        amenities: amenities || [],
        images: images || [],
        mainImageUrl: images && images.length > 0 ? images[0] : '',
        updatedAt: now,
      });
    } else {
      const newRoomDoc = roomsRef.doc();
      await newRoomDoc.set({
        ...rest,
        id: newRoomDoc.id,
        hotelId,
        amenities: amenities || [],
        images: images || [],
        mainImageUrl: images && images.length > 0 ? images[0] : '',
        isDeleted: false,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath('/admin/hotels');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('upsertRoom', error);
  }
}

// ─── Delete Room ──────────────────────────────────────────────────────────────

export async function deleteRoom(rawId: unknown, rawHotelId?: unknown) {
  const guard = await adminGuard(Policies.canUpdateHotel);
  if (!guard.ok) return guard.error;

  const validation = validateInput(DeleteRoomSchema, { id: rawId });
  if (!validation.success) return validation;

  const { id } = validation.data;

  try {
    if (rawHotelId && typeof rawHotelId === 'string') {
      await db.collection('hotels').doc(rawHotelId).collection('rooms').doc(id).update({
        isDeleted: true,
        isPublished: false,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Find room in collection group
      const querySnap = await db.collectionGroup('rooms').where('id', '==', id).get();
      if (!querySnap.empty) {
        await querySnap.docs[0].ref.update({
          isDeleted: true,
          isPublished: false,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    revalidatePath('/admin/hotels');
    return { success: true as const };
  } catch (error) {
    return handleActionSafe('deleteRoom', error);
  }
}

// ─── Re-export read action ────────────────────────────────────────────────────
export { getHotels };
