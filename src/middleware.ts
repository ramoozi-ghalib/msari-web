import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { routing } from '@/i18n/routing';
import { Policies } from '@/lib/policies';

// 1. Initialize next-intl middleware
const intlMiddleware = createMiddleware(routing);

// 2. Initialize NextAuth session handler
const { auth } = NextAuth(authConfig);

// 3. Standard Next.js Middleware
export default async function middleware(req: any) {
  console.log('[BOOT-1] Executing src/middleware.ts -> Path:', req.nextUrl.pathname);
  const { pathname } = req.nextUrl;
  
  // Check if the route is an admin route (e.g. /admin, /ar/admin, /en/admin/hotels)
  const isAdminRoute = /^\/([a-z]{2}\/)?admin(\/|$)/i.test(pathname);

  if (isAdminRoute) {
    const session = await auth();
    const isLoggedIn = !!session;

    if (!isLoggedIn) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url);
      return Response.redirect(loginUrl);
    }

    const user = session?.user;
    const canAccessFullAdmin = Policies.canAccessAdmin(user);
    const canViewBookings = Policies.canViewBookings(user);
    const canManageOffers = Policies.canManageOffers(user);

    if (!canAccessFullAdmin && !canViewBookings && !canManageOffers) {
      console.warn(`[SECURITY] Access Denied: User ${user?.id || 'Unknown'} attempted to access admin route: ${pathname}`);
      return Response.redirect(new URL('/', req.url));
    }

    if (!canAccessFullAdmin) {
      const isBookingOrOfferRoute = /^\/([a-z]{2}\/)?admin\/(bookings|offers)(\/|$)/i.test(pathname);
      const isRootAdmin = /^\/([a-z]{2}\/)?admin\/?$/i.test(pathname);

      if (isRootAdmin && canViewBookings) {
        const localeMatch = pathname.match(/^\/([a-z]{2})\//);
        const locale = localeMatch ? localeMatch[1] : 'ar';
        return Response.redirect(new URL(`/${locale}/admin/bookings`, req.url));
      }

      if (!isBookingOrOfferRoute && !isRootAdmin) {
        console.warn(`[SECURITY] Path Restricted: User ${user?.id} attempted to access unauthorized path: ${pathname}`);
        return Response.redirect(new URL('/', req.url));
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
