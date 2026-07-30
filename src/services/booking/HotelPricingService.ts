import { prisma } from '@/lib/prisma';
import { createError, ServiceResponse } from '@/lib/errors';

export class HotelPricingService {
  /**
   * Domain Logic: Validate hotel availability, room capacity, and calculate discounts.
   * Operated OUTSIDE of transaction to minimize locking time.
   */
  static async validateAndCalculatePrice(
    params: { hotelId: string; roomId?: string; checkIn: Date; checkOut: Date; guests: number; nights: number; now: Date }
  ): Promise<ServiceResponse<{ pricePerNight: number; totalPrice: number; currency: string }>> {
    const { hotelId, roomId, checkIn, checkOut, guests, nights, now } = params;

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { id: true, isActive: true, priceFrom: true, currency: true },
    });

    if (!hotel) return createError('HOTEL_NOT_FOUND', { hotelId });
    if (!hotel.isActive) return createError('HOTEL_INACTIVE', { hotelId });

    let pricePerNight = hotel.priceFrom;
    
    if (roomId) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, hotelId: true, isAvailable: true, pricePerNight: true, capacity: true },
      });

      if (!room || room.hotelId !== hotelId) return createError('ROOM_NOT_FOUND', { roomId, hotelId });
      if (!room.isAvailable) return createError('ROOM_UNAVAILABLE', { roomId });
      if (guests > room.capacity) return createError('GUESTS_EXCEED_CAPACITY', { requested: guests, capacity: room.capacity });

      pricePerNight = room.pricePerNight;
    }

    const discount = await prisma.discount.findUnique({
      where: { hotelId },
      select: { percentage: true, validFrom: true, validTo: true },
    });

    const isDiscountActive = discount && now >= discount.validFrom && now <= discount.validTo;
    const discountMultiplier = isDiscountActive ? (1 - discount.percentage / 100) : 1;
    const totalPrice = parseFloat((pricePerNight * nights * discountMultiplier).toFixed(2));

    return { success: true, data: { pricePerNight, totalPrice, currency: hotel.currency } };
  }
}

