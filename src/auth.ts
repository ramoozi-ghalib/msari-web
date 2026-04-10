/**
 * auth.ts — Full Auth.js (NextAuth v5) configuration.
 *
 * This file uses Node.js-only imports (Prisma, bcrypt) and must NEVER be
 * imported in middleware or any edge runtime code.
 *
 * Exports:
 *   auth     — Server-side session accessor (use in Server Components & Actions)
 *   signIn   — Programmatic sign-in (use in Server Actions)
 *   signOut  — Programmatic sign-out (use in Server Actions)
 *   handlers — GET/POST handlers for /api/auth/[...nextauth] route
 */
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import { LoginSchema } from '@/schemas/auth.schema';
import {
  loginEmailIpLimiter,
  loginIpLimiter,
  getClientIp,
} from '@/lib/rate-limiter';
import type { UserRole } from '@prisma/client';

// Hash وهمي ثابت لمنع Timing Attack:
// يُستخدم عندما لا يوجد مستخدم — يضمن أن bcrypt.compare تعمل دائماً
// بنفس الوقت سواء وُجد المستخدم أم لا.
const DUMMY_HASH =
  '$2b$12$qrFmNHMRSis9y6u5S5dIxujGgPn.Z1.C7dNp2OEBCIrBd3cXoWr0q';


export const { auth, signIn, signOut, handlers } = NextAuth({
  // Merge edge-safe config (pages, base callbacks)
  ...authConfig,

  // ─── Adapter & Session Strategy ──────────────────────────────────────────
  adapter: PrismaAdapter(prisma),

  // JWT sessions are strictly required when using the Credentials provider.
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // ─── Cookie Security ─────────────────────────────────────────────────────
  cookies: {
    sessionToken: {
      name: 'msari.session-token',
      options: {
        httpOnly: true,       // JS cannot read this cookie
        sameSite: 'lax',      // CSRF protection
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      },
    },
  },

  // ─── Providers ───────────────────────────────────────────────────────────
  providers: [
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
          // سجّل التجاوز خادمياً مع IP للمتابعة الأمنية
          console.warn(
            `[auth] Rate limit exceeded — email: ${rawEmail}, ip: ${ip}, ` +
            `remaining: email-ip=${emailIpResult.remaining}, ip=${ipResult.remaining}`
          );
          // نُرجع null فقط — لا نكشف سبب الرفض للعميل
          return null;
        }

        // ── Step 3: التحقق من شكل البيانات بـ Zod ─────────────────────────
        // يرفض البيانات المشوّهة قبل أي استعلام على DB
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // ── Step 4: البحث عن المستخدم في DB ────────────────────────────────
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            isActive: true,
          },
        });

        // ── Step 5: bcrypt يعمل دائماً — إصلاح Timing Attack ───────────────
        // المشكلة السابقة: إذا لم يُوجد المستخدم → return null فوري (~5ms)
        // إذا وُجد → bcrypt.compare (~258ms) — المهاجم يميّز بينهما!
        //
        // الحل: نستدعي bcrypt.compare في *جميع* الحالات باستخدام hash وهمي.
        // النتيجة: كل محاولة تستغرق ~258ms بغض النظر عن وجود المستخدم.
        const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
        const passwordsMatch = await bcrypt.compare(password, hashToCompare);

        // ── Step 6: فحوصات الأمان ──────────────────────────────────────────
        // نجمع كل شروط الفشل في شرط واحد لمنع الـ early return
        // قبل انتهاء bcrypt (الذي يعمل بالفعل في Step 5)
        if (!user || !user.isActive || !user.passwordHash || !passwordsMatch) {
          return null;
        }

        // ── Step 7: إرجاع بيانات المستخدم (بدون passwordHash) ─────────────
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },

    }),
  ],

  // ─── Callbacks ───────────────────────────────────────────────────────────
  callbacks: {
    // When using JWT strategy, the `jwt` callback is called first on every request.
    // The `user` object is ONLY passed on the initial sign-in.
    // We attach `id` and `role` to the token here so they persist.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // The `session` callback runs after `jwt`. We take the custom fields
    // from the token and attach them to the `session.user` object.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});
