import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ServiceResponse, createError, ServiceError, ServiceErrorCode } from '@/lib/errors';
import { Policies } from '@/lib/policies';
import { BookingStateService } from '@/services/booking/BookingStateService';
import { PaymentService } from '@/services/booking/PaymentService';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class UpdateBookingStatusUseCase {
  static async execute(input: {
    callerUser: any | null;
    bookingId: string;
    newStatus: BookingStatus;
    correlationId: string;
  }): Promise<ServiceResponse<void>> {
    const log = (level: 'info' | 'warn' | 'error', msg: string, meta: any = {}) => {
      console[level](JSON.stringify({ timestamp: new Date().toISOString(), level, correlationId: input.correlationId, msg, layer: 'UseCase/UpdateBooking', ...meta }));
    };

    // 1. Authorization
    if (!Policies.canUpdateBookingStatus(input.callerUser)) {
      log('warn', 'Unauthorized state update attempt');
      return createError('INSUFFICIENT_PERMISSIONS', { action: 'UPDATE_BOOKING_STATUS' });
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 2. Fetch with Row Lock FOR UPDATE
        const bookingRows = await tx.$queryRaw<any[]>`SELECT id, status, "paymentStatus", "checkIn", "paymentVerified" FROM "Booking" WHERE id = ${input.bookingId} FOR UPDATE`;
        if (!bookingRows.length) {
          throw createError('BOOKING_NOT_FOUND', { bookingId: input.bookingId }).error;
        }

        const booking = bookingRows[0];

        // 2.5 STRICT BUSINESS RULES VALIDATION LAYER

        // Rule 1: PENDING -> CONFIRMED ONLY IF active and not cancelled
        if (input.newStatus === BookingStatus.CONFIRMED) {
          if (booking.status === BookingStatus.CANCELLED) {
            throw createError('BOOKING_BUSINESS_RULE_VIOLATION', { message: 'Booking was already cancelled and cannot be confirmed' }).error;
          }
          if (!booking.paymentVerified) {
            throw createError('BOOKING_PAYMENT_NOT_VERIFIED', {}).error;
          }
        }

        // Rule 2: CONFIRMED -> NO_SHOW ONLY IF booking date has passed
        if (input.newStatus === BookingStatus.NO_SHOW) {
          const checkInDate = new Date(booking.checkIn);
          const now = new Date();
          if (now < checkInDate) {
            throw createError('BOOKING_BUSINESS_RULE_VIOLATION', { message: 'Cannot mark as No-Show before the check-in date has passed' }).error;
          }
        }

        // Rule 3: ANY -> CANCELLED ONLY IF not already completed
        if (input.newStatus === BookingStatus.CANCELLED) {
          if (booking.status === BookingStatus.COMPLETED) {
            throw createError('BOOKING_BUSINESS_RULE_VIOLATION', { message: 'Cannot cancel an already completed booking' }).error;
          }
        }

        // 3. Delegate to Domain Services (Pure logic, no DB calls!)
        const stateRes = BookingStateService.validateTransition(booking.status, input.newStatus);
        if (!stateRes.success) throw stateRes.error;

        const paymentRes = PaymentService.calculateNextPaymentState(booking.paymentStatus, input.newStatus);
        if (!paymentRes.success) throw paymentRes.error;

        // 4. Execute DB Write
        await tx.booking.update({
          where: { id: input.bookingId },
          data: {
            status: stateRes.data,
            paymentStatus: paymentRes.data,
          },
        });

        // 5. Audit Log (Sync in tx)
        // await tx.auditLog.create({ data: { action: 'UPDATE_STATUS', entityId: input.bookingId, details: `Status ${booking.status} -> ${input.newStatus}` } });

      });

      log('info', 'Booking Status Updated', { bookingId: input.bookingId, newStatus: input.newStatus });
      revalidatePath('/admin/bookings');

      return { success: true, data: undefined };

    } catch (e: any) {
      if (e && e.code && e.meta) return { success: false, error: e as ServiceError<ServiceErrorCode> };
      log('error', 'Unhandled DB Error', { error: e.message });
      return createError('SYSTEM_DATABASE_ERROR', { details: e.message });
    }
  }
}
