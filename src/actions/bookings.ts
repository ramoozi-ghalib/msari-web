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
import { BookingStatus, PaymentMethod, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { apiClient } from '@/lib/api-client';
import { db } from '@/lib/firebase-admin';
import {
  adminGuard,
  handleActionSafe,
  SERVER_ERROR_RESPONSE,
} from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { clampLimit } from '@/lib/action-utils';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** الحد الأقصى لليالي المسموح بها في حجز واحد */
const MAX_NIGHTS = 90;

/**
 * الانتقالات المسموح بها بين حالات الحجز.
 * لا يمكن الانتقال إلا عبر هذه الخريطة — أي حالة غير مدرجة هي خطأ.
 */
const ALLOWED_TRANSITIONS: Readonly<
  Partial<Record<BookingStatus, BookingStatus[]>>
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
 * [FIX H-1] يولّد كود حجز فريد بصيغة MS-XXXXXXXX باستخدام
 * crypto.getRandomValues() — آمن تشفيرياً (CSPRNG).
 *
 * الأحرف المختارة تستبعد: 0/O و 1/I/l لتفادي الالتباس البصري.
 * السابق: Math.random() — غير آمن وقابل للتنبؤ.
 */
function generateBookingCode(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = 'MS-';
  for (let i = 0; i < 8; i++) {
    code += charset[bytes[i] % charset.length];
  }
  return code;
}

/**
 * يحاول توليد كود فريد في DB بعدد محدد من المحاولات.
 * الاحتمال الإحصائي للتعارض ضئيل جداً مع 8 أحرف (32^8 ≈ 1 تريليون تركيبة).
 */
async function generateUniqueCode(tx: Prisma.TransactionClient): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateBookingCode();
    const existing = await tx.booking.findUnique({
      where: { code },
      select: { code: true },
    });
    if (!existing) return code;
  }
  return null;
}

/**
 * يحسب عدد الليالي من تاريخين.
 * يُستدعى server-side فقط — قيمة الـ Client تُتجاهل دائماً.
 */
function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);
}

/**
 * يُعيد تنفيذ الـ transaction عند فشل الـ Serialization (Prisma P2034).
 */
async function withSerializableRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isSerializationError =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034';

      if (!isSerializationError || attempt === maxRetries) {
        throw error;
      }

      const delay = 50 * Math.pow(2, attempt - 1);
      console.warn(
        `[withSerializableRetry] Serialization conflict (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms.`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
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

  try {
    // ── 4. Map payment method to API expectations ──
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

    // ── 5. Call API Endpoint (POST /v1/bookings) ──
    const apiRes = await apiClient.post<any>(
      '/bookings',
      {
        hotelId: input.hotelId,
        roomId: input.roomId,
        fromDate: input.checkIn,
        toDate: input.checkOut,
        guestsCount: input.guests,
        nightsCount: nights,
        bookingOwnerName: input.guestName,
        bookingOwnerPhone: input.guestPhone,
        paymentMethod: mappedPaymentMethod,
        selectedCurrencyCode: input.selectedCurrencyCode || 'USD',
        isForAnotherGuest: input.isForAnotherGuest || false,
        anotherGuestName: input.isForAnotherGuest ? (input.anotherGuestName || '') : '',
        anotherGuestPhone: input.isForAnotherGuest ? (input.anotherGuestPhone || '') : '',
        senderName: input.senderName || null,
        senderNumber: input.senderNumber || null,
        transferAmount: input.transferAmount || null,
        transferCurrencyCode: input.transferCurrencyCode || null,
        transferToNumber: input.transferToNumber || '',
      },
      callerUser?.firebaseToken ? { Authorization: `Bearer ${callerUser.firebaseToken}` } : undefined
    );

    if (!apiRes.success || !apiRes.data) {
      await releaseLockSafely();
      logger('warn', 'API Booking Creation Error', { error: apiRes.error });
      
      const apiErrorCode = apiRes.error?.code || 'SERVER_ERROR';
      const domainErrors: Record<string, string> = {
        'not-found': 'الفندق أو الغرفة غير موجودة',
        'room-unavailable': 'الغرفة المطلوبة غير متاحة حالياً',
        'sold-out': 'عذراً الغرفة محجوزة بالكامل في هذه التواريخ',
        'invalid-argument': 'البيانات المرسلة غير صالحة',
        'unauthorized': 'جلسة العمل انتهت، يرجى تسجيل الدخول مرة أخرى',
        'forbidden': 'لا تملك صلاحية لإجراء هذا الحجز',
      };
      
      return { 
        success: false as const, 
        error: { 
          code: apiErrorCode, 
          message: domainErrors[apiErrorCode] || apiRes.error?.message || 'حدث خطأ أثناء معالجة الحجز' 
        } 
      };
    }

    const bookingData = apiRes.data;

    const finalResponse = {
      success: true as const,
      code: bookingData.bookingNumber,
      id: bookingData.id,
      totalPrice: bookingData.pricing?.totalInSelectedCurrency || bookingData.pricing?.totalUsd || 0,
      currency: bookingData.pricing?.selectedCurrencyCode || 'USD',
    };

    // ── 6. Cache Idempotency Success & Release ──
    if (redis && acquiredLock) {
      await redis.set(redisCacheKey, finalResponse, { ex: 86400 });
      await releaseLockSafely();
    }

    logger('info', 'Booking Created Successfully via API', { bookingId: bookingData.id });
    return finalResponse;

  } catch (error: any) {
    await releaseLockSafely();
    logger('error', 'Critical Action Exception', { error: error.message });
    return handleActionSafe('createBooking', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE B: previewBookingPrice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [NEW — M-8] يحسب السعر الفعلي server-side قبل إتمام الحجز.
 * يُستخدم في واجهة الحجز لعرض السعر الحقيقي للمستخدم.
 * لا يكتب أي بيانات — قراءة فقط.
 */
export async function previewBookingPrice(rawData: unknown) {
  const schema = z.object({
    hotelId:  z.string().regex(/^[a-zA-Z0-9_-]{3,50}$/, 'معرف الفندق غير صالح'),
    roomId:   z.string().regex(/^[a-zA-Z0-9_-]{3,50}$/, 'معرف الغرفة غير صالح').optional(),
    checkIn:  z.string().datetime(),
    checkOut: z.string().datetime(),
  }).strict();

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false as const, error: 'بيانات غير صالحة' };
  }

  const { hotelId, roomId, checkIn: ciStr, checkOut: coStr } = parsed.data;
  const checkIn  = new Date(ciStr);
  const checkOut = new Date(coStr);
  const nights   = calculateNights(checkIn, checkOut);

  if (nights < 1 || nights > MAX_NIGHTS) {
    return { success: false as const, error: 'مدة الإقامة غير صالحة' };
  }

  try {
    const hotelDoc = await db.collection('hotels').doc(hotelId).get();
    if (!hotelDoc.exists || hotelDoc.data()?.isDeleted) {
      return { success: false as const, error: 'الفندق غير موجود' };
    }
    const hotelData = hotelDoc.data()!;
    let pricePerNight = hotelData.price || hotelData.priceFrom || 0;
    const currency = 'USD'; // All prices in Firestore are USD

    if (roomId) {
      const roomDoc = await hotelDoc.ref.collection('rooms').doc(roomId).get();
      if (roomDoc.exists && !roomDoc.data()?.isDeleted) {
        pricePerNight = roomDoc.data()?.price || roomDoc.data()?.pricePerNight || 0;
      }
    }

    const baseTotal  = parseFloat((pricePerNight * nights).toFixed(2));
    const finalTotal = baseTotal;

    return {
      success: true as const,
      pricePerNight,
      nights,
      baseTotal,
      discountAmount: 0,
      finalTotal,
      currency,
    };
  } catch (error) {
    return handleActionSafe('previewBookingPrice', error);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// USE CASE E: getMyBookings
// ─────────────────────────────────────────────────────────────────────────────

function generateSlugFromHotel(id: string, name: string): string {
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

  if (idMap[id]) return idMap[id];
  if (idMap[id.toLowerCase()]) return idMap[id.toLowerCase()];
  
  if (id.includes('-')) return id;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!slug || slug === '-') {
    return id;
  }
  return slug;
}

/**
 * [FIX M-7] يجلب حجوزات المستخدم الحالي من Firestore مع دعم pagination.
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
  const skip         = (safePage - 1) * safePageSize;

  try {
    const entriesSnapshot = await db.collection('bookings')
      .doc(session.user.id)
      .collection('entries')
      .orderBy('createdAt', 'desc')
      .get();

    const allDocs = entriesSnapshot.docs;
    const total = allDocs.length;
    const paginatedDocs = allDocs.slice(skip, skip + safePageSize);

    const bookings = paginatedDocs.map(doc => {
      const data = doc.data();
      const checkInDate = data.stay?.fromDate?.toDate ? data.stay.fromDate.toDate() : new Date((data.stay?.fromDate?._seconds || 0) * 1000);
      const checkOutDate = data.stay?.toDate?.toDate ? data.stay.toDate.toDate() : new Date((data.stay?.toDate?._seconds || 0) * 1000);
      const createdDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date((data.createdAt?._seconds || 0) * 1000);

      return {
        id: doc.id,
        code: data.bookingNumber || doc.id,
        status: (data.status || 'PENDING').toUpperCase(),
        paymentStatus: (data.payment?.status || 'PENDING').toUpperCase(),
        paymentMethod: data.payment?.method || 'CASH',
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        nights: data.stay?.nightsCount || 1,
        guests: data.stay?.guestsCount || 1,
        totalPrice: data.pricing?.totalUsd || 0,
        currency: 'USD',
        createdAt: createdDate.toISOString(),
        hotel: {
          id: data.hotel?.id || '',
          nameAr: data.hotel?.name || 'فندق',
          nameEn: data.hotel?.name || 'Hotel',
          slug: data.hotel?.name ? generateSlugFromHotel(data.hotel.id, data.hotel.name) : '',
          thumbnailUrl: data.hotel?.imageUrl || null,
        },
        room: {
          id: data.room?.id || '',
          nameAr: data.room?.name || 'غرفة',
        },
      };
    });

    return {
      success:  true as const,
      data:     bookings,
      total,
      page:     safePage,
      pageSize: safePageSize,
    };

  } catch (error) {
    return handleActionSafe('getMyBookings', error);
  }
}
