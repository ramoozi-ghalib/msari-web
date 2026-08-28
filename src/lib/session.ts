/**
 * session.ts — Server-side session access utilities.
 *
 * These functions are the ONLY way Server Components, Layouts, and Server
 * Actions should obtain the current user. Never call `auth()` directly in
 * application code — use these wrappers instead.
 *
 * IMPORTANT: These functions are server-only. They call `auth()` which reads
 * from the database on every invocation. They must never be imported in
 * client components.
 */
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthenticatedUser = Session['user'];

// ─── Core Accessors ──────────────────────────────────────────────────────────

/**
 * Returns the current session's user, or null if not authenticated.
 * Use this when authentication is optional (e.g. public pages with
 * optional "My Account" features).
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Returns the current user or redirects to the login page.
 * Use this in any Server Component or layout that requires authentication.
 *
 * @param locale - The current locale for the redirect URL (default: 'ar')
 */
export async function requireAuth(locale = 'ar'): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }
  return user;
}

import { Policies } from './policies';

/**
 * Returns the current user only if they have admin access.
 * Redirects to the home page if authenticated but unauthorized.
 * Redirects to login if not authenticated at all.
 *
 * This is the primary guard for ALL admin Server Components and layouts.
 *
 * @param locale - The current locale for the redirect URL (default: 'ar')
 */
export async function requireAdmin(locale = 'ar'): Promise<AuthenticatedUser> {
  const user = await requireAuth(locale);

  if (!Policies.canAccessAdmin(user)) {
    // Authenticated but wrong permissions — redirect to home, not login
    redirect(`/${locale}`);
  }

  return user;
}

/**
 * Returns the current user only if they have user management access.
 * Use this for destructive or irreversible operations.
 *
 * @param locale - The current locale for the redirect URL (default: 'ar')
 */
export async function requireSuperAdmin(
  locale = 'ar'
): Promise<AuthenticatedUser> {
  const user = await requireAuth(locale);

  if (!Policies.canManageUsers(user)) {
    redirect(`/${locale}`);
  }

  return user;
}

// ─── Role Helpers ─────────────────────────────────────────────────────────────

/** True if the user has admin-level access. */
export function isAdmin(user: AuthenticatedUser): boolean {
  return Policies.canAccessAdmin(user);
}

/** True only for users with top-tier user management permissions. */
export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return Policies.canManageUsers(user);
}
