'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { RegisterSchema } from '@/schemas/auth.schema';
import { Prisma } from '@prisma/client';

import { apiClient } from '@/lib/api-client';

export async function registerUser(rawData: unknown) {
  const parsed = RegisterSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات غير صالحة',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { name, email, password, phone } = parsed.data;

  try {
    // 12 rounds for bcrypt is extremely secure against timing/brute force
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Call Cloud Functions API Gateway
    const apiRes = await apiClient.registerUser({
      name,
      email,
      passwordHash,
      phone: phone || null,
    });

    if (!apiRes.success) {
      if (apiRes.error?.code === 'DUPLICATE_EMAIL' || apiRes.error?.code === 'P2002') {
        return { 
          success: false as const, 
          error: { 
            code: 'DUPLICATE_EMAIL', 
            message: 'البريد الإلكتروني مستخدم بالفعل' 
          } 
        };
      }
      
      return {
        success: false as const,
        error: {
          code: apiRes.error?.code || 'SERVER_ERROR',
          message: apiRes.error?.message || 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
        }
      };
    }

    return { success: true as const };
  } catch (error: any) {
    console.error('Error in registerUser:', error);
    return { 
      success: false as const, 
      error: { 
        code: 'SERVER_ERROR', 
        message: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً' 
      } 
    };
  }
}

import { auth, signOut } from '@/auth';
import { admin } from '@/lib/firebase-admin';

export async function getProfile() {
  const session = await auth();
  if (!session?.user) {
    return { success: false as const, error: 'غير مصرح' };
  }
  return { success: true as const, data: session.user };
}

export async function logoutUser() {
  await signOut({ redirectTo: '/' });
}

export async function requestPasswordReset(rawEmail: string) {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return {
      success: false as const,
      error: { code: 'INVALID_EMAIL', message: 'يرجى إدخال بريد إلكتروني صالح' },
    };
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    if (apiKey) {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email,
        }),
      });

      const data = await res.json();
      if (data.error) {
        if (data.error.message === 'EMAIL_NOT_FOUND') {
          return {
            success: false as const,
            error: { code: 'EMAIL_NOT_FOUND', message: 'هذا البريد الإلكتروني غير مسجل في المنصة' },
          };
        }
        return {
          success: false as const,
          error: { code: data.error.message, message: 'تعذر إرسال رابط الاستعادة، يرجى التحقق من البريد الإلكتروني' },
        };
      }

      return { success: true as const };
    }

    if (admin.apps.length) {
      await admin.auth().generatePasswordResetLink(email);
      return { success: true as const };
    }

    return {
      success: false as const,
      error: { code: 'CONFIG_ERROR', message: 'تعذر معالجة الطلب حالياً، يرجى التواصل مع الدعم الفني' },
    };
  } catch (error: any) {
    console.error('Error in requestPasswordReset:', error);
    return {
      success: false as const,
      error: { code: 'SERVER_ERROR', message: 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً' },
    };
  }
}


