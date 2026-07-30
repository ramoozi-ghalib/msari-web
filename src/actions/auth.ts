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
