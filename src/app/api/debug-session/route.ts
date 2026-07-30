import { auth } from '@/auth';
import { NextResponse } from 'next/server';

import { Policies } from '@/lib/policies';

/**
 * GET /api/debug-session
 * يُعيد بيانات الـ session الحالية — يُستخدم من صفحة تسجيل الدخول
 * للتوجيه الذكي بناءً على الـ role
 */
export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json({
      hasSession: !!session,
      role: session?.user?.role ?? null,
      isAdmin: Policies.canAccessAdmin(session?.user),
    }, { status: 200 });
  } catch {
    return NextResponse.json({ hasSession: false, role: null, isAdmin: false }, { status: 200 });
  }
}
