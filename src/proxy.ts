import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { routing } from '@/i18n/routing';

// 1. Initialize next-intl middleware
const intlMiddleware = createMiddleware(routing);

// 2. Initialize NextAuth for edge
const { auth } = NextAuth(authConfig);

// 3. Export proxy function (Requirement for Next.js 16+)
// By wrapping intlMiddleware inside auth(), we ensure that NextAuth
// sets the authentication headers/cookies before internationalization kicks in.
export default auth((req) => {
  return intlMiddleware(req);
});

// Configure the paths where this proxy should run
export const config = {
  // Match only internationalized pathnames
  // Note: we exclude static files, _next, api routes, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
