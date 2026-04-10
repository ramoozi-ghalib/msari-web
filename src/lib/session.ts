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
import { UserRole } from '@prisma/client';
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

/**
 * Returns the current user only if they have ADMIN or SUPER_ADMIN role.
 * Redirects to the home page if authenticated but unauthorized.
 * Redirects to login if not authenticated at all.
 *
 * This is the primary guard for ALL admin Server Components and layouts.
 *
 * @param locale - The current locale for the redirect URL (default: 'ar')
 */
export async function requireAdmin(locale = 'ar'): Promise<AuthenticatedUser> {
  const user = await requireAuth(locale);

  const isAdmin =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

  if (!isAdmin) {
    // Authenticated but wrong role — redirect to home, not login
    redirect(`/${locale}`);
  }

  return user;
}

/**
 * Returns the current user only if they have SUPER_ADMIN role.
 * Use this for destructive or irreversible operations (e.g. role assignment,
 * bulk deletes, system settings).
 *
 * @param locale - The current locale for the redirect URL (default: 'ar')
 */
export async function requireSuperAdmin(
  locale = 'ar'
): Promise<AuthenticatedUser> {
  const user = await requireAuth(locale);

  if (user.role !== UserRole.SUPER_ADMIN) {
    redirect(`/${locale}`);
  }

  return user;
}

// ─── Role Helpers ─────────────────────────────────────────────────────────────

/** True if the user has admin-level access (ADMIN or SUPER_ADMIN). */
export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
}

/** True only for SUPER_ADMIN users. */
export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return user.role === UserRole.SUPER_ADMIN;
}
