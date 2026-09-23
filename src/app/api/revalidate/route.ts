import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET_TOKEN;

function triggerRevalidation(tag?: string, path?: string) {
  if (tag === 'all') {
    const allTags = ['cms:pages', 'cms:destinations', 'cms:homepage', 'cms:settings', 'cms:blog', 'cities', 'offers'];
    for (const t of allTags) {
      try { (revalidateTag as any)(t); } catch (_) {}
    }
    try { (revalidatePath as any)('/', 'layout'); } catch (_) {}
    return { revalidated: true, all: true, now: Date.now() };
  }

  if (tag) {
    (revalidateTag as any)(tag);
    return { revalidated: true, tag, now: Date.now() };
  }

  if (path) {
    (revalidatePath as any)(path);
    return { revalidated: true, path, now: Date.now() };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (!REVALIDATE_SECRET) {
      console.error('[revalidate] REVALIDATE_SECRET_TOKEN environment variable is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { tag, path, secret } = body;

    if (!secret || secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized: Invalid secret token' }, { status: 401 });
    }

    const res = triggerRevalidation(tag, path);
    if (!res) {
      return NextResponse.json({ error: 'Missing tag or path' }, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET removed (security hardening 2026-09-21): the secret must never travel
 * in query parameters (URLs land in logs/history). The only caller
 * (dashboard WebsiteRevalidationService) uses POST with a JSON body, which
 * remains the sole contract. Callers sending GET now receive 405.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed: use POST with JSON body {tag|path, secret}' },
    { status: 405 }
  );
}

