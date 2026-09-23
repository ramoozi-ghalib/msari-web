'use server';

import { RegisterSchema } from '@/schemas/auth.schema';

import { apiClient } from '@/lib/api-client';

/**
 * Normalize user-entered phone to E.164 (UI-layer only).
 *
 * Backend `POST /v1/auth/register` passes phoneNumber straight to
 * `admin.auth().createUser`, which enforces E.164 strictly. This helper only
 * reshapes input — no backend/schema/rules change:
 * - strips spaces, dashes, dots, parentheses
 * - '00...' (IDD prefix) -> '+...'
 * - bare '967XXXXXXXXX' -> '+967XXXXXXXXX'
 * - bare Yemeni national '7XXXXXXXX' (9 digits) -> '+9677XXXXXXXX'
 *   (Yemen default matches site placeholder +967, WhatsApp 967, YER default)
 * - leading '+' kept as-is
 * Returns null when unparseable; caller fails closed with a clear message.
 */
function normalizePhoneE164(raw: string | undefined): string | null {
  if (!raw) return null;
  let p = raw.trim().replace(/[\s\-.()]/g, '');
  if (!p) return null;
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (p.startsWith('+')) return /^\+\d{7,15}$/.test(p) ? p : null;
  const digits = p.replace(/\D/g, '');
  if (/^967\d{9}$/.test(digits)) return '+' + digits;
  if (/^7\d{8}$/.test(digits)) return '+967' + digits;
  return null;
}

export async function registerUser(rawData: unknown) {
  const parsed = RegisterSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstField = (Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>)[0];
    const firstMsg = firstField ? fieldErrors[firstField]?.[0] : undefined;
    return {
      success: false as const,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstMsg || 'بيانات غير صالحة',
        fieldErrors,
      },
    };
  }

  const { name, email, password, phone } = parsed.data;

  // Phone is required by the signup UI. Backend accepts omission but enforces
  // E.164 strictly — fail closed here with a clear Arabic message instead of
  // letting the whole signup fail with a generic server error.
  const phoneE164 = normalizePhoneE164(phone);
  if (!phoneE164) {
    return {
      success: false as const,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'رقم الهاتف غير صالح — أدخله بالصيغة الدولية (مثال: +9677XXXXXXXX)',
        fieldErrors: { phone: ['رقم الهاتف غير صالح'] },
      },
    };
  }

  try {
    // NOTE: password is intentionally forwarded as entered (over TLS).
    // The API / Firebase Auth is the password hasher (scrypt, server-side) —
    // exactly what the mobile app does via the client SDK. Pre-hashing here
    // (bcrypt) would store the hash AS the password and break every later
    // plaintext login (web auto-login, web login, app login). This value is
    // never stored in Firestore and never logged.
    const apiRes = await apiClient.registerUser({
      name,
      email,
      password,
      phone: phoneE164,
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


