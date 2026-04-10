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
  // Override default Auth.js pages with our own routes
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
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
  },
};
