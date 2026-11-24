'use server';

import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { RegisterSchema } from '@/schemas/auth.schema';
import { apiClient, type ApiResponse } from '@/lib/api-client';
import { admin } from '@/lib/firebase-admin';
import { normalizeArabicDigits, normalizePhoneE164 } from '@/lib/phone';

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

function isAuthFailure<T>(res: ApiResponse<T>): boolean {
  const code = res.error?.code || '';
  return code === 'unauthenticated' || code === 'HTTP_401';
}

/**
 * Runs an authenticated backend API call using the signed-in user's Firebase ID token.
 * On 401 (`unauthenticated` / `HTTP_401`), refreshes via `refreshFirebaseToken` and retries once.
 */
async function callAuthApiWithRefresh<T>(
  fn: (idToken: string) => Promise<ApiResponse<T>>,
  existingSession?: Session | null
): Promise<{
  session: Session | null;
  res: ApiResponse<T>;
}> {
  const session: Session | null = existingSession !== undefined ? existingSession : await auth();
  if (!session?.user) {
    return {
      session: null,
      res: {
        success: false,
        error: { code: 'unauthenticated', message: 'Unauthenticated' },
      },
    };
  }

  let idToken = session.user.firebaseToken || '';
  const refreshToken = session.user.refreshToken || '';

  if (!idToken && refreshToken) {
    try {
      const ref = await apiClient.refreshFirebaseToken(refreshToken);
      if (ref.success && ref.data?.token) {
        idToken = ref.data.token;
      }
    } catch {
      // Fall through to unauthenticated response
    }
  }

  if (!idToken) {
    return {
      session,
      res: {
        success: false,
        error: { code: 'unauthenticated', message: 'Unauthenticated' },
      },
    };
  }

  const first = await fn(idToken);
  if (first.success) {
    return { session, res: first };
  }

  if (isAuthFailure(first) && refreshToken) {
    try {
      const ref = await apiClient.refreshFirebaseToken(refreshToken);
      if (ref.success && ref.data?.token) {
        const retry = await fn(ref.data.token);
        return { session, res: retry };
      }
    } catch {
      // Fall through to original auth error
    }
  }

  return { session, res: first };
}

export async function requestEmailVerificationOtp(rawPhone?: string): Promise<
  | {
      success: true;
      data: {
        maskedEmail: string;
        expiresAtMs: number;
        cooldownSec: number;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        retryAfterSec?: number;
      };
    }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false as const,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'يرجى تسجيل الدخول أولاً.',
      },
    };
  }

  let phoneE164: string | undefined;
  if (rawPhone !== undefined && rawPhone.trim() !== '') {
    const normalized = normalizePhoneE164(rawPhone);
    if (!normalized) {
      return {
        success: false as const,
        error: {
          code: 'INVALID_PHONE',
          message: 'رقم الهاتف غير صالح — أدخله بالصيغة الدولية (مثال: +9677XXXXXXXX)',
        },
      };
    }
    phoneE164 = normalized;
  }

  try {
    const { res } = await callAuthApiWithRefresh(
      (token) => apiClient.requestEmailOtp(token, session.user.email || undefined, phoneE164),
      session
    );

    if (res.success && res.data) {
      return {
        success: true as const,
        data: {
          maskedEmail: res.data.email || session.user.email || '',
          expiresAtMs: res.data.expiresAtMs,
          cooldownSec: typeof res.data.cooldownSec === 'number' ? res.data.cooldownSec : 60,
        },
      };
    }

    if (isAuthFailure(res)) {
      return {
        success: false as const,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.',
        },
      };
    }

    const errCode = res.error?.code || '';
    if (errCode === 'cooldown') {
      const retryAfterSec =
        typeof res.error?.retryAfterSec === 'number' ? res.error.retryAfterSec : undefined;
      return {
        success: false as const,
        error: {
          code: 'COOLDOWN',
          message: retryAfterSec
            ? `تم إرسال رمز تحقق مسبقاً. يمكنك طلب رمز جديد بعد ${retryAfterSec} ثانية.`
            : 'تم إرسال رمز تحقق مسبقاً. يرجى الانتظار قليلاً قبل إعادة الإرسال.',
          retryAfterSec,
        },
      };
    }

    if (errCode === 'limit') {
      return {
        success: false as const,
        error: {
          code: 'DAILY_LIMIT',
          message: 'تجاوزت الحد اليومي المسموح لطلبات رمز التحقق. يرجى المحاولة غداً.',
        },
      };
    }

    if (errCode === 'email-mismatch') {
      return {
        success: false as const,
        error: {
          code: 'EMAIL_MISMATCH',
          message: 'البريد الإلكتروني غير مطابق لحسابك المسجل.',
        },
      };
    }

    return {
      success: false as const,
      error: {
        code: errCode || 'SERVER_ERROR',
        message: res.error?.message || 'تعذر إرسال رمز التحقق حالياً، يرجى المحاولة لاحقاً.',
      },
    };
  } catch (error) {
    console.error('Error in requestEmailVerificationOtp:', error);
    return {
      success: false as const,
      error: {
        code: 'SERVER_ERROR',
        message: 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.',
      },
    };
  }
}

export async function verifyEmailVerificationOtp(rawCode: string, rawPhone?: string): Promise<
  | {
      success: true;
      data: {
        verified: true;
        phoneNumber: string;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    }
> {
  const code = normalizeArabicDigits(String(rawCode || ''))
    .replace(/\s+/g, '')
    .trim();

  if (!/^\d{6}$/.test(code)) {
    return {
      success: false as const,
      error: {
        code: 'INVALID_CODE',
        message: 'يرجى إدخال رمز مكون من 6 أرقام',
      },
    };
  }

  const session = await auth();
  if (!session?.user) {
    return {
      success: false as const,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'يرجى تسجيل الدخول أولاً.',
      },
    };
  }

  let explicitPhone: string | undefined;
  if (rawPhone !== undefined && rawPhone.trim() !== '') {
    const normalized = normalizePhoneE164(rawPhone);
    if (!normalized) {
      return {
        success: false as const,
        error: {
          code: 'INVALID_PHONE',
          message: 'رقم الهاتف غير صالح — أدخله بالصيغة الدولية (مثال: +9677XXXXXXXX)',
        },
      };
    }
    explicitPhone = normalized;
  }

  try {
    const phoneToVerify = explicitPhone || session.user.pendingPhone || session.user.phone || undefined;
    const { res } = await callAuthApiWithRefresh(
      (token) => apiClient.verifyEmailOtp(token, code, phoneToVerify),
      session
    );

    if (res.success && res.data?.verified) {
      return {
        success: true as const,
        data: {
          verified: true as const,
          phoneNumber: res.data?.phoneNumber || '',
        },
      };
    }

    if (isAuthFailure(res)) {
      return {
        success: false as const,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.',
        },
      };
    }

    const errCode = res.error?.code || '';
    if (errCode === 'invalid-verification-code') {
      return {
        success: false as const,
        error: {
          code: 'INVALID_CODE',
          message: 'رمز التحقق غير صحيح، يرجى التأكد والمحاولة مرة أخرى.',
        },
      };
    }

    if (errCode === 'otp-expired') {
      return {
        success: false as const,
        error: {
          code: 'OTP_EXPIRED',
          message: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد.',
        },
      };
    }

    if (errCode === 'too-many-attempts') {
      return {
        success: false as const,
        error: {
          code: 'TOO_MANY_ATTEMPTS',
          message: 'تجاوزت عدد المحاولات المسموحة، يرجى طلب رمز تحقق جديد.',
        },
      };
    }

    if (errCode === 'uid-mismatch' || errCode === 'email-mismatch') {
      return {
        success: false as const,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'لا يمكن التحقق من هذا الحساب. يرجى تسجيل الدخول مجدداً.',
        },
      };
    }

    return {
      success: false as const,
      error: {
        code: errCode || 'VERIFY_FAILED',
        message: res.error?.message || 'تعذر التحقق من الرمز حالياً، يرجى المحاولة لاحقاً.',
      },
    };
  } catch (error) {
    console.error('Error in verifyEmailVerificationOtp:', error);
    return {
      success: false as const,
      error: {
        code: 'SERVER_ERROR',
        message: 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.',
      },
    };
  }
}

export async function checkAccountVerificationStatus(): Promise<
  | {
      authenticated: false;
      isVerified: false;
    }
  | {
      authenticated: true;
      isVerified: boolean;
      email: string;
      phone: string;
      pendingPhone: string;
    }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      authenticated: false as const,
      isVerified: false as const,
    };
  }

  try {
    const { res } = await callAuthApiWithRefresh(
      (token) => apiClient.getMe(token),
      session
    );

    if (res.success && res.data) {
      const rawMe = res.data as any;
      const me = rawMe?.user || rawMe?.customer || rawMe?.profile || rawMe?.data || rawMe;
      const isVerified =
        typeof me?.isVerified === 'boolean'
          ? me.isVerified
          : me?.otpPending === true
            ? false
            : typeof session.user.isVerified === 'boolean'
              ? session.user.isVerified
              : true;

      return {
        authenticated: true as const,
        isVerified,
        email: session.user.email || me?.email || '',
        phone: me?.phoneNumber || session.user.phone || '',
        pendingPhone: me?.pendingPhone || session.user.pendingPhone || '',
      };
    }
  } catch (error) {
    console.warn('Error in checkAccountVerificationStatus:', error);
  }

  // Fallback to session state only if the live /me request failed
  return {
    authenticated: true as const,
    isVerified: typeof session.user.isVerified === 'boolean' ? session.user.isVerified : true,
    email: session.user.email || '',
    phone: session.user.phone || '',
    pendingPhone: session.user.pendingPhone || '',
  };
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


