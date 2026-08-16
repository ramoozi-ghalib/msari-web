/**
 * src/app/api/partners/hotel-requests/route.ts
 *
 * Operational Application Backend API Contract for Hotel Partner Inquiries.
 * Stores requests in operational collection `hotel_partner_requests` (NOT CMS documents).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';

const hotelPartnerSchema = z.object({
  hotelName: z.string().min(2, 'اسم الفندق مطلوب').max(200),
  city: z.string().min(2, 'المدينة مطلوبة').max(100),
  address: z.string().max(500).optional().default(''),
  stars: z.string().optional().default('3').refine((val) => {
    const n = parseInt(val, 10);
    return !isNaN(n) && n >= 1 && n <= 5;
  }, { message: 'التصنيف يجب أن يكون بين 1 و 5 نجوم' }),
  ownerName: z.string().min(2, 'اسم المسؤول مطلوب').max(200),
  position: z.string().min(2, 'المسمى الوظيفي مطلوب').max(200),
  phone: z.string().min(6, 'رقم الهاتف مطلوب').max(20).regex(
    /^[+]?[\d\s()-]{6,20}$/,
    'صيغة رقم الهاتف غير صحيحة'
  ),
  email: z.string().optional().default('').refine(
    (val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: 'صيغة البريد الإلكتروني غير صحيحة' }
  ),
  rooms: z.string().optional().default('').refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
    { message: 'عدد الغرف يجب أن يكون رقماً صحيحاً غير سالب' }
  ),
  suites: z.string().optional().default('0').refine(
    (val) => val === '' || val === '0' || (!isNaN(Number(val)) && Number(val) >= 0),
    { message: 'عدد الأجنحة يجب أن يكون رقماً صحيحاً غير سالب' }
  ),
  amenities: z.string().max(2000).optional().default(''),
  message: z.string().max(5000).optional().default(''),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = hotelPartnerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = validatedData.data;
    const referenceNumber = `MSR-HTL-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const docRef = await db.collection('hotel_partner_requests').add({
      ...payload,
      referenceNumber,
      status: 'pending',
      createdAt: new Date(),
      source: 'web_partner_form',
    });

    return NextResponse.json({
      success: true,
      requestId: docRef.id,
      referenceNumber,
      message: 'تم استلام طلب إضافة الفندق بنجاح وسيتم التواصل معكم خلال ٢٤ ساعة.',
    });
  } catch (error: any) {
    console.error('Error submitting hotel partner request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً أو التواصل معنا عبر واتساب.',
      },
      { status: 500 }
    );
  }
}
