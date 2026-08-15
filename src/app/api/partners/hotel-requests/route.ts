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
  hotelName: z.string().min(2, 'اسم الفندق مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  address: z.string().optional().default(''),
  stars: z.string().optional().default('3'),
  ownerName: z.string().min(2, 'اسم المسؤول مطلوب'),
  position: z.string().min(2, 'المسمى الوظيفي مطلوب'),
  phone: z.string().min(6, 'رقم الهاتف مطلوب'),
  email: z.string().optional().default(''),
  rooms: z.string().optional().default(''),
  suites: z.string().optional().default('0'),
  amenities: z.string().optional().default(''),
  message: z.string().optional().default(''),
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
