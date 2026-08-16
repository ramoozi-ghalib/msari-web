import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { Policies } from '@/lib/policies';

/**
 * GET /api/session-redirect?fallback=/ar
 *
 * Post-login redirect handler — خارج /api/auth لتجنب اعتراض NextAuth
 * يقرأ الـ session server-side ويوجّه الأدمن لـ /ar تلقائياً
 */
export async function GET(req: NextRequest) {
  const { origin, searchParams } = new URL(req.url);
  const fallback = searchParams.get('fallback') || '/ar';

  try {
    const session = await auth();
    const isAdmin = Policies.canAccessAdmin(session?.user);

    if (isAdmin) {
      return NextResponse.redirect(new URL('/ar', origin));
    }
  } catch {
    // إذا فشل قراءة الـ session → fallback
  }

  return NextResponse.redirect(new URL(fallback, origin));
}
