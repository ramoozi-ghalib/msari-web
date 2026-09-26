import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// 1. Initialize next-intl middleware
const intlMiddleware = createMiddleware(routing);

// 2. Standard Next.js Middleware
// F-03 defense-in-depth: re-assert the security baseline on every response
// (next.config `headers()` is the primary channel; the Hostinger CDN has been
// observed serving a reduced CSP, so the policy is mirrored here — if either
// channel is stripped, the other still delivers it).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://msari.net https://*.supabase.co https://*.supabase.in https://firebasestorage.googleapis.com https://*.firebasestorage.app https://storage.googleapis.com https://*.googleusercontent.com https://lh3.googleusercontent.com",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.cloudfunctions.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export default async function middleware(req: any) {
  const res = await intlMiddleware(req);
  if (res) {
    res.headers.set('Content-Security-Policy', CSP);
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
