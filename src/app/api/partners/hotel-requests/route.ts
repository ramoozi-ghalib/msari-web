/**
 * src/app/api/partners/hotel-requests/route.ts
 *
 * Operational Application Backend API Contract for Hotel Partner Inquiries.
 * Stores validated requests in operational collection `hotel_partner_requests`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, admin, storage } from '@/lib/firebase-admin';

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
  facadeImageUrl: z.string().min(5, 'صورة واجهة الفندق مطلوبة كإجراء أساسي'),
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

    let storedImageUrl = payload.facadeImageUrl;

    // If image is sent as Base64 data URL, upload to Firebase Storage
    if (payload.facadeImageUrl.startsWith('data:image/')) {
      try {
        const matches = payload.facadeImageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const contentType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
          const filename = `partner_requests/${referenceNumber}/facade_${Date.now()}.${ext}`;

          const bucket = storage.bucket();
          const file = bucket.file(filename);

          await file.save(buffer, {
            metadata: { contentType, cacheControl: 'public, max-age=31536000' },
          });

          // Generate Firebase storage download URL
          storedImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
        }
      } catch (uploadErr) {
        console.warn('[hotel-requests] Failed to upload image to Firebase Storage, saving original reference:', uploadErr);
      }
    }

    // Save to Firestore collection `hotel_partner_requests`
    const docRef = await db.collection('hotel_partner_requests').add({
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
