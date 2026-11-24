/**
 * next-auth.d.ts — TypeScript type augmentation for Auth.js.
 *
 * Auth.js's default Session type does not include `id` or `role`.
 * This file extends those types so TypeScript knows about our custom fields
 * throughout the codebase without needing casts.
 *
 * These declarations merge with Auth.js's own types at compile time.
 */
import type { UserRole } from '@/lib/user-roles';

declare module 'next-auth' {
  /**
   * Extends the User object returned from `authorize()` and OAuth `signIn`.
   * Adding custom fields here makes them available in `jwt` and `session` callbacks.
   */
  interface User {
    role?: UserRole;
    token?: string;
    refreshToken?: string;
    phone?: string;
    isVerified?: boolean;
    pendingPhone?: string;
  }

  /**
   * Extends the Session object available in:
   *   - Server Components: const session = await auth()
   *   - Client Components: const { data: session } = useSession()
   *   - Server Actions: const session = await auth()
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      phone?: string;
      pendingPhone?: string;
      isVerified: boolean;
      image?: string | null;
      role: UserRole;
      firebaseToken?: string;
      refreshToken?: string;
    };
  }
}
