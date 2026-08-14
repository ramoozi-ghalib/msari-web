import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET_TOKEN || 'msari_cms_secure_revalidate_2026';

export async function POST(req: NextRequest) {
  try {
    const { tag, path, secret } = await req.json();

    if (!secret || secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized: Invalid secret token' }, { status: 401 });
    }

    if (tag) {
      // Cast to handle Next.js overloaded revalidateTag signatures safely
      (revalidateTag as any)(tag);
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      (revalidatePath as any)(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    return NextResponse.json({ error: 'Missing tag or path' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
