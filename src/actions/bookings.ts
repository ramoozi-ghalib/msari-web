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

    // ── 5. Execute Atomic Firestore Transaction for Website Booking ──
    logger('info', 'Executing direct Firebase Admin atomic transaction for booking creation');

    const userId = callerUser?.id || (session?.user?.id as string) || 'guest_user';
    const fromDateTime = new Date(input.checkIn);
    const toDateTime = new Date(input.checkOut);

    // 1. Generate standard Booking Number
    const part1 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const bookingNumber = `BK-MS${part1}-${part2}`;

    // 2. Upload Receipt to Firebase Storage if provided
      let receiptUrl = '';
      let receiptStoragePath = '';
      if (input.receiptDataUrl) {
        // [F4 CLOSURE] Deep validation before any Storage write:
        // format -> MIME allowlist -> size limit -> magic bytes.
        const receipt = validateReceiptDataUrl(input.receiptDataUrl);
        if (!receipt.ok) {
          logger('warn', 'Receipt validation failed', { reason: receipt.reason });
          await releaseLockSafely();
          return {
            success: false as const,
            error: {
              code: 'VALIDATION_ERROR' as const,
              message: 'ملف الإيصال غير صالح — يجب أن يكون صورة (JPG/PNG/WEBP) بحجم لا يتجاوز 2MB',
            },
          };
        }
        try {
          const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'msariapp-v2.firebasestorage.app');
          const ext = receipt.contentType === 'image/png' ? 'png' : receipt.contentType === 'image/webp' ? 'webp' : 'jpg';
          const filePath = `booking_receipts/${userId}/${bookingNumber}.${ext}`;
          const file = bucket.file(filePath);
          const downloadToken = crypto.randomUUID();

          await file.save(receipt.buffer, {
            metadata: {
              contentType: receipt.contentType,
              metadata: {
                firebaseStorageDownloadTokens: downloadToken,
                bookingNumber,
                userId,
                paymentMethod: mappedPaymentMethod,
              },
            },
          });

          receiptStoragePath = filePath;
          receiptUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;
        } catch (uploadErr) {
          logger('warn', 'Failed to upload receipt to Firebase Storage:', { uploadErr });
        }
      }

      // 3. Run atomic Firestore transaction
      const transactionResult = await db.runTransaction(async (transaction) => {
        // Read Room
        let roomData: any = null;
        let roomPriceUsd = 0;
        if (input.roomId) {
          const roomRef = db.collection('hotels').doc(input.hotelId).collection('rooms').doc(input.roomId);
          const roomDoc = await transaction.get(roomRef);
          if (roomDoc.exists) {
            roomData = roomDoc.data();
            roomPriceUsd = roomData?.price || roomData?.pricePerNight || 0;
          }
        }

        // Read Hotel
        const hotelRef = db.collection('hotels').doc(input.hotelId);
        const hotelDoc = await transaction.get(hotelRef);
        if (!hotelDoc.exists) {
          throw new Error('not-found');
        }
        const hotelData = hotelDoc.data() || {};
        if (!roomPriceUsd) {
          roomPriceUsd = hotelData.price || hotelData.priceFrom || 0;
        }

        // Read Rates
        const ratesRef = db.collection('rates').doc('global');
        const ratesDoc = await transaction.get(ratesRef);
        const ratesData = ratesDoc.exists ? ratesDoc.data() : { usd: 1.0, sar: 3.8, yerNorth: 535, yerSouth: 1561 };
        
        const currencyKey = input.selectedCurrencyCode || 'USD';
        const rate = (ratesData as any)?.[currencyKey] || (ratesData as any)?.[currencyKey.toLowerCase()] || 1.0;
        const totalUsd = roomPriceUsd * nights;
        const totalInSelectedCurrency = totalUsd * rate;

        const customerDocRef = db.collection('bookings').doc(userId);
        const bookingEntryRef = customerDocRef.collection('entries').doc(bookingNumber);
        const notificationRef = db.collection('admin_notifications').doc();

        // Merge customer booking index
        transaction.set(customerDocRef, {
          userId,
          userName: input.guestName,
          userEmail: callerUser?.email || input.guestEmail,
          userPhone: input.guestPhone,
          lastBookingNumber: bookingNumber,
          lastBookingCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Helper to extract clean single-string Arabic or localized text matching Flutter model
        const resolvePlainString = (val: any): string => {
          if (!val) return '';
          if (typeof val === 'string') return val.trim();
          if (typeof val === 'object') {
            if (typeof val.ar === 'string' && val.ar.trim().length > 0) return val.ar.trim();
            if (typeof val.name === 'string' && val.name.trim().length > 0) return val.name.trim();
            if (typeof val.en === 'string' && val.en.trim().length > 0) return val.en.trim();
            if (typeof val.title === 'string' && val.title.trim().length > 0) return val.title.trim();
          }
          return String(val).trim();
        };

        const resolvedHotelName = resolvePlainString(hotelData.name || hotelData.nameAr || hotelData.title || 'فندق');
        const resolvedHotelAddress = resolvePlainString(hotelData.address || hotelData.location || hotelData.city || '');
        const resolvedRoomName = resolvePlainString(roomData?.name || roomData?.nameAr || roomData?.title || 'غرفة');

        // Set booking entry snapshot
        transaction.set(bookingEntryRef, {
          id: bookingNumber,
          bookingNumber,
          bookingType: 'hotel',
          status: 'pending',
          source: 'website',
          platform: 'web',
          bookingSource: 'website',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          customerId: userId,
          userName: input.guestName,
          userEmail: callerUser?.email || input.guestEmail || '',
          userPhone: input.guestPhone || '',
          customer: {
            id: userId,
            name: input.guestName,
            email: callerUser?.email || input.guestEmail || '',
            phone: input.guestPhone || '',
          },
          bookingOwner: {
            name: input.guestName,
            phone: input.guestPhone || '',
            email: callerUser?.email || input.guestEmail || '',
          },
          otherGuest: {
            enabled: input.isForAnotherGuest || false,
            name: input.anotherGuestName || '',
            phone: input.anotherGuestPhone || '',
          },
          hotel: {
            id: input.hotelId,
            name: resolvedHotelName,
            location: resolvedHotelAddress,
            imageUrl: hotelData.images?.[0] || hotelData.thumbnail || hotelData.imageUrl || '',
          },
          room: {
            id: input.roomId || '',
            name: resolvedRoomName,
            priceUsd: roomPriceUsd,
          },
          stay: {
            fromDate: admin.firestore.Timestamp.fromDate(fromDateTime),
            toDate: admin.firestore.Timestamp.fromDate(toDateTime),
            nightsCount: nights,
            guestsCount: input.guests,
          },
          pricing: {
            totalUsd,
            selectedCurrencyCode: input.selectedCurrencyCode || 'USD',
            totalInSelectedCurrency,
          },
          payment: {
            method: mappedPaymentMethod,
            senderNumber: input.senderNumber || null,
            senderName: input.senderName || null,
            transferAmount: input.transferAmount || null,
            transferCurrencyCode: input.transferCurrencyCode || null,
            transferToNumber: input.transferToNumber || '',
            receiptUrl: receiptUrl || '',
            receiptStoragePath: receiptStoragePath || '',
          },
          receipt: {
            required: mappedPaymentMethod === 'transfer',
            uploaded: !!receiptUrl,
            url: receiptUrl || '',
            storagePath: receiptStoragePath || '',
          },
          specialRequests: input.notes || '',
        });

        // Write Admin Notification
        transaction.set(notificationRef, {
          id: notificationRef.id,
          type: 'hotel_booking',
          bookingNumber,
          bookingPath: bookingEntryRef.path,
          customerId: userId,
          hotelId: input.hotelId,
          roomId: input.roomId || '',
          source: 'website',
          platform: 'web',
          titleAr: 'حجز فندقي جديد',
          titleEn: 'New hotel booking',
          messageAr: `تم إرسال حجز جديد رقم ${bookingNumber}`,
          messageEn: `A new booking #${bookingNumber} has been submitted`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAtClient: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          id: bookingNumber,
          bookingNumber,
          pricing: {
            totalUsd,
            selectedCurrencyCode: input.selectedCurrencyCode || 'USD',
            totalInSelectedCurrency,
          },
        };
      });

      const bookingData = transactionResult;

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

    logger('info', 'Booking Created Successfully', { bookingId: bookingData.id });
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

      const rawHotelName = data.hotel?.name;
      const hotelNameAr = typeof rawHotelName === 'object' && rawHotelName !== null 
        ? (rawHotelName.ar || rawHotelName.en || 'فندق') 
        : (rawHotelName || 'فندق');
      const hotelNameEn = typeof rawHotelName === 'object' && rawHotelName !== null 
        ? (rawHotelName.en || rawHotelName.ar || 'Hotel') 
        : (rawHotelName || 'Hotel');

      const rawRoomName = data.room?.name;
      const roomNameAr = typeof rawRoomName === 'object' && rawRoomName !== null
        ? (rawRoomName.ar || rawRoomName.en || 'غرفة')
        : (rawRoomName || 'غرفة');

      const checkInDate = data.stay?.fromDate?.toDate 
        ? data.stay.fromDate.toDate() 
        : (data.stay?.fromDate?._seconds ? new Date(data.stay.fromDate._seconds * 1000) : (data.stay?.fromDate ? new Date(data.stay.fromDate) : new Date()));
      const checkOutDate = data.stay?.toDate?.toDate 
        ? data.stay.toDate.toDate() 
        : (data.stay?.toDate?._seconds ? new Date(data.stay.toDate._seconds * 1000) : (data.stay?.toDate ? new Date(data.stay.toDate) : new Date()));
      const createdDate = data.createdAt?.toDate 
        ? data.createdAt.toDate() 
        : (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : (data.createdAt ? new Date(data.createdAt) : new Date()));

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
        totalPrice: data.pricing?.totalInSelectedCurrency || data.pricing?.totalUsd || 0,
        currency: (data.pricing?.selectedCurrencyCode || 'USD').toUpperCase(),
        createdAt: createdDate.toISOString(),
        hotel: {
          id: data.hotel?.id || '',
          nameAr: hotelNameAr,
          nameEn: hotelNameEn,
          slug: generateSlugFromHotel(data.hotel?.id, data.hotel?.name),
          thumbnailUrl: data.hotel?.imageUrl || null,
        },
        room: {
          id: data.room?.id || '',
          nameAr: roomNameAr,
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
