import { Prisma } from '@prisma/client';
import { createError, ServiceResponse } from '@/lib/errors';

export class BookingService {
  /**
   * Domain Logic: Generate a unique booking code safely
   */
  static async generateUniqueCode(tx: Prisma.TransactionClient): Promise<string | null> {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 5; attempt++) {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      let code = 'MS-';
      for (let i = 0; i < 8; i++) code += charset[bytes[i] % charset.length];
      
      const existing = await tx.booking.findUnique({ where: { code }, select: { code: true } });
      if (!existing) return code;
    }
    return null;
  }

  /**
   * Domain Logic: Persist booking to DB
   */
  static async createBookingRecord(
    tx: Prisma.TransactionClient,
    data: {
      userId: string | null; hotelId: string; roomId: string | null;
      guestName: string; guestEmail: string; guestPhone: string;
      checkIn: Date; checkOut: Date; nights: number; guests: number;
      totalPrice: number; currency: string; paymentMethod: any; notes: string | null;
    }
  ): Promise<ServiceResponse<{ id: string; code: string; totalPrice: number; currency: string }>> {
    const code = await BookingService.generateUniqueCode(tx);
    if (!code) return createError('CODE_GENERATION_FAILED', {});

    const booking = await tx.booking.create({
      data: {
        code, 
        status: 'PENDING', 
        paymentStatus: 'UNPAID',
        ...data
      },
      select: { id: true, code: true, totalPrice: true, currency: true },
    });

    return { success: true, data: booking };
  }
}
