import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { Policies } from '@/lib/policies';

/**
 * GET /api/auth/redirect?fallback=/
 *
 * Post-login redirect handler:
 * - يقرأ الـ session من الـ cookie مباشرةً على الخادم
 * - يُوجّه الـ admin إلى /ar/admin تلقائياً
 * - يُوجّه بقية المستخدمين إلى fallback URL
 *
 * يُستدعى من صفحة تسجيل الدخول بعد نجاح signIn()
 */
export async function GET(req: NextRequest) {
  const { origin, searchParams } = new URL(req.url);
  const fallback = searchParams.get('fallback') || '/';

  try {
    const session = await auth();
    const isAdmin = Policies.canAccessAdmin(session?.user);

    if (isAdmin) {
      return NextResponse.redirect(new URL('/ar/admin', origin));
    }
  } catch {
    // إذا فشل قراءة الـ session → نستخدم fallback
  }

  return NextResponse.redirect(new URL(fallback, origin));
}
