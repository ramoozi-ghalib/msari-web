'use server';

/**
 * actions/bookings.ts — Server Actions للحجوزات (API-First)
 *
 * Security model:
 *  - totalPrice و nights و code لا تُقبل من الـ Client أبداً — تُحسب على الخادم عبر الـ API
 *  - Idempotency lock (Redis SETNX) و rate limiting لمنع الحجوزات المكررة
 */

import crypto from 'crypto';
import { z } from 'zod';
import { Redis } from '@upstash/redis';

import { auth, getServerAuthTokens } from '@/auth';
import { apiClient, generateSlugFromHotel, type ApiResponse } from '@/lib/api-client';
import { SERVER_ERROR_RESPONSE } from '@/lib/action-guard';
import { clampLimit } from '@/lib/action-utils';
import { bookingLimiter, RATE_LIMIT_RESPONSE } from '@/lib/rate-limiter';
import { RECEIPT_MAX_BASE64_CHARS, validateReceiptDataUrl } from '@/lib/receipt-validation';

// Feature flag for API-first booking migration
// Defaults to true (API-first). Set to 'false' to disable.
const USE_BOOKING_API = process.env.USE_BOOKING_API !== 'false';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** الحد الأقصى لليالي المسموح بها في حجز واحد */
const MAX_NIGHTS = 90;

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

/** Session token pair (refreshToken present only for logins after the fix). */
type SessionTokenPair = { idToken: string; refreshToken?: string };

async function resolveSessionTokens(): Promise<SessionTokenPair | null> {
  const tokens = await getServerAuthTokens();
  if (!tokens) return null;
  if (tokens.idToken) {
    return { idToken: tokens.idToken, refreshToken: tokens.refreshToken };
  }
  if (tokens.refreshToken) {
    try {
      const ref = await apiClient.refreshFirebaseToken(tokens.refreshToken);
      if (ref.success && ref.data?.token) {
        return { idToken: ref.data.token, refreshToken: ref.data.refreshToken || tokens.refreshToken };
      }
    } catch {
      return null;
    }
  }
  return null;
}

function isAuthFailure<T>(res: ApiResponse<T>): boolean {
  const code = res.error?.code || '';
  return code === 'unauthenticated' || code === 'HTTP_401';
}

function isVerificationRequired<T>(res: ApiResponse<T>): boolean {
  const code = res.error?.code || '';
  if (code === 'phone-verification-required') return true;
  const combined = `${code} ${res.error?.message || ''}`;
  return /phone-verification-required|verified phone number is required/i.test(combined);
}

/**
 * Runs an authenticated API call with transparent recovery:
 * - 401 (stale Firebase ID token, sessions outlive the 1h token) →
 *   refresh via POST /v1/auth/refresh and retry ONCE with the new token.
 * - TIMEOUT_ERROR on read-only calls → single retry (caller opts in).
 * Never throws; never logs tokens. Session JWT is not mutated (retry-scoped).
 */
async function callWithFreshToken<T>(
  fn: (token: string) => Promise<ApiResponse<T>>,
  pair: SessionTokenPair,
  opts: { retryTimeoutOnce?: boolean } = {}
): Promise<ApiResponse<T>> {
  const first = await fn(pair.idToken);
  if (first.success) return first;
  if (isAuthFailure(first) && pair.refreshToken) {
    try {
      const ref = await apiClient.refreshFirebaseToken(pair.refreshToken);
      if (ref.success && ref.data?.token) {
        return await fn(ref.data.token);
      }
    } catch {
      // fall through to original failure
    }
  } else if (first.error?.code === 'TIMEOUT_ERROR' && opts.retryTimeoutOnce) {
    return await fn(pair.idToken);
  }
  return first;
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE A: createBooking
// ─────────────────────────────────────────────────────────────────────────────

const getRedisClient = () => {
  try { return Redis.fromEnv(); } catch { return null; }
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
    await releaseLockSafely();
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

   // ── Validate bank transfer receipt upfront before creating booking ──
   let validatedReceipt: { contentType: string; buffer: Buffer } | null = null;
   if (mappedPaymentMethod === 'transfer' && input.receiptDataUrl) {
     const receiptCheck = validateReceiptDataUrl(input.receiptDataUrl);
     if (!receiptCheck.ok) {
       await releaseLockSafely();
       logger('warn', 'Invalid receipt payload rejected', { reason: receiptCheck.reason });
       return {
         success: false as const,
         error: { code: 'VALIDATION_ERROR' as const, message: 'إيصال الدفع غير صالح (يُسمح بصور JPEG/PNG/WebP حتى 5 ميجابايت)' },
       };
     }
     validatedReceipt = { contentType: receiptCheck.contentType, buffer: receiptCheck.buffer };
   }

    // ── API-First Path (Phase 4) ──────────────────────────────────────────────
    const pair = callerUser?.id ? await resolveSessionTokens() : null;
    if (USE_BOOKING_API && callerUser?.id && pair) {
      try {
        const apiRes = await callWithFreshToken(
          (token) => apiClient.createBooking(
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
            token,
            idempotencyKey
          ),
          pair
        );

        if (!apiRes.success) {
          await releaseLockSafely();
          logger('warn', 'API Booking Creation Failed', { error: apiRes.error });
          if (isAuthFailure(apiRes)) {
            return { success: false as const, error: { code: 'SESSION_EXPIRED', message: 'انتهت الجلسة. يرجى تسجيل الدخول مجددًا ثم إعادة المحاولة.' } };
          }
          if (isVerificationRequired(apiRes)) {
            return {
              success: false as const,
              error: {
                code: 'VERIFICATION_REQUIRED' as const,
                message: 'يرجى تفعيل حسابك أولاً عبر رمز التحقق المرسل لبريدك الإلكتروني لإتمام الحجز.',
              },
            };
          }
          return { success: false as const, error: { code: 'API_ERROR', message: apiRes.error?.message || 'Booking creation failed via API' } };
        }

        // Upload bank transfer receipt to POST /v1/bookings/:id/payment immediately after creation
        const createdBookingId = apiRes.data?.bookingNumber || apiRes.data?.id || '';
        let receiptUploaded = false;
        if (validatedReceipt && createdBookingId) {
          const uploadRes = await callWithFreshToken(
            (token) => apiClient.uploadReceiptBuffer(
              createdBookingId,
              validatedReceipt!.buffer,
              validatedReceipt!.contentType,
              input.receiptFileName || 'receipt',
              token,
              idempotencyKey ? `${idempotencyKey}:receipt` : undefined
            ),
            pair
          );
          receiptUploaded = Boolean(uploadRes.success);
          if (!uploadRes.success) {
            logger('warn', 'Booking created but receipt upload failed', {
              bookingId: createdBookingId,
              error: uploadRes.error,
            });
          }
        }

        const successResult = {
          success: true as const,
          code: createdBookingId,
          id: apiRes.data?.id,
          totalPrice: apiRes.data?.pricing?.totalInSelectedCurrency || 0,
          currency: apiRes.data?.pricing?.selectedCurrencyCode || 'USD',
          receiptUploaded,
        };

        if (redis && redisCacheKey) {
          await redis.set(redisCacheKey, successResult, { ex: 3600 }).catch((e) => {
            logger('warn', 'Idempotency cache write failed', { error: String(e) });
          });
        }

        await releaseLockSafely();
        logger('info', 'Booking Created via API', { bookingId: apiRes.data?.id, receiptUploaded });
        return successResult;
      } catch (apiError) {
        await releaseLockSafely();
        logger('warn', 'API Booking Error', { error: String(apiError) });
        return { success: false as const, error: { code: 'API_ERROR', message: 'Booking creation failed via API' } };
      }
    }

    await releaseLockSafely();
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
    guestsCount: z.number().int().min(1).max(20).optional().default(1),
    currency: z.string().optional(),
  }).strict();

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false as const, error: 'بيانات غير صالحة' };
  }

  const { hotelId, roomId, checkIn: ciStr, checkOut: coStr, currency, guestsCount } = parsed.data;

  // ── API-First Path (Phase 4) ──────────────────────────────────────────
  if (USE_BOOKING_API) {
    const pair = await resolveSessionTokens();

    if (pair) {
      try {
        const apiRes = await callWithFreshToken(
          (token) => apiClient.previewBooking(
            { hotelId, roomId: roomId || '', fromDate: ciStr, toDate: coStr, currency, guestsCount },
            token
          ),
          pair,
          { retryTimeoutOnce: true }
        );
        if (apiRes.success && apiRes.data) {
          // USD is the display SoT: formatPrice(usdAmount) converts per user
          // currency client-side. totalInSelectedCurrency is backend-default
          // SAR here (no currency sent) and must NOT be displayed as-is.
          const finalTotal = apiRes.data.totalUsd;
          const originalTotal =
            typeof apiRes.data.originalTotalUsd === 'number' && apiRes.data.originalTotalUsd > finalTotal
              ? apiRes.data.originalTotalUsd
              : finalTotal;
          const discountPercent =
            typeof apiRes.data.discountPercent === 'number' && apiRes.data.discountPercent > 0
              ? apiRes.data.discountPercent
              : 0;
          const discountUsd = Math.max(0, Math.round((originalTotal - finalTotal) * 100) / 100);
          return {
            success: true as const,
            pricePerNight: apiRes.data.pricePerNightUsd,
            originalPricePerNight: apiRes.data.originalPricePerNightUsd ?? apiRes.data.pricePerNightUsd,
            nights: apiRes.data.nights,
            baseTotal: originalTotal,
            discountPercent,
            discountAmount: discountUsd,
            discountSource: apiRes.data.discountSource ?? null,
            finalTotal,
            currency: 'USD',
          };
        }
        if (apiRes.error && isAuthFailure(apiRes)) {
          return { success: false as const, code: 'SESSION_EXPIRED' as const, error: 'انتهت الجلسة. يرجى تسجيل الدخول مجددًا.' };
        }
        if (apiRes.error && isVerificationRequired(apiRes)) {
          return {
            success: false as const,
            code: 'VERIFICATION_REQUIRED' as const,
            error: 'يرجى تفعيل حسابك أولاً عبر رمز التحقق لإتمام الحجز.',
          };
        }
        // Production tripwire (no tokens, no PII): records the exact backend
        // failure behind a $0/spinner outcome in Vercel logs.
        console.warn('[booking-preview-failed]', JSON.stringify({
          code: (apiRes.error as any)?.code || 'UNKNOWN',
          message: (apiRes.error as any)?.message || 'unknown',
          hotelId, roomIdPresent: !!roomId, hasRefresh: !!pair.refreshToken,
        }));
      } catch (apiError) {
        console.warn('API Preview Error:', apiError);
      }
      return { success: false as const, code: 'PREVIEW_FAILED' as const, error: 'تعذر حساب السعر النهائي الآن. يرجى المحاولة لاحقًا.' };
    }
  }
  // ── API is required. No Firestore fallback. ──
  return { success: false as const, code: 'PREVIEW_FAILED' as const, error: 'API unavailable or missing firebaseToken' };
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE E: getMyBookings
// ─────────────────────────────────────────────────────────────────────────────

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
  const pair = await resolveSessionTokens();

  if (pair) {
    try {
      const apiRes = await callWithFreshToken(
        (token) => apiClient.getMyBookings(
          { page: safePage, pageSize: safePageSize },
          token
        ),
        pair,
        { retryTimeoutOnce: true }
      );
    if (apiRes.success && apiRes.data) {
        const bookings = apiRes.data.data.map((b: any) => {
        // USD SoT for display: backend totalInSelectedCurrency is unreliable
        // (case-sensitive rate lookup degrades to the SAR rate, e.g. USD
        // snapshots stored as 105*3.8). For USD-coded bookings show totalUsd;
        // genuinely foreign-coded snapshots pass through untouched.
        const storedCode = String(b.pricing?.selectedCurrencyCode || 'USD').toUpperCase();
        const isUsd = storedCode === 'USD';
        return {
          id: b.id,
          code: b.bookingNumber,
          status: (b.status || 'PENDING').toUpperCase(),
          paymentStatus: (b.payment?.status || 'PENDING').toUpperCase(),
          paymentMethod: b.payment?.method || 'CASH',
          checkIn: b.stay?.fromDate,
          checkOut: b.stay?.toDate,
          nights: b.stay?.nightsCount || 1,
          guests: b.stay?.guestsCount || 1,
          totalPrice: isUsd
            ? (b.pricing?.totalUsd ?? b.pricing?.totalInSelectedCurrency ?? 0)
            : (b.pricing?.totalInSelectedCurrency ?? b.pricing?.totalUsd ?? 0),
          currency: isUsd ? 'USD' : storedCode,
          createdAt: b.createdAt,
          hotel: {
            id: b.hotel?.id || '',
            nameAr: typeof b.hotel?.name === 'object' ? (b.hotel.name.ar || b.hotel.name.en || 'فندق') : (b.hotel?.name || 'فندق'),
            nameEn: typeof b.hotel?.name === 'object' ? (b.hotel.name.en || b.hotel.name.ar || 'Hotel') : (b.hotel?.name || 'Hotel'),
            slug: b.hotel?.id
              ? generateSlugFromHotel(
                  b.hotel.id,
                  typeof b.hotel?.name === 'object'
                    ? (b.hotel.name.en || b.hotel.name.ar || '')
                    : String(b.hotel?.name || '')
                )
              : '',
            thumbnailUrl: b.hotel?.imageUrl || null,
          },
          room: {
            id: b.room?.id || '',
            nameAr: typeof b.room?.name === 'object' ? (b.room.name.ar || b.room.name.en || 'غرفة') : (b.room?.name || 'غرفة'),
          },
        };
        });
        
        return {
          success: true as const,
          data: bookings,
          total: apiRes.data.count,
          nextCursor: apiRes.data.nextCursor,
          page: safePage,
          pageSize: safePageSize,
        };
      }
      if (isAuthFailure(apiRes)) {
        return { success: false as const, error: { code: 'SESSION_EXPIRED' as const, message: 'انتهت الجلسة. يرجى تسجيل الدخول مجددًا.' } };
      }
      console.warn('[bookings-history-failed]', JSON.stringify({
        code: (apiRes.error as any)?.code || 'UNKNOWN',
        message: (apiRes.error as any)?.message || 'unknown',
        hasRefresh: !!pair.refreshToken,
      }));
      return { success: false as const, error: { code: 'API_ERROR', message: apiRes.error?.message || 'Failed to fetch bookings' } };
    } catch (apiError) {
      console.warn('API getMyBookings Error:', apiError);
      return { success: false as const, error: { code: 'API_ERROR', message: 'Failed to fetch bookings via API' } };
    }
  }

  return { success: false as const, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };
}
