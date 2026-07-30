import { hasPermission } from './permissions';

/**
 * policies.ts — Policy Layer
 * 
 * Pure functions that evaluate business rules by wrapping the permission engine.
 * No direct role checks are allowed here.
 */

export const Policies = {
  // Public / Customer level
  canCreateBooking: (user: any | null | undefined) => {
    return hasPermission(user, 'booking.create') || !user; // Allow guest bookings or logged-in users with create permission
  },
  
  // Admin Panel Access
  canAccessAdmin: (user: any | null | undefined) => {
    return hasPermission(user, 'admin.access');
  },
  isFullAdmin: (user: any | null | undefined) => {
    return hasPermission(user, 'system.manage');
  },

  // Hotels
  canManageHotels: (user: any | null | undefined) => {
    return hasPermission(user, 'hotel.manage') || (hasPermission(user, 'hotel.create') && hasPermission(user, 'hotel.update') && hasPermission(user, 'hotel.delete'));
  },
  canCreateHotel: (user: any | null | undefined) => {
    return hasPermission(user, 'hotel.create');
  },
  canUpdateHotel: (user: any | null | undefined) => {
    return hasPermission(user, 'hotel.update');
  },
  canDeleteHotel: (user: any | null | undefined) => {
    return hasPermission(user, 'hotel.delete');
  },

  // Bookings
  canManageBookings: (user: any | null | undefined) => {
    return hasPermission(user, 'booking.manage') || (hasPermission(user, 'booking.view') && hasPermission(user, 'booking.update') && hasPermission(user, 'booking.cancel'));
  },
  canViewBookings: (user: any | null | undefined) => {
    return hasPermission(user, 'booking.view');
  },
  canUpdateBookingStatus: (user: any | null | undefined) => {
    return hasPermission(user, 'booking.update');
  },
  canCancelBooking: (user: any | null | undefined) => {
    return hasPermission(user, 'booking.cancel');
  },

  // Offers
  canManageOffers: (user: any | null | undefined) => {
    return hasPermission(user, 'offer.manage');
  },

  // Others
  canManageDestinations: (user: any | null | undefined) => {
    return hasPermission(user, 'city.manage');
  },

  canManageUsers: (user: any | null | undefined) => {
    return hasPermission(user, 'user.manage');
  },
};
