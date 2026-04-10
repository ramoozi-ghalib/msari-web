/**
 * action-guard.ts — Shared authentication/authorization guard for Server Actions.
 *
 * USAGE PATTERN (apply to every mutation Server Action):
 *
 *   export async function createHotel(data: ...) {
 *     const guard = await adminGuard();
 *     if (!guard.ok) return guard.error;
 *     // guard.user is now the verified AuthenticatedUser
 *     ...
 *   }
 *
 * WHY NOT use requireAdmin() (which calls redirect())?
 *   - redirect() in a Server Action sends an HTTP redirect to the browser.
 *   - An attacker calling the action via curl will simply follow the redirect.
 *   - Returning a structured error object is the correct Server Action pattern:
 *     it terminates execution immediately and returns nothing useful to attackers.
 *
 * WHY call auth() here instead of importing requireAdmin()?
 *   - requireAdmin() is designed for Server Components (calls redirect()).
 *   - Server Actions need to return { success: false } — not redirect.
 *   - This file provides the action-specific equivalent.
 */
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { adminActionLimiter, RATE_LIMIT_RESPONSE } from './rate-limiter';
import type { AuthenticatedUser } from './session';

// ─── Standardised error responses ────────────────────────────────────────────
// These are the ONLY error objects returned to clients from Server Actions.
// They reveal nothing about internal state (no Prisma errors, no stack traces).

export const UNAUTHORIZED_RESPONSE = {
  success: false as const,
  error: {
    code: 'UNAUTHORIZED' as const,
    message: 'غير مصرح لك بتنفيذ هذه العملية',
  },
};

export const FORBIDDEN_RESPONSE = {
  success: false as const,
  error: {
    code: 'FORBIDDEN' as const,
    message: 'ليس لديك صلاحية كافية لتنفيذ هذه العملية',
  },
};

export const SERVER_ERROR_RESPONSE = {
  success: false as const,
  error: {
    code: 'SERVER_ERROR' as const,
    message: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى',
  },
};

// ─── Rate Limit response — re-exported for use in Server Actions directly ─────
export { RATE_LIMIT_RESPONSE } from './rate-limiter';

// ─── Guard result types ───────────────────────────────────────────────────────

type GuardSuccess = { ok: true; user: AuthenticatedUser };
type GuardFailure = {
  ok: false;
  error:
    | typeof UNAUTHORIZED_RESPONSE
    | typeof FORBIDDEN_RESPONSE
    | typeof RATE_LIMIT_RESPONSE;
};
type GuardResult = GuardSuccess | GuardFailure;

// ─── adminGuard ───────────────────────────────────────────────────────────────

/**
 * Verifies that the caller has an active session AND has ADMIN or SUPER_ADMIN role.
 *
 * Call this as the VERY FIRST statement in any mutation Server Action.
 * No database operation may precede this call.
 *
 * @returns { ok: true, user } if authorized
 * @returns { ok: false, error } if not authorized — return this error from the action
 */
export async function adminGuard(): Promise<GuardResult> {
  // Read session from the database via Auth.js
  const session = await auth();

  // ── Check 1: Is the caller authenticated at all? ──────────────────────────
  if (!session?.user) {
    return { ok: false, error: UNAUTHORIZED_RESPONSE };
  }

  // ── Check 2: Does the caller have the required role? ─────────────────────
  const { role } = session.user;
  const isAdmin =
    role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

  if (!isAdmin) {
    return { ok: false, error: FORBIDDEN_RESPONSE };
  }

  // ── Check 3: Rate Limiting لإجراءات الأدمين ───────────────────────────────
  // يمنع استخدام جلسة إدمين مسروقة في هجوم آلي متسارع.
  // الحد: 200 عملية/ساعة — يتيح العمل الطبيعي للأدمين الحقيقي.
  const { success } = await adminActionLimiter.limit(session.user.id);
  if (!success) {
    console.warn(`[adminGuard] Rate limit exceeded for admin user: ${session.user.id}`);
    return { ok: false, error: RATE_LIMIT_RESPONSE };
  }

  // تسجيل خادمي للمراقبة (يُحذف في الإنتاج إن كان verbose جداً)
  // console.debug(`[adminGuard] OK — user: ${session.user.id}, remaining: ${remaining}`);

  return { ok: true, user: session.user };
}

// ─── superAdminGuard ─────────────────────────────────────────────────────────

/**
 * Same as adminGuard but requires SUPER_ADMIN role.
 * Use for destructive or irreversible operations (role assignment, bulk deletes).
 */
export async function superAdminGuard(): Promise<GuardResult> {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, error: UNAUTHORIZED_RESPONSE };
  }

  if (session.user.role !== UserRole.SUPER_ADMIN) {
    return { ok: false, error: FORBIDDEN_RESPONSE };
  }

  return { ok: true, user: session.user };
}

// ─── Safe error serialiser ────────────────────────────────────────────────────

/**
 * Converts any caught error into a safe SERVER_ERROR_RESPONSE.
 * NEVER logs the error to the client. Logs to the server console only.
 *
 * @param context - A string identifying the action for server-side logging
 * @param error   - The caught error object
 */
export function handleActionSafe(
  context: string,
  error: unknown
): typeof SERVER_ERROR_RESPONSE {
  // Log full error server-side (visible in server logs, NOT sent to client)
  console.error(`[ServerAction:${context}]`, error);
  // Return a generic, safe response to the client
  return SERVER_ERROR_RESPONSE;
}
