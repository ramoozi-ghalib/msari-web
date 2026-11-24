/**
 * auth.config.ts — Edge-compatible Auth.js configuration.
 *
 * This file is intentionally free of Node.js-only imports (firebase-admin, bcryptjs).
 * Shared base config (cookies, pages, base callbacks) merged into src/auth.ts.
 *
 * Full auth logic (backend API auth, Google OAuth, role resolution) lives in src/auth.ts.
 */
import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/lib/user-roles';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  cookies: {
    sessionToken: {
      name: 'msari.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  // Override default Auth.js pages with our own routes
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Providers (Credentials, Google) are configured in src/auth.ts.
  providers: [],
  callbacks: {
    // Route-level Server Components enforce auth via auth() / requireAuth()
    // with locale-aware redirects. Returning true allows requests through the
    // Auth.js layer without middleware interception.
    authorized() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.isVerified = user.isVerified ?? true;
        token.pendingPhone = user.pendingPhone || '';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        session.user.isVerified = typeof token.isVerified === 'boolean' ? token.isVerified : true;
        session.user.pendingPhone = (token.pendingPhone as string) || '';
      }
      return session;
    },
  },
};
