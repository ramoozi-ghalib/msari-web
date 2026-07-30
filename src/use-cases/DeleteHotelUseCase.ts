import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ServiceResponse, createError, ServiceError, ServiceErrorCode } from '@/lib/errors';
import { Policies } from '@/lib/policies';
import { Prisma } from '@prisma/client';

export class DeleteHotelUseCase {
  static async execute(input: { callerUser: any | null; hotelId: string; correlationId: string }): Promise<ServiceResponse<void>> {
    const log = (level: 'info'|'error', msg: string, meta: any={}) => {
      console[level](JSON.stringify({ timestamp: new Date().toISOString(), level, correlationId: input.correlationId, msg, layer: 'UseCase/DeleteHotel', ...meta }));
    };

    if (!Policies.canDeleteHotel(input.callerUser)) {
      log('error', 'Policy Check Failed: INSUFFICIENT_PERMISSIONS');
      return createError('INSUFFICIENT_PERMISSIONS', { action: 'DELETE_HOTEL' });
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Row Level Locking to prevent parallel mutations during soft deletion
        const lockedHotel = await tx.$queryRaw<any[]>`SELECT id FROM "Hotel" WHERE id = ${input.hotelId} FOR UPDATE`;
        if (!lockedHotel.length) {
          throw createError('HOTEL_NOT_FOUND', { hotelId: input.hotelId }).error;
        }

        // 2. Strict Business Rule: Check for active bookings
        // Must ignore CANCELLED bookings. Check PENDING and CONFIRMED.
        const activeBookings = await tx.booking.count({
          where: {
            hotelId: input.hotelId,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        });

        if (activeBookings > 0) {
          throw createError('HOTEL_DELETE_CONFLICT', { hotelId: input.hotelId, activeBookings }).error;
        }

        // 3. Execution: Soft Delete Architecture
        await tx.hotel.update({
          where: { id: input.hotelId },
          data: { isActive: false },
        });

        // 4. Mock Audit Log (Synchronous Tracking)
        // await tx.auditLog.create({ data: { action: 'DELETE_HOTEL', entityId: input.hotelId, userId: input.callerUser?.id }});

      });

      log('info', 'Hotel Soft Deleted Successfully', { hotelId: input.hotelId });
      revalidatePath('/admin/hotels');
      revalidatePath('/hotels');

      return { success: true, data: undefined };

    } catch (e: any) {
      if (e && e.code && e.meta) return { success: false, error: e as ServiceError<ServiceErrorCode> };
      log('error', 'Unhandled Database System Error', { error: e.message });
      return createError('SYSTEM_DATABASE_ERROR', { details: e.message });
    }
  }
}
