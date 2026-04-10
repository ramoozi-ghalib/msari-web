// =================== COMMON ===================
export type Language = 'ar' | 'en';
export type Currency = 'USD' | 'SAR' | 'YER' | 'YER_NEW' | 'YER_OLD';

// =================== HOTEL ===================
export interface Hotel {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  city: string;
  cityEn: string;
  governorate: string;
  governorateEn: string;
  address: string;
  lat?: number;
  lng?: number;
  stars: 1 | 2 | 3 | 4 | 5;
  rating: number;
  reviewCount: number;
  priceFrom: number; // in USD
  currency: Currency;
  images: string[];
  thumbnail: string;
  amenities: Amenity[];
  rooms: Room[];
  discount?: Discount;
  isFeatured: boolean;
  isActive: boolean;
  cityId?: string;
  policyAr?: string;
  policyEn?: string;
  mapUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  nameEn: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  images: string[];
  amenities: Amenity[];
  isAvailable: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  category: 'general' | 'room' | 'dining' | 'sport' | 'service';
}

export interface Discount {
  id: string;
  percentage: number;
  validFrom: string;
  validTo: string;
  code?: string;
}

// =================== CITY ===================
export interface City {
  id: string;
  name: string;
  nameEn: string;
  governorate: string;
  governorateEn: string;
  image: string;
  hotelCount: number;
  isActive?: boolean;
}

// =================== BOOKING ===================
export interface Booking {
  id: string;
  bookingCode: string;
  hotelId: string;
  roomId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalPrice: number;
  currency: Currency;
  paymentMethod: 'cash_on_arrival' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests?: string;
  createdAt: string;
}

// =================== USER ===================
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
}

// =================== REVIEW ===================
export interface Review {
  id: string;
  hotelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// =================== OFFER ===================
export interface Offer {
  id: string;
  title: string;
  titleEn: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}

// =================== CAR SERVICE ===================
export interface CarService {
  id: string;
  type: 'airport_taxi' | 'intercity';
  fromCity: string;
  toCity: string;
  price: number;
  vehicleType: string;
  capacity: number;
}

// =================== SEARCH PARAMS ===================
export interface HotelSearchParams {
  query?: string;
  city?: string;
  governorate?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
