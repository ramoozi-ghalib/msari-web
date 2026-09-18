'use server';

/**
 * actions/bookings.ts — Server Actions للحجوزات
 *
 * Security model:
 *  - adminGuard() يجب أن يكون أول سطر في كل mutation للأدمن
 *  - totalPrice و nights و code لا تُقبل من الـ Client أبداً — تُحسب هنا
 *  - الـ Transaction تضمن عدم التعارض في التواريخ (no dirty reads)
 *
 * Fixes applied:
 *  - H-1: Math.random() → crypto.getRandomValues() (Cryptographically Secure)
 *  - H-5: updateBookingStatus مُغلَّف بـ $transaction لمنع Race Condition
 *  - M-7: getMyBookings يدعم pagination بدلاً من take: 50 الثابت
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import crypto from 'crypto';
import { auth } from '@/auth';
import { apiClient } from '@/lib/api-client';
import { db, admin, storage } from '@/lib/firebase-admin';
import {
  adminGuard,
  handleActionSafe,
  SERVER_ERROR_RESPONSE,
} from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { clampLimit } from '@/lib/action-utils';
import { bookingLimiter, RATE_LIMIT_RESPONSE } from '@/lib/rate-limiter';
import { validateReceiptDataUrl, RECEIPT_MAX_BASE64_CHARS } from '@/lib/receipt-validation';

// Feature flag for API-first booking migration
// Defaults to true (API-first). Set to 'false' to disable.
const USE_BOOKING_API = process.env.USE_BOOKING_API !== 'false';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** الحد الأقصى لليالي المسموح بها في حجز واحد */
const MAX_NIGHTS = 90;

/** حالات الحجز — مطابقة لنموذج التطبيق التشغيلي في Firestore */
type BookingStatusKey = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

/**
 * الانتقالات المسموح بها بين حالات الحجز.
 * لا يمكن الانتقال إلا عبر هذه الخريطة — أي حالة غير مدرجة هي خطأ.
 */
const ALLOWED_TRANSITIONS: Readonly<
  Partial<Record<BookingStatusKey, BookingStatusKey[]>>
> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  // CANCELLED, COMPLETED, NO_SHOW → terminal, no transitions allowed
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const CreateBookingSchema = z.object({
  hotelId:              z.string().min(1, 'معرف الفندق مطلوب'),
  roomId:               z.string().min(1, 'معرف الغرفة مطلوب').optional(),
  guestName:            z.string().min(2, 'الاسم قصير جداً').max(100).trim(),
  guestEmail:           z.string().email('البريد الإلكتروني غير صحيح').max(254).toLowerCase().trim(),
  guestPhone:           z.string().min(7, 'رقم الهاتف قصير جداً').max(20).trim(),
  checkIn:              z.string().datetime({ message: 'تاريخ الوصول غير صالح' }),
  checkOut:             z.string().datetime({ message: 'تاريخ المغادرة غير صالح' }),
  guests:               z.number().int().min(1).max(20),
  paymentMethod:        z.string().min(1, 'طريقة الدفع مطلوبة'),
  selectedCurrencyCode: z.string().optional().default('USD'),
  isForAnotherGuest:    z.boolean().optional().default(false),
  anotherGuestName:     z.string().max(100).trim().optional(),
  anotherGuestPhone:    z.string().max(20).trim().optional(),
  senderName:           z.string().max(100).trim().optional(),
  senderNumber:         z.string().max(30).trim().optional(),
  transferAmount:       z.number().nonnegative().optional(),
  transferCurrencyCode: z.string().optional(),
  transferToNumber:     z.string().max(50).trim().optional(),
  receiptDataUrl:       z.string().max(RECEIPT_MAX_BASE64_CHARS, 'حجم إيصال الدفع يتجاوز الحد المسموح').optional(),
  receiptFileName:      z.string().max(200).optional(),
  notes:                z.string().max(1000).trim().optional(),
}).strict();

const GetMyBookingsSchema = z.object({
  page:     z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(50).optional().default(10),
}).strict();


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يحسب عدد الليالي من تاريخين.
 * يُستدعى server-side فقط — قيمة الـ Client تُتجاهل دائماً.
 */
function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE A: createBooking
// ─────────────────────────────────────────────────────────────────────────────

import { Redis } from '@upstash/redis';

const getRedisClient = () => {
  try { return Redis.fromEnv(); } catch (err) { return null; }
};

/**
 * ينشئ حجزاً جديداً عبر UseCase Layer (Thin Controller)
 */
export async function createBooking(rawData: unknown, idempotencyKey?: string) {
  const correlationId = crypto.randomUUID();
  const requestId = crypto.randomUUID(); // For lock ownership
  const logger = (level: 'info'|'warn'|'error', msg: string, meta: any = {}) => {
    console[level](JSON.stringify({ timestamp: new Date().toISOString(), level, correlationId, msg, ...meta }));
  };

  logger('info', 'Create Booking Action Invoked');

  // ── 1. Read Auth User ──
  const session = await auth();
  const callerUser = session?.user || null;

  // ── 2. Idempotency Check & Safe Locking (Redis SETNX + Owner Validated) ──
  const redis = getRedisClient();
  let redisCacheKey = '';
  let acquiredLock = false;

  if (redis && idempotencyKey && callerUser?.id) {
    redisCacheKey = `idempotency:booking:${callerUser.id}:${idempotencyKey}`;
    const cachedResponse = await redis.get(redisCacheKey);
    if (cachedResponse) {
      logger('info', 'Idempotency Cache Hit. Returning prior result.');
      return cachedResponse as any;
    }

    const lockKey = `lock:${redisCacheKey}`;
    const locked = await redis.set(lockKey, requestId, { nx: true, ex: 15 });
    if (!locked) {
      logger('warn', 'Idempotency Lock Conflict', { idempotencyKey });
      return { success: false as const, error: { code: 'CONFLICT', message: 'طلب الحجز قيد المعالجة. يرجى الانتظار.' } };
    }
    acquiredLock = true;
    logger('info', 'Idempotency Lock Acquired', { lockKey });
  }

  // ── Helper to release lock safely ──
  const releaseLockSafely = async () => {
    if (redis && acquiredLock) {
      // Lua script: Only delete if the lock value matches our requestId
      const luaScript = `if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end`;
      await redis.eval(luaScript, [`lock:${redisCacheKey}`], [requestId]);
      logger('info', 'Idempotency Lock Released Safely');
    }
  };

  // ── 3. Validate input shape (Zod) ──
  const parsed = CreateBookingSchema.safeParse(rawData);
  if (!parsed.success) {
    await releaseLockSafely();
    logger('warn', 'Zod Validation Error', { errors: parsed.error.flatten().fieldErrors });
    return { success: false as const, error: { code: 'VALIDATION_ERROR' as const, message: 'بيانات غير صحيحة', fieldErrors: parsed.error.flatten().fieldErrors } };
  }

  const input = parsed.data;

  // [F4 CLOSURE] Booking-creation rate limit — 10/hour per caller identity.
  // Guests are keyed by their (validated) email; logged-in users by uid.
  const limiterKey = (callerUser?.id || input.guestEmail).toLowerCase();
  const bookingAllowed = await bookingLimiter.limit(limiterKey);
  if (!bookingAllowed.success) {
    logger('warn', 'Booking creation rate limit exceeded', { key: limiterKey.slice(0, 3) + '***' });
    return RATE_LIMIT_RESPONSE;
  }

  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);
  const now = new Date();

  // Basic sanity validation
  if (checkIn <= now || checkOut <= checkIn) {
    await releaseLockSafely();
    return { success: false as const, error: { code: 'VALIDATION_ERROR' as const, message: 'تأكد من صحة تواريخ الحجز' } };
  }

   const nights = calculateNights(checkIn, checkOut);
   if (nights < 1 || nights > MAX_NIGHTS) {
     await releaseLockSafely();
     return { success: false as const, error: { code: 'VALIDATION_ERROR' as const, message: `مدة الإقامة بين 1 و ${MAX_NIGHTS} ليلة` } };
   }

   // ── Map payment method to API expectations ──
   let mappedPaymentMethod = input.paymentMethod;
   if (input.paymentMethod === 'BANK_TRANSFER' || input.paymentMethod === 'transfer') {
     mappedPaymentMethod = 'transfer';
   } else if (input.paymentMethod === 'WHATSAPP' || input.paymentMethod === 'whatsapp') {
     mappedPaymentMethod = 'whatsapp';
   } else if (input.paymentMethod === 'CASH' || input.paymentMethod === 'cash') {
     mappedPaymentMethod = 'cash';
   } else if (input.paymentMethod === 'CREDIT_CARD') {
     mappedPaymentMethod = 'credit_card';
   }

   // ── API-First Path (Phase 4) ──────────────────────────────────────────────
   if (USE_BOOKING_API && callerUser?.id && (callerUser as any).firebaseToken) {
     const firebaseToken = (callerUser as any).firebaseToken;
     
     try {
       const apiRes = await apiClient.createBooking(
         {
           hotelId: input.hotelId,
           roomId: input.roomId || '',
           fromDate: input.checkIn,
           toDate: input.checkOut,
           guestsCount: input.guests,
           nightsCount: nights,
           bookingOwnerName: input.guestName,
           bookingOwnerPhone: input.guestPhone,
           paymentMethod: mappedPaymentMethod,
           selectedCurrencyCode: input.selectedCurrencyCode || 'USD',
           isForAnotherGuest: input.isForAnotherGuest || false,
           anotherGuestName: input.anotherGuestName || '',
           anotherGuestPhone: input.anotherGuestPhone || '',
           senderNumber: input.senderNumber || '',
           senderName: input.senderName || '',
           transferAmount: input.transferAmount,
           transferCurrencyCode: input.transferCurrencyCode,
           transferToNumber: input.transferToNumber,
         },
         firebaseToken,
         idempotencyKey
       );
       
       await releaseLockSafely();
       
       if (!apiRes.success) {
         logger('warn', 'API Booking Creation Failed', { error: apiRes.error });
         return { success: false as const, error: { code: 'API_ERROR', message: apiRes.error?.message || 'Booking creation failed via API' } };
       }
       
       logger('info', 'Booking Created via API', { bookingId: apiRes.data?.id });
       return { 
         success: true as const, 
         code: apiRes.data?.bookingNumber || apiRes.data?.id,
         id: apiRes.data?.id,
         totalPrice: apiRes.data?.pricing?.totalInSelectedCurrency || 0,
         currency: apiRes.data?.pricing?.selectedCurrencyCode || 'USD',
       };
     } catch (apiError) {
       await releaseLockSafely();
       logger('warn', 'API Booking Error', { error: String(apiError) });
       return { success: false as const, error: { code: 'API_ERROR', message: 'Booking creation failed via API' } };
     }
   }

   return { success: false as const, error: { code: 'AUTH_REQUIRED', message: 'Authentication required for booking' } };
 }

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE B: previewBookingPrice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [NEW — M-8] يحسب السعر الفعلي server-side قبل إتمام الحجز.
 * يُستخدم في واجهة الحجز لعرض السعر الحقيقي للمستخدم.
 * لا يكتب أي بيانات — قراءة فقط.
 * API-First: يستخدم POST /v1/bookings/preview فقط بدون fallback لـ Firestore.
 */
export async function previewBookingPrice(rawData: unknown) {
  const schema = z.object({
    hotelId:  z.string().regex(/^[a-zA-Z0-9_-]{3,50}$/, 'معرف الفندق غير صالح'),
    roomId:   z.string().regex(/^[a-zA-Z0-9_-]{3,50}$/, 'معرف الغرفة غير صالح').optional(),
    checkIn:  z.string().datetime(),
    checkOut: z.string().datetime(),
    currency: z.string().optional(),
  }).strict();

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false as const, error: 'بيانات غير صالحة' };
  }

  const { hotelId, roomId, checkIn: ciStr, checkOut: coStr, currency } = parsed.data;

  // ── API-First Path (Phase 4) ──────────────────────────────────────────
  if (USE_BOOKING_API) {
    const session = await auth();
    const firebaseToken = (session?.user as any)?.firebaseToken;
    
    if (firebaseToken && roomId) {
      try {
        const apiRes = await apiClient.previewBooking(
          { hotelId, roomId, fromDate: ciStr, toDate: coStr, currency },
          firebaseToken
        );
        if (apiRes.success && apiRes.data) {
          return { 
            success: true as const, 
            pricePerNight: apiRes.data.pricePerNightUsd,
            nights: apiRes.data.nights,
            baseTotal: apiRes.data.totalUsd,
            discountAmount: 0,
            finalTotal: apiRes.data.totalInSelectedCurrency,
            currency: apiRes.data.currency,
          };
        }
      } catch (apiError) {
        console.warn('API Preview Error:', apiError);
      }
    }
  }
  // ── API is required. No Firestore fallback. ──
  return { success: false as const, error: 'API unavailable or missing firebaseToken' };
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE E: getMyBookings
// ─────────────────────────────────────────────────────────────────────────────

function generateSlugFromHotel(id: string, name: any): string {
  const idMap: Record<string, string> = {
    'h_movenpick': 'movenpick-hotel-sanaa',
    'h_hilton': 'hilton-sanaa',
    'h_sheraton': 'sheraton-sanaa-resort',
    'h_qamar': 'qamar-aden-hotel',
    'h_saif': 'saif-aden-hotel',
    'h_seyun': 'seyun-almukalla-hotel',
    'h_eastern': 'eastern-taiz-hotel',
    'h_seashore': 'hudaydah-seashore-hotel',
  };

  if (!id) return '';
  if (idMap[id]) return idMap[id];
  if (idMap[id.toLowerCase()]) return idMap[id.toLowerCase()];
  
  if (id.includes('-')) return id;

  const rawStr = typeof name === 'object' && name !== null 
    ? (name.en || name.ar || id) 
    : String(name || id);

  const slug = rawStr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!slug || slug === '-') {
    return id;
  }
  return slug;
}

/**
 * [FIX M-7] يجلب حجوزات المستخدم الحالي عبر API مع دعم cursor pagination.
 * API-First only — لا يوجد fallback لـ Firestore.
 */
export async function getMyBookings(rawParams: unknown = {}) {
  const session = await auth();

  if (!session?.user?.id) {
    return SERVER_ERROR_RESPONSE;
  }

  const parsed = GetMyBookingsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return {
      success: false as const,
      error: { code: 'VALIDATION_ERROR' as const, message: 'معاملات غير صالحة' },
    };
  }

  const { page, pageSize } = parsed.data;
  const safePageSize = clampLimit(pageSize, 10, 50);
  const safePage     = Math.max(1, page);

  // ── API-First Path (Phase 4) ──────────────────────────────────────────
  const firebaseToken = (session.user as any)?.firebaseToken;
    
  if (firebaseToken) {
    try {
      const apiRes = await apiClient.getMyBookings(
        { page: safePage, pageSize: safePageSize },
        firebaseToken
      );
      if (apiRes.success && apiRes.data) {
        const bookings = apiRes.data.data.map((b: any) => ({
          id: b.id,
          code: b.bookingNumber,
          status: (b.status || 'PENDING').toUpperCase(),
          paymentStatus: (b.payment?.status || 'PENDING').toUpperCase(),
          paymentMethod: b.payment?.method || 'CASH',
          checkIn: b.stay?.fromDate,
          checkOut: b.stay?.toDate,
          nights: b.stay?.nightsCount || 1,
          guests: b.stay?.guestsCount || 1,
          totalPrice: b.pricing?.totalInSelectedCurrency || b.pricing?.totalUsd || 0,
          currency: (b.pricing?.selectedCurrencyCode || 'USD').toUpperCase(),
          createdAt: b.createdAt,
          hotel: {
            id: b.hotel?.id || '',
            nameAr: typeof b.hotel?.name === 'object' ? (b.hotel.name.ar || b.hotel.name.en || 'فندق') : (b.hotel?.name || 'فندق'),
            nameEn: typeof b.hotel?.name === 'object' ? (b.hotel.name.en || b.hotel.name.ar || 'Hotel') : (b.hotel?.name || 'Hotel'),
            slug: generateSlugFromHotel(b.hotel?.id, typeof b.hotel?.name === 'object' ? b.hotel.name.en : b.hotel?.name),
            thumbnailUrl: b.hotel?.imageUrl || null,
          },
          room: {
            id: b.room?.id || '',
            nameAr: typeof b.room?.name === 'object' ? (b.room.name.ar || b.room.name.en || 'غرفة') : (b.room?.name || 'غرفة'),
          },
        }));
        
        return {
          success: true as const,
          data: bookings,
          total: apiRes.data.count,
          nextCursor: apiRes.data.nextCursor,
          page: safePage,
          pageSize: safePageSize,
        };
      }
      return { success: false as const, error: { code: 'API_ERROR', message: apiRes.error?.message || 'Failed to fetch bookings' } };
    } catch (apiError) {
      console.warn('API getMyBookings Error:', apiError);
      return { success: false as const, error: { code: 'API_ERROR', message: 'Failed to fetch bookings via API' } };
    }
  }

  return { success: false as const, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };
}
