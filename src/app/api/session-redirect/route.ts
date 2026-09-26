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
 * HOST FIX: Location is built on the canonical public host, never the
 * request origin (behind the Hostinger proxy req.url carries the internal
 * bind address 0.0.0.0:3000, which leaked into Location headers).
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
    // إذا فشل قراءة الـ session → fallback
  }

  return NextResponse.redirect(`${base}${fallback}`);
}
