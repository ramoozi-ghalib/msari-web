import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ServiceResponse, createError, ServiceError, ServiceErrorCode } from '@/lib/errors';
import { HotelPricingService } from '@/services/booking/HotelPricingService';
import { BookingService } from '@/services/booking/BookingService';
import { Policies } from '@/lib/policies';
import { Prisma } from '@prisma/client';

type CreateBookingInput = {
  correlationId: string;
  callerUser: any | null;
  hotelId: string;
  roomId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  paymentMethod: any;
  notes?: string;
  now: Date;
};

// True Exponential Backoff with Jitter for Prisma Serialization Retry
async function withSerializableRetry<T>(fn: () => Promise<T>, correlationId: string, maxRetries = 4): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isSerializationError = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
      if (!isSerializationError || attempt === maxRetries) throw error;
      
      const baseDelay = 100 * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 50;
      const delay = Math.round(baseDelay + jitter);
      
      console.warn(JSON.stringify({ 
        timestamp: new Date().toISOString(), level: 'warn', correlationId, 
        msg: `Serializable conflict. Retry ${attempt}/${maxRetries} in ${delay}ms` 
      }));
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw lastError;
}

export class CreateBookingUseCase {
  static async execute(input: CreateBookingInput): Promise<ServiceResponse<any>> {
    const log = (level: 'info'|'error', msg: string, meta: any={}) => {
      console[level](JSON.stringify({ timestamp: new Date().toISOString(), level, correlationId: input.correlationId, msg, layer: 'UseCase', ...meta }));
    };

    log('info', 'Executing CreateBookingUseCase');

    // 1. Authorization Check
    if (!Policies.canCreateBooking(input.callerUser)) {
      log('error', 'Policy Check Failed: INSUFFICIENT_PERMISSIONS');
      return createError('INSUFFICIENT_PERMISSIONS', { action: 'CREATE_BOOKING' });
    }

    try {
      // 2. Perform Pricing OUTSIDE the transaction
      const pricingRes = await HotelPricingService.validateAndCalculatePrice({
        hotelId: input.hotelId,
        roomId: input.roomId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guests: input.guests,
        nights: input.nights,
        now: input.now,
      });

      if (!pricingRes.success) {
        log('error', 'HotelPricingService validation failed', { code: pricingRes.error.code });
        throw pricingRes.error;
      }

      // 3. Transaction Boundary for Mutation
      const result = await withSerializableRetry(() => 
        prisma.$transaction(async (tx) => {
          
          if (input.roomId) {
            const overlap = await tx.booking.findFirst({
              where: {
                roomId: input.roomId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                AND: [{ checkIn: { lt: input.checkOut } }, { checkOut: { gt: input.checkIn } }],
              },
              select: { id: true },
            });
            if (overlap) {
              throw createError('ROOM_ALREADY_BOOKED', { roomId: input.roomId, checkIn: input.checkIn.toISOString(), checkOut: input.checkOut.toISOString() }).error;
            }
          }

          const bookingRes = await BookingService.createBookingRecord(tx, {
            userId: input.callerUser?.id || null,
            hotelId: input.hotelId,
            roomId: input.roomId || null,
            guestName: input.guestName,
            guestEmail: input.guestEmail,
            guestPhone: input.guestPhone,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            nights: input.nights,
            guests: input.guests,
            totalPrice: pricingRes.data.totalPrice,
            currency: pricingRes.data.currency,
            paymentMethod: input.paymentMethod,
            notes: input.notes || null,
          });

          if (!bookingRes.success) throw bookingRes.error;

          return bookingRes.data;
        }, { isolationLevel: 'Serializable', timeout: 10000 })
      , input.correlationId);

      log('info', 'Booking Transaction Committed', { bookingId: result.id });

      // 4. Cache Invalidation Separation
      // Update Administrative Lists
      revalidatePath('/admin/bookings');
      // Update Public Availability for this specific hotel
      revalidatePath(`/destinations/[citySlug]/${input.hotelId}`);

      return { success: true, data: result };

    } catch (e: any) {
      if (e && e.code && e.meta) {
        return { success: false, error: e as ServiceError<ServiceErrorCode> };
      }
      
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
         log('error', 'P2002 Unique/Exclude DB Constraint hit');
         return createError('ROOM_ALREADY_BOOKED', { roomId: input.roomId!, checkIn: input.checkIn.toISOString(), checkOut: input.checkOut.toISOString() });
      }

      log('error', 'Unhandled Database System Error', { error: e.message });
      return createError('SYSTEM_DATABASE_ERROR', { details: e.message });
    }
  }
}
