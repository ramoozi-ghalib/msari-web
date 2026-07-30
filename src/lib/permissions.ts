/**
 * permissions.ts — The Central Permission Engine
 * 
 * This is the ONLY place in the application that is aware of UserRoles.
 * All access control should be done by checking permissions, not roles.
 */

// Define all possible permissions in the system
export type Permission = 
  | 'admin.access'
  | 'hotel.manage'
  | 'hotel.create'
  | 'hotel.update'
  | 'hotel.delete'
  | 'booking.manage'
  | 'booking.view'
  | 'booking.update'
  | 'booking.create'
  | 'booking.cancel'
  | 'booking.view_own'
  | 'offer.manage'
  | 'user.manage'
  | 'city.manage'
  | 'content.manage'
  | 'profile.manage'
  | 'system.manage'; // Explicit full admin identifier

// Define the roles (matches Prisma UserRole)
export type Role = 'CUSTOMER' | 'ADMIN' | 'BOOKING_STAFF';

// Map roles to their specific permissions
const ROLE_PERMISSIONS: Record<Role, Permission[] | 'ALL'> = {
  CUSTOMER: [
    'booking.create',
    'profile.manage'
  ],
  BOOKING_STAFF: [
    'booking.view',
    'booking.update',
    'offer.manage'
  ],
  ADMIN: 'ALL',
};

/**
 * The Central Permission Engine.
 * Evaluates if a user has a specific permission.
 * 
 * @param user The user object (must contain at least a 'role' string property)
 * @param permission The permission to check
 * @returns boolean
 */
export function hasPermission(
  user: { role?: string; permissionsOverride?: string[] } | null | undefined, 
  permission: Permission
): boolean {
  if (!user || !user.role) return false;
  
  const role = user.role as Role;
  
  // 1. Static permissions from code (Default source of truth)
  const basePermissions = ROLE_PERMISSIONS[role];
  
  if (!basePermissions) return false;
  
  // 2. Prepare placeholder for future overrides
  // This will be controlled later from Admin UI
  const overrides = user.permissionsOverride || [];
  
  // Merge base and overrides safely
  const isBaseAll = basePermissions === 'ALL';
  const isOverrideAll = overrides.includes('ALL');
  
  if (isBaseAll || isOverrideAll) return true;
  
  const effectivePermissions = [...(basePermissions as string[]), ...overrides];
  
  return effectivePermissions.includes(permission);
}
