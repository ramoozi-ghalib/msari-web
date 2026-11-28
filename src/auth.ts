/**
 * auth.ts — Full Auth.js (NextAuth v5) configuration.
 *
 * This file uses Node.js-only imports (firebase-admin, bcryptjs) and must NEVER be
 * imported in middleware or any edge runtime code.
 *
 * Exports:
 *   auth     — Server-side session accessor (use in Server Components & Actions)
 *   signIn   — Programmatic sign-in (use in Server Actions)
 *   signOut  — Programmatic sign-out (use in Server Actions)
 *   handlers — GET/POST handlers for /api/auth/[...nextauth] route
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { decode } from 'next-auth/jwt';

import { authConfig } from './auth.config';
import { LoginSchema } from '@/schemas/auth.schema';
import { resolveUserRole } from '@/lib/user-roles';
import type { UserRole } from '@/lib/user-roles';
import {
  loginEmailIpLimiter,
  loginIpLimiter,
  getClientIp,
} from '@/lib/rate-limiter';
import { apiClient } from '@/lib/api-client';

// Hash وهمي ثابت لمنع Timing Attack:
// يُستخدم عندما لا يوجد مستخدم — يضمن أن bcrypt.compare تعمل دائماً
// بنفس الوقت سواء وُجد المستخدم أم لا.
const DUMMY_HASH =
  '$2b$12$qrFmNHMRSis9y6u5S5dIxujGgPn.Z1.C7dNp2OEBCIrBd3cXoWr0q';


export const { auth, signIn, signOut, handlers } = NextAuth({
  // Merge edge-safe config (cookies, pages, base callbacks)
  ...authConfig,

  // JWT sessions are strictly required when using the Credentials provider.
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // ─── Providers ───────────────────────────────────────────────────────────
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
    Credentials({
      // The `credentials` object defines what fields the form sends.
      // Auth.js uses this for the built-in sign-in form (not used here),
      // but it documents the expected shape.
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },

      async authorize(credentials) {
        // ── Step 1: استخراج IP من الطلب ────────────────────────────────────
        // نستدعي headers() من next/headers — تعمل في Server Actions
        const headersList = await headers();
        const ip = getClientIp(headersList);

        // ── Step 2: Rate Limiting — يجب أن يكون قبل كل العمليات المكلفة ────
        // نفذ الفحصين معاً (email+IP و IP فقط) لإغلاق طريقتي الهجوم:
        //  أ) هجوم على حساب بعينه: محدود بـ email+IP
        //  ب) هجوم بتدوير الإيميلات: محدود بـ IP فقط

        // نستخرج الإيميل بحذر — مجرد string خام قبل التحقق منه بـ Zod
        const rawEmail =
          typeof credentials?.email === 'string'
            ? credentials.email.toLowerCase().trim().slice(0, 254) // حد طول الإيميل المعياري
            : 'invalid';

        const [emailIpResult, ipResult] = await Promise.all([
          loginEmailIpLimiter.limit(`${rawEmail}:${ip}`),
          loginIpLimiter.limit(ip),
        ]);

        if (!emailIpResult.success || !ipResult.success) {
          // سجّل التجاوز خادمياً مع IP للمتابعة الأمنية (بدون تسجيل البريد الإلكتروني)
          console.warn(
            `[auth] Rate limit exceeded — ip: ${ip}, ` +
            `remaining: email-ip=${emailIpResult.remaining}, ip=${ipResult.remaining}`
          );
          // نُرجع null فقط — لا نكشف سبب الرفض للعميل
          return null;
        }

        // ── Step 3: التحقق من شكل البيانات بـ Zod ─────────────────────────
        // يرفض البيانات المشوّهة قبل أي استعلام على الـ API
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // ── Step 4: المصادقة المعتمدة عبر الـ API Backend ──
        try {
          const apiRes = await apiClient.loginUser(email, password);
          if (apiRes.success && apiRes.data) {
            // [SECURITY FIX] Role is resolved from the authoritative operational
            // Firestore `admins` registry — never from the email address.
            // Fail-closed: any resolution error yields 'CUSTOMER'.
            const role = await resolveUserRole(apiRes.data.id);
            return {
              id: apiRes.data.id,
              email: apiRes.data.email,
              name: apiRes.data.name,
              phone: apiRes.data.phone || '',
              role,
              token: apiRes.data.token,
              refreshToken: apiRes.data.refreshToken || '',
              image: apiRes.data.image || '',
              isVerified: apiRes.data.isVerified,
              pendingPhone: apiRes.data.pendingPhone || '',
            };
          }
          await bcrypt.compare(password, DUMMY_HASH);
          return null;
        } catch (error) {
          console.error('[auth] API authorization failed:', error);
          return null;
        }
      },

    }),
  ],

  // ─── Callbacks ───────────────────────────────────────────────────────────
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!account.id_token) {
          console.error('[auth] Google sign-in missing id_token');
          return false;
        }
        try {
          const apiRes = await apiClient.loginWithGoogle(account.id_token);
          if (!apiRes.success || !apiRes.data) {
            console.error('[auth] Google backend exchange failed:', apiRes.error?.code);
            return false;
          }
          const role = await resolveUserRole(apiRes.data.id);
          user.id = apiRes.data.id;
          user.email = apiRes.data.email;
          user.name = apiRes.data.name || user.name || '';
          user.image = apiRes.data.image || user.image || '';
          user.phone = apiRes.data.phone || '';
          user.pendingPhone = apiRes.data.pendingPhone || '';
          user.isVerified = apiRes.data.isVerified;
          user.token = apiRes.data.token;
          user.refreshToken = apiRes.data.refreshToken || '';
          user.role = role;
          return true;
        } catch (error) {
          console.error('[auth] Google sign-in exchange error:', error);
          return false;
        }
      }
      return true;
    },

    // When using JWT strategy, the `jwt` callback is called first on every request.
    // The `user` object is ONLY passed on the initial sign-in.
    // We attach `id` and `role` to the token here so they persist.
    async jwt({ token, user, account, trigger }) {
      if (account?.provider === 'google' && !user?.token && account.id_token) {
        try {
          const apiRes = await apiClient.loginWithGoogle(account.id_token);
          if (apiRes.success && apiRes.data) {
            const role = await resolveUserRole(apiRes.data.id);
            token.id = apiRes.data.id;
            token.role = role;
            token.name = apiRes.data.name || user?.name || '';
            token.email = apiRes.data.email;
            token.firebaseToken = apiRes.data.token;
            token.refreshToken = apiRes.data.refreshToken || '';
            token.phone = apiRes.data.phone || '';
            token.picture = apiRes.data.image || user?.image || '';
            token.image = apiRes.data.image || user?.image || '';
            token.isVerified = apiRes.data.isVerified;
            token.pendingPhone = apiRes.data.pendingPhone || '';
            return token;
          }
        } catch (error) {
          console.error('[auth] Google jwt fallback exchange failed:', error);
        }
      }

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.firebaseToken = user.token;
        token.refreshToken = user.refreshToken || '';
        token.phone = user.phone;
        token.picture = user.image;
        token.image = user.image;
        token.isVerified = user.isVerified ?? true;
        token.pendingPhone = user.pendingPhone || '';
      }

      // Server-verified session refresh (e.g. after Email OTP verification).
      // NEVER trust raw `session.isVerified` from the client — always re-verify
      // against the backend using a refreshed Firebase ID token.
      if (trigger === 'update') {
        try {
          if (token.refreshToken) {
            const refreshed = await apiClient.refreshFirebaseToken(String(token.refreshToken));
            if (refreshed.success && refreshed.data?.token) {
              token.firebaseToken = refreshed.data.token;
              if (refreshed.data.refreshToken) {
                token.refreshToken = refreshed.data.refreshToken;
              }
            }
          }

          const activeToken = (token.firebaseToken as string) || '';
          if (activeToken) {
            const meRes = await apiClient.getMe(activeToken);
            if (meRes.success && meRes.data) {
              const rawMe = meRes.data as any;
              const me = rawMe?.user || rawMe?.customer || rawMe?.profile || rawMe?.data || rawMe;
              token.isVerified =
                typeof me?.isVerified === 'boolean'
                  ? me.isVerified
                  : me?.otpPending === true
                    ? false
                    : Boolean(token.isVerified);
              token.phone = me?.phoneNumber || (token.phone as string) || '';
              token.pendingPhone = me?.pendingPhone || '';
            }
          }
        } catch (error) {
          // Never wipe an existing valid session on a transient refresh error
          console.warn('[auth] Session verification refresh failed:', error);
        }
      }

      return token;
    },

    // The `session` callback runs after `jwt`. We take only safe public fields
    // from the token — firebaseToken & refreshToken stay strictly server-side
    // inside the HttpOnly encrypted JWT cookie (read via getServerAuthTokens).
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        session.user.phone = (token.phone as string) || '';
        session.user.image = (token.image as string) || (token.picture as string) || '';
        session.user.isVerified = typeof token.isVerified === 'boolean' ? token.isVerified : true;
        session.user.pendingPhone = (token.pendingPhone as string) || '';
      }
      return session;
    },
  },
});

const SESSION_COOKIE_NAME = 'msari.session-token';

/**
 * Server-only helper to read Firebase ID & refresh tokens from the encrypted
 * HttpOnly Auth.js JWT cookie without exposing them in /api/auth/session.
 */
export async function getServerAuthTokens(): Promise<{
  idToken: string;
  refreshToken?: string;
} | null> {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const cookieStore = await cookies();
  const direct = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const rawToken =
    direct ??
    cookieStore
      .getAll()
      .filter((c) => c.name.startsWith(`${SESSION_COOKIE_NAME}.`))
      .sort((a, b) => Number(a.name.split('.').pop()) - Number(b.name.split('.').pop()))
      .map((c) => c.value)
      .join('');

  if (!rawToken) return null;

  try {
    const decoded = await decode({
      token: rawToken,
      secret,
      salt: SESSION_COOKIE_NAME,
    });
    const idToken = typeof decoded?.firebaseToken === 'string' ? decoded.firebaseToken : '';
    const refreshToken = typeof decoded?.refreshToken === 'string' ? decoded.refreshToken : '';
    if (!idToken && !refreshToken) return null;
    return { idToken, refreshToken: refreshToken || undefined };
  } catch {
    return null;
  }
}
