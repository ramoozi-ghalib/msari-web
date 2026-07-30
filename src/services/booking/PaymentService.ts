import { createError, ServiceResponse } from '@/lib/errors';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class PaymentService {
  /**
   * Pure Domain Logic: Calculates the required payment status upon booking transition.
   * Does NOT connect to the Database.
   */
  static calculateNextPaymentState(
    currentPaymentStatus: string, 
    nextBookingStatus: string
  ): ServiceResponse<PaymentStatus> {
    
    // Rule: Confirming an unpaid booking changes payment intent to PARTIAL automatically
    if (nextBookingStatus === 'CONFIRMED' && currentPaymentStatus === 'UNPAID') {
      return { success: true, data: 'PARTIAL' };
    }

    // Otherwise, retain current status. (In a real system, you might forbid cancelling PAID bookings without refund state mapping)
    // For now we just echo the current state if no rule applies
    return { success: true, data: currentPaymentStatus as PaymentStatus };
  }
}
