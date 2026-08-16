import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// 1. Initialize next-intl middleware
const intlMiddleware = createMiddleware(routing);

// 2. Standard Next.js Middleware
export default async function middleware(req: any) {
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
