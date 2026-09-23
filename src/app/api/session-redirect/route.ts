import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

import { Policies } from '@/lib/policies';
import { getSafeRedirect } from '@/lib/safeRedirect';

/**
 * GET /api/session-redirect?fallback=/ar
 *
 * Post-login redirect handler — خارج /api/auth لتجنب اعتراض NextAuth
 * يقرأ الـ session server-side ويوجّه الأدمن لـ /ar تلقائياً.
 * SECURITY: fallback is sanitized to a same-origin relative path
 * (getSafeRedirect) — absolute/external URLs collapse to '/'.
 */
export async function GET(req: NextRequest) {
  const { origin, searchParams } = new URL(req.url);
  const fallback = getSafeRedirect(searchParams.get('fallback') || '/ar');

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
