import { createError, ServiceResponse } from '@/lib/errors';
import { BookingStatus } from '@prisma/client';

export class BookingStateService {
  /**
   * Pure Domain Logic: Validates if a booking status transition is permitted.
   * Does NOT connect to the Database.
   */
  static validateTransition(currentStatus: string, newStatus: string): ServiceResponse<BookingStatus> {
    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      PENDING:   ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
      // CANCELLED, COMPLETED, NO_SHOW are terminal
    };

    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return createError('BOOKING_STATE_CONFLICT', { current: currentStatus, next: newStatus });
    }

    return { success: true, data: newStatus as BookingStatus };
  }
}
