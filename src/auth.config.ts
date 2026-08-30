/**
 * auth.config.ts — Edge-compatible Auth.js configuration.
 *
 * This file is intentionally free of Node.js-only imports (Prisma, bcrypt).
 * It is used by the middleware (which runs on the Edge runtime) to check
 * whether sessions exist, without touching the database.
 *
 * Full auth logic (password hashing, DB queries) lives in src/auth.ts.
 */
import type { NextAuthConfig } from 'next-auth';

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
  // No providers here — Credentials provider uses bcrypt (Node.js only).
  // It is added in the full auth.ts config.
  providers: [],
  callbacks: {
    // This callback is NOT used for auth checks in our setup.
    // We perform manual auth checks inside middleware.ts to support
    // locale-aware redirects (e.g. /ar/auth/login vs /en/auth/login).
    // Returning true here allows all requests through the Auth.js layer;
    // the custom middleware function then applies our own redirect logic.
    authorized() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
};
