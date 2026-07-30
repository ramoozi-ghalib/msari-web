export interface ErrorRegistry {
  'HOTEL_NOT_FOUND': { hotelId: string };
  'HOTEL_INACTIVE': { hotelId: string };
  'HOTEL_DELETE_CONFLICT': { hotelId: string; activeBookings: number };
  'ROOM_NOT_FOUND': { roomId: string; hotelId: string };
  'ROOM_UNAVAILABLE': { roomId: string };
  'ROOM_ALREADY_BOOKED': { roomId: string; checkIn: string; checkOut: string };
  'GUESTS_EXCEED_CAPACITY': { requested: number; capacity: number };
  'BOOKING_NOT_FOUND': { bookingId: string };
  'BOOKING_STATE_CONFLICT': { current: string; next: string };
  'PAYMENT_STATE_INVALID': { current: string; transitionTo: string };
  'CODE_GENERATION_FAILED': {};
  'INSUFFICIENT_PERMISSIONS': { action: string };
  'BOOKING_BUSINESS_RULE_VIOLATION': { message: string };
  'BOOKING_PAYMENT_NOT_VERIFIED': {};
  'SYSTEM_DATABASE_ERROR': { details?: string };
}

export type ServiceErrorCode = keyof ErrorRegistry;

export type ServiceError<T extends ServiceErrorCode> = {
  code: T;
  meta: ErrorRegistry[T];
};

export type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError<ServiceErrorCode> };

export function createError<T extends ServiceErrorCode>(
  code: T,
  meta: ErrorRegistry[T]
): { success: false; error: ServiceError<T> } {
  return { success: false, error: { code, meta } };
}
