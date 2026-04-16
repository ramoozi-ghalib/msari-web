'use server';

/**
 * actions/bookings.ts — Server Actions للحجوزات
 *
 * Security model:
 *  - adminGuard() يجب أن يكون أول سطر في كل mutation للأدمن
 *  - totalPrice و nights و code لا تُقبل من الـ Client أبداً — تُحسب هنا
 *  - الـ Transaction تضمن عدم التعارض في التواريخ (no dirty reads)
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { BookingStatus, PaymentMethod, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import {
  adminGuard,
  handleActionSafe,
  SERVER_ERROR_RESPONSE,
} from '@/lib/action-guard';
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
  hotelId:       z.string().cuid('معرف الفندق غير صالح'),
  roomId:        z.string().cuid('معرف الغرفة غير صالح').optional(),
  guestName:     z.string().min(2, 'الاسم قصير جداً').max(100).trim(),
  guestEmail:    z.string().email('البريد الإلكتروني غير صحيح').max(254).toLowerCase().trim(),
  guestPhone:    z.string().min(7, 'رقم الهاتف قصير جداً').max(20).trim(),
  checkIn:       z.string().datetime({ message: 'تاريخ الوصول غير صالح' }),
  checkOut:      z.string().datetime({ message: 'تاريخ المغادرة غير صالح' }),
  guests:        z.number().int().min(1).max(20),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes:         z.string().max(1000).trim().optional(),
}).strict();

const GetAdminBookingsSchema = z.object({
  status:      z.nativeEnum(BookingStatus).optional(),
  q:           z.string().max(100).trim().optional(),
  page:        z.number().int().min(1).optional().default(1),
  pageSize:    z.number().int().min(1).max(100).optional().default(20),
}).strict();

const UpdateBookingStatusSchema = z.object({
  bookingId: z.string().cuid('معرف الحجز غير صالح'),
  newStatus: z.nativeEnum(BookingStatus),
}).strict();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يولّد كود حجز فريد بصيغة MS-XXXXXXXX.
 * الأحرف المختارة تستبعد: 0/O و 1/I/l لتفادي الالتباس البصري.
 */
function generateBookingCode(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MS-';
  for (let i = 0; i < 8; i++) {
    code += charset[Math.floor(Math.random() * charset.length)];
  }
  return code;
}

/**
 * يحاول توليد كود فريد في DB بعدد محدد من المحاولات.
 * الاحتمال الإحصائي للتعارض ضئيل جداً مع 8 أحرف (32^8 ≈ 1 تريليون تركيبة).
 *
 * Parameter type is Prisma.TransactionClient — NOT typeof prisma.
 * The transaction client omits $connect/$disconnect/$transaction to prevent
 * nested transactions, and TypeScript enforces this distinction.
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
  return null; // فشل نادر جداً — يُعالَج في الـ action
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
 *
 * PostgreSQL يرمي خطأ 40001 عند تعارض SERIALIZABLE transactions.
 * Prisma يُحوّله إلى P2034. هذه الدالة تُعيد المحاولة تلقائياً بانتظار
 * تصاعدي (exponential backoff) لتجنب تعارض فوري.
 *
 * @param fn - الـ transaction callback
 * @param maxRetries - الحد الأقصى للمحاولات (افتراضي: 3)
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

      // P2034: Transaction failed due to write conflict or deadlock (serialization failure)
      const isSerializationError =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034';

      if (!isSerializationError || attempt === maxRetries) {
        throw error; // أخطاء أخرى أو استنفاد المحاولات → نرمي فوراً
      }

      // Exponential backoff: 50ms, 100ms, 200ms ...
      const delay = 50 * Math.pow(2, attempt - 1);
      console.warn(
        `[withSerializableRetry] Serialization conflict (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms.`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError; // TypeScript — لن يصل هنا أبداً في الواقع
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE A: createBooking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ينشئ حجزاً جديداً ويحفظه في قاعدة البيانات.
 *
 * قواعد ثابتة:
 *  ① totalPrice يُحسب من DB — يُتجاهل أي رقم من الـ Client
 *  ② nights يُحسب server-side من الفرق الفعلي بين التاريخين
 *  ③ code يُولَّد server-side — لا يُقبل من الـ Client
 *  ④ status يبدأ PENDING دائماً
 *  ⑤ Transaction مع serializable isolation تمنع Double Booking
 */
export async function createBooking(rawData: unknown) {
  // ── 1. Validate input shape ──────────────────────────────────────────────
  const parsed = CreateBookingSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: {
        code: 'VALIDATION_ERROR' as const,
        message: 'بيانات الحجز غير صحيحة',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const input = parsed.data;
  const checkIn  = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);
  const now      = new Date();

  // ── 2. Business rule: dates ──────────────────────────────────────────────
  if (checkIn <= now) {
    return {
      success: false as const,
      error: { code: 'VALIDATION_ERROR' as const, message: 'تاريخ الوصول يجب أن يكون في المستقبل' },
    };
  }
  if (checkOut <= checkIn) {
    return {
      success: false as const,
      error: { code: 'VALIDATION_ERROR' as const, message: 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول' },
    };
  }

  // ── 3. Server-side nights calculation (ignores client) ───────────────────
  const nights = calculateNights(checkIn, checkOut);
  if (nights < 1 || nights > MAX_NIGHTS) {
    return {
      success: false as const,
      error: { code: 'VALIDATION_ERROR' as const, message: `مدة الإقامة يجب أن تكون بين 1 و ${MAX_NIGHTS} ليلة` },
    };
  }

  // ── 4. Read session (optional — guest booking allowed) ───────────────────
  const session = await auth();
  const userId  = session?.user?.id ?? null;

  try {
    // ── 5. Serializable transaction with automatic retry ─────────────────────
    // withSerializableRetry catches P2034 (serialization conflict) and retries
    // up to 3 times with exponential backoff before giving up.
    // The EXCLUDE constraint in DB is the true last line of defense —
    // it will reject any double-booking that slips past the application lock.
    const booking = await withSerializableRetry(() =>
    prisma.$transaction(async (tx) => {

      // ── 5a. Verify hotel exists and is active ───────────────────────────
      const hotel = await tx.hotel.findUnique({
        where:  { id: input.hotelId },
        select: { id: true, isActive: true, priceFrom: true, currency: true },
      });

      if (!hotel || !hotel.isActive) {
        throw new Error('HOTEL_NOT_FOUND');
      }

      // ── 5b. Verify room (if provided) → belongs to hotel + available ─────
      let pricePerNight = hotel.priceFrom;
      let currency      = hotel.currency;

      if (input.roomId) {
        const room = await tx.room.findUnique({
          where:  { id: input.roomId },
          select: { id: true, hotelId: true, isAvailable: true, pricePerNight: true, capacity: true },
        });

        if (!room || room.hotelId !== input.hotelId) {
          throw new Error('ROOM_NOT_FOUND');
        }
        if (!room.isAvailable) {
          throw new Error('ROOM_UNAVAILABLE');
        }
        if (input.guests > room.capacity) {
          throw new Error('GUESTS_EXCEED_CAPACITY');
        }

        pricePerNight = room.pricePerNight;

        // ── 5c. Overlap check: block double-booking for same room & dates ──
        const overlap = await tx.booking.findFirst({
          where: {
            roomId: input.roomId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            // overlapping condition: NOT (checkOut <= existing.checkIn OR checkIn >= existing.checkOut)
            AND: [
              { checkIn:  { lt: checkOut } },
              { checkOut: { gt: checkIn  } },
            ],
          },
          select: { id: true },
        });

        if (overlap) {
          throw new Error('ROOM_ALREADY_BOOKED');
        }
      }

      // ── 5d. Calculate totalPrice server-side — never trust client ────────
      //    Apply hotel discount if active
      const discount = await tx.discount.findUnique({
        where:  { hotelId: input.hotelId },
        select: { percentage: true, validFrom: true, validTo: true },
      });

      const isDiscountActive =
        discount &&
        now >= discount.validFrom &&
        now <= discount.validTo;

      const discountMultiplier = isDiscountActive
        ? (1 - discount!.percentage / 100)
        : 1;

      const totalPrice = parseFloat(
        (pricePerNight * nights * discountMultiplier).toFixed(2)
      );

      // ── 5e. Generate unique code ─────────────────────────────────────────
      const code = await generateUniqueCode(tx);
      if (!code) throw new Error('CODE_GENERATION_FAILED');

      // ── 5f. Write to DB ──────────────────────────────────────────────────
      return tx.booking.create({
        data: {
          code,
          hotelId:       input.hotelId,
          roomId:        input.roomId ?? null,
          userId:        userId,
          guestName:     input.guestName,
          guestEmail:    input.guestEmail,
          guestPhone:    input.guestPhone,
          checkIn,
          checkOut,
          nights,         // server-computed
          guests:        input.guests,
          totalPrice,     // server-computed
          currency,
          paymentMethod: input.paymentMethod,
          notes:         input.notes ?? null,
          status:        'PENDING',    // always
          paymentStatus: 'UNPAID',     // always
        },
        select: { id: true, code: true },
      });
    }, {
      isolationLevel: 'Serializable',
      timeout: 10_000, // 10 s — abort if DB is slow
    }));

    return { success: true as const, code: booking.code, id: booking.id };

  } catch (error) {
    // Surface known domain errors as user-friendly messages
    if (error instanceof Error) {
      const domainErrors: Record<string, string> = {
        HOTEL_NOT_FOUND:          'الفندق غير موجود أو غير متاح',
        ROOM_NOT_FOUND:           'الغرفة غير موجودة أو لا تنتمي لهذا الفندق',
        ROOM_UNAVAILABLE:         'الغرفة المختارة غير متاحة',
        GUESTS_EXCEED_CAPACITY:   'عدد الضيوف يتجاوز سعة الغرفة',
        ROOM_ALREADY_BOOKED:      'الغرفة محجوزة في هذه التواريخ — يرجى اختيار تواريخ أخرى',
        CODE_GENERATION_FAILED:   'حدث خطأ في المعالجة، يرجى المحاولة مرة أخرى',
      };

      const friendlyMessage = domainErrors[error.message];
      if (friendlyMessage) {
        return {
          success: false as const,
          error: { code: 'DOMAIN_ERROR' as const, message: friendlyMessage },
        };
      }
    }

    return handleActionSafe('createBooking', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE B: getAdminBookings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يجلب قائمة الحجوزات للوحة الأدمن مع دعم الفلترة والصفحات.
 * يتطلب: ADMIN أو SUPER_ADMIN
 */
export async function getAdminBookings(rawParams: unknown = {}) {
  // ── 1. Guard ─────────────────────────────────────────────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  // ── 2. Validate params ───────────────────────────────────────────────────
  const parsed = GetAdminBookingsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return {
      success: false as const,
      error: { code: 'VALIDATION_ERROR' as const, message: 'معاملات غير صالحة' },
    };
  }

  const { status, q, page, pageSize } = parsed.data;
  const safePageSize = clampLimit(pageSize, 20, 100);
  const safePage     = Math.max(1, page);
  const skip         = (safePage - 1) * safePageSize;

  // ── 3. Build where clause ────────────────────────────────────────────────
  const where = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { code:       { contains: q, mode: 'insensitive' as const } },
        { guestName:  { contains: q, mode: 'insensitive' as const } },
        { guestEmail: { contains: q, mode: 'insensitive' as const } },
        { guestPhone: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  };

  try {
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id:            true,
          code:          true,
          status:        true,
          paymentStatus: true,
          paymentMethod: true,
          guestName:     true,
          guestEmail:    true,
          guestPhone:    true,
          checkIn:       true,
          checkOut:      true,
          nights:        true,
          guests:        true,
          totalPrice:    true,
          currency:      true,
          notes:         true,
          createdAt:     true,
          hotel: {
            select: { id: true, nameAr: true, nameEn: true, slug: true },
          },
          room: {
            select: { id: true, nameAr: true, nameEn: true },
          },
          user: {
            select: { id: true, name: true, email: true },
            // passwordHash is NOT in this select — never exposed
          },
        },
        orderBy: { createdAt: 'desc' },
        take:    safePageSize,
        skip,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      success:  true as const,
      data:     bookings,
      total,
      page:     safePage,
      pageSize: safePageSize,
    };

  } catch (error) {
    return handleActionSafe('getAdminBookings', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE C: updateBookingStatus
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يُحدِّث حالة حجز.
 * يتحقق من صحة الانتقال قبل أي كتابة.
 * يتطلب: ADMIN أو SUPER_ADMIN
 */
export async function updateBookingStatus(rawData: unknown) {
  // ── 1. Guard ─────────────────────────────────────────────────────────────
  const guard = await adminGuard();
  if (!guard.ok) return guard.error;

  // ── 2. Validate input ────────────────────────────────────────────────────
  const parsed = UpdateBookingStatusSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: {
        code: 'VALIDATION_ERROR' as const,
        message: 'بيانات غير صالحة',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { bookingId, newStatus } = parsed.data;

  try {
    // ── 3. Fetch current state from DB ───────────────────────────────────
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: { id: true, status: true, paymentStatus: true },
    });

    if (!booking) {
      return {
        success: false as const,
        error: { code: 'NOT_FOUND' as const, message: 'الحجز غير موجود' },
      };
    }

    // ── 4. Validate transition ────────────────────────────────────────────
    const allowed = ALLOWED_TRANSITIONS[booking.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return {
        success: false as const,
        error: {
          code: 'INVALID_TRANSITION' as const,
          message: `لا يمكن تغيير الحالة من "${booking.status}" إلى "${newStatus}"`,
        },
      };
    }

    // ── 5. Auto-update paymentStatus when confirming ──────────────────────
    // CONFIRMED booking should reflect payment receipt acknowledgment
    const paymentStatusUpdate =
      newStatus === 'CONFIRMED' && booking.paymentStatus === 'UNPAID'
        ? { paymentStatus: 'PARTIAL' as const } // admin confirmed, but full PAID is manual
        : {};

    // ── 6. Write to DB ────────────────────────────────────────────────────
    await prisma.booking.update({
      where: { id: bookingId },
      data:  { status: newStatus, ...paymentStatusUpdate },
    });

    revalidatePath('/admin/bookings');

    return { success: true as const };

  } catch (error) {
    return handleActionSafe('updateBookingStatus', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USE CASE D: getMyBookings (للمستخدم المسجل — يرى حجوزاته فقط)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يجلب حجوزات المستخدم الحالي فقط.
 * يتطلب: جلسة مفعَّلة
 */
export async function getMyBookings() {
  const session = await auth();

  if (!session?.user?.id) {
    return SERVER_ERROR_RESPONSE;
  }

  try {
    const bookings = await prisma.booking.findMany({
      where:   { userId: session.user.id },
      select: {
        id:            true,
        code:          true,
        status:        true,
        paymentStatus: true,
        paymentMethod: true,
        checkIn:       true,
        checkOut:      true,
        nights:        true,
        guests:        true,
        totalPrice:    true,
        currency:      true,
        createdAt:     true,
        hotel: {
          select: { id: true, nameAr: true, nameEn: true, slug: true, thumbnailUrl: true },
        },
        room: {
          select: { id: true, nameAr: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take:    50,
    });

    return { success: true as const, data: bookings };

  } catch (error) {
    return handleActionSafe('getMyBookings', error);
  }
}
