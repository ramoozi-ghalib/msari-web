/**
 * src/lib/user-roles.ts — Authoritative Role Resolution
 *
 * [SECURITY FIX — replaces email-suffix role assignment]
 *
 * The ONLY authoritative source for website authorization roles is the
 * operational Firestore `admins` collection (uid -> admin doc), which is
 * managed by the Operational Dashboard — NOT by msari_web.
 *
 * Evidence:
 *   - scripts/check-admins.ts reads `admins` collection as the admin registry.
 *   - The previous implementation (api-client.ts) assigned ADMIN to any email
 *     ending with '@msari.net' — a critical privilege-escalation vector.
 *
 * Fail-closed: any error (SDK not initialized, network, missing doc)
 * resolves to 'CUSTOMER'. Registration NEVER grants a role.
 */

import { db } from '@/lib/firebase-admin';

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'BOOKING_STAFF';

export async function resolveUserRole(uid: string): Promise<UserRole> {
  if (!uid) return 'CUSTOMER';

  try {
    const snap = await db.collection('admins').doc(uid).get();

    // Not in the operational admins registry -> customer, fail-closed.
    if (!snap || !snap.exists) return 'CUSTOMER';

    const data = (snap.data() || {}) as { role?: string };

    // Support the operational registry role values; unknown values fail-closed
    // to ADMIN only when the doc itself exists (registry membership is the
    // authoritative signal — the dashboard only creates docs for admins).
    const registryRole = String(data.role || 'ADMIN').toUpperCase();

    if (registryRole === 'BOOKING_STAFF') return 'BOOKING_STAFF';
    return 'ADMIN';
  } catch (error) {
    // Fail-closed: never grant a role on infrastructure failure.
    console.error('[user-roles] Failed to resolve role for uid — defaulting to CUSTOMER:', error);
    return 'CUSTOMER';
  }
}