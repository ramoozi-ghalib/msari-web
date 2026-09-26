import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { Policies } from '@/lib/policies';
import { getSafeRedirect } from '@/lib/safeRedirect';

/**
 * GET /api/auth/redirect?fallback=/ar
 *
 * Post-login redirect handler:
 * - يقرأ الـ session من الـ cookie مباشرةً على الخادم
 * - يُوجّه الـ admin إلى /ar تلقائياً وبأمان
 * - يُوجّه بقية المستخدمين إلى fallback URL
 *
 * SECURITY (MED-2026-01 fix): fallback sanitized to same-origin relative
 * path — absolute/external/protocol-relative/malformed collapse to '/ar'.
 *
 * يُستدعى من صفحة تسجيل الدخول بعد نجاح signIn()
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fallback = getSafeRedirect(searchParams.get('fallback') || '/ar');
  const base =
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith('https://')
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : 'https://msari.net';

  try {
    const session = await auth();
    const isAdmin = Policies.canAccessAdmin(session?.user);

    if (isAdmin) {
      return NextResponse.redirect(`${base}/ar`);
    }
  } catch {
    // إذا فشل قراءة الـ session → نستخدم fallback
  }

  return NextResponse.redirect(`${base}${fallback}`);
}
