/**
 * src/app/api/partners/hotel-requests/route.ts
 *
 * Operational Application Backend API Contract for Hotel Partner Inquiries.
 * Requires user authentication to submit a request and links the request to the user account.
 * Stores validated requests in operational collection `hotel_partner_requests`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { db, admin, storage } from '@/lib/firebase-admin';
import { partnerRequestLimiter } from '@/lib/rate-limiter';
import { RECEIPT_MAX_BASE64_CHARS, validateReceiptDataUrl } from '@/lib/receipt-validation';

const hotelPartnerSchema = z.object({
  hotelName: z.string().min(2, 'اسم الفندق مطلوب ويجب ألا يقل عن حرفين').max(200),
  city: z.string().min(2, 'المدينة مطلوبة').max(100),
  stars: z.string().refine((val) => {
    const n = parseInt(val, 10);
    return !isNaN(n) && n >= 1 && n <= 5;
  }, { message: 'التصنيف يجب أن يكون بين 1 و 5 نجوم' }),
  address: z.string().min(3, 'العنوان التفصيلي مطلوب').max(500),
  googleMapsUrl: z.string().min(5, 'رابط موقع الفندق على خرائط Google مطلوب').max(1000),
  hotelWebsite: z.string().max(500).optional().default(''),
  hotelEmail: z.string().min(5, 'البريد الإلكتروني للفندق مطلوب').refine(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: 'صيغة البريد الإلكتروني للفندق غير صحيحة' }
  ),
  rooms: z.string().min(1, 'عدد الغرف مطلوب').refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 1,
    { message: 'عدد الغرف يجب أن يكون رقماً صحيحاً (1 على الأقل)' }
  ),
  suites: z.string().optional().default('0').refine(
    (val) => val === '' || val === '0' || (!isNaN(Number(val)) && Number(val) >= 0),
    { message: 'عدد الأجنحة يجب أن يكون رقماً صحيحاً غير سالب' }
  ),
  amenities: z.string().min(2, 'المرافق والخدمات المتوفرة مطلوبة').max(2000),
  facadeImageUrl: z.string().min(5, 'صورة واجهة الفندق مطلوبة كإجراء أساسي').max(RECEIPT_MAX_BASE64_CHARS, 'حجم صورة واجهة الفندق يتجاوز الحد المسموح (5MB)'),
  ownerName: z.string().min(3, 'اسم المسؤول الرباعي مطلوب').max(200),
  position: z.string().min(2, 'المسمى الوظيفي / الصفة مطلوبة').max(200),
  phone: z.string().min(8, 'رقم الهاتف / واتساب مطلوب').max(25).regex(
    /^[+]?[\d\s()-]{8,25}$/,
    'صيغة رقم الهاتف غير صحيحة'
  ),
  ownerEmail: z.string().optional().default('').refine(
    (val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: 'صيغة البريد الإلكتروني للمسؤول غير صحيحة' }
  ),
  message: z.string().max(5000).optional().default(''),
  honeypot: z.string().optional().default(''),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce user authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'يجب تسجيل الدخول بحسابك أولاً لتقديم ومتابعة طلب إضافة الفندق.',
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    // 1b. Per-user rate limit (5 requests/hour)
    const rateGate = await partnerRequestLimiter.limit(session.user.id);
    if (!rateGate.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'تم تجاوز الحد الأقصى لتقديم الطلبات حالياً. يرجى المحاولة لاحقاً.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot check against bot spam
    if (body.honeypot && body.honeypot.trim().length > 0) {
      console.warn('[hotel-requests] Honeypot field filled. Rejecting bot submission.');
      return NextResponse.json({ success: true, message: 'Request received' });
    }

    const validatedData = hotelPartnerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'يرجى استكمال جميع الحقول المطلوبة والتأكد من صحة البيانات.',
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = validatedData.data;
    const referenceNumber = `MSR-HTL-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    let storedImageUrl = '';

    // Validate & upload Base64 data URL (JPEG/PNG/WebP, <=5MB, magic bytes) or require https URL
    if (payload.facadeImageUrl.startsWith('data:')) {
      const validated = validateReceiptDataUrl(payload.facadeImageUrl);
      if (!validated.ok) {
        return NextResponse.json(
          {
            success: false,
            error: 'صورة واجهة الفندق غير صالحة. يُسمح فقط بملفات JPEG أو PNG أو WebP بحجم أقصى 5 ميجابايت.',
          },
          { status: 400 }
        );
      }

      const ext = validated.contentType === 'image/png' ? 'png' : validated.contentType === 'image/webp' ? 'webp' : 'jpg';
      const filename = `partner_requests/${referenceNumber}/facade_${Date.now()}.${ext}`;
      const bucket = storage.bucket();
      const file = bucket.file(filename);

      await file.save(validated.buffer, {
        metadata: { contentType: validated.contentType, cacheControl: 'public, max-age=31536000' },
      });

      storedImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
    } else {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(payload.facadeImageUrl);
      } catch {
        return NextResponse.json(
          { success: false, error: 'رابط صورة واجهة الفندق غير صالح.' },
          { status: 400 }
        );
      }
      if (parsedUrl.protocol !== 'https:') {
        return NextResponse.json(
          { success: false, error: 'يجب أن يستخدم رابط صورة واجهة الفندق بروتوكول HTTPS.' },
          { status: 400 }
        );
      }
      storedImageUrl = parsedUrl.toString();
    }

    // Save to Firestore collection `hotel_partner_requests` linked with user account
    const docRef = await db.collection('hotel_partner_requests').add({
      userId: session.user.id,
      userEmail: session.user.email || payload.ownerEmail || '',
      hotelName: payload.hotelName,
      city: payload.city,
      stars: payload.stars,
      address: payload.address,
      googleMapsUrl: payload.googleMapsUrl,
      hotelWebsite: payload.hotelWebsite || '',
      hotelEmail: payload.hotelEmail,
      rooms: payload.rooms,
      suites: payload.suites || '0',
      amenities: payload.amenities,
      facadeImageUrl: storedImageUrl,
      ownerName: payload.ownerName,
      position: payload.position,
      phone: payload.phone,
      ownerEmail: payload.ownerEmail || '',
      message: payload.message || '',
      referenceNumber,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'web_partner_form',
    });

    return NextResponse.json({
      success: true,
      requestId: docRef.id,
      referenceNumber,
      message: 'تم استلام طلب إضافة الفندق بنجاح وسيتم التواصل معكم خلال ٢٤ ساعة لمراجعة البيانات.',
    });
  } catch (error: any) {
    console.error('Error submitting hotel partner request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً أو التواصل معنا مباشرة عبر واتساب.',
      },
      { status: 500 }
    );
  }
}
