/**
 * src/lib/api-client.ts — Centralized API Client for msari_web.
 *
 * Handles HTTP requests to the Firebase Cloud Functions API Gateway.
 * Fully typed, error-safe, and compatible with both server and client-side runs.
 */

import type { Hotel, Room, City, Amenity } from '@/types';
import { normalizeAddress } from '@/lib/utils';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

// ─── API DTOs (Data Transfer Objects) ─────────────────────────────────────────

export interface ApiCity {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  isPopular: boolean;
  updatedAt: string;
}

export interface ApiAmenity {
  iconKey: string;
  label: { ar: string; en: string };
}

export interface ApiHotel {
  id: string;
  destination: string;
  name: { ar: string; en: string };
  address: { ar: string; en: string };
  overview: { ar: string; en: string };
  mainImageUrl: string;
  images: string[];
  amenities: ApiAmenity[];
  policies: string[];
  stars: number;
  price: number;
  isSpecial: boolean;
  isPublished: boolean;
  mapLink: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ApiRoom {
  id: string;
  hotelId: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  mainImageUrl: string;
  images: string[];
  features: ApiAmenity[];
  numberOfPersons: number;
  numberOfBeds: number;
  numberOfBathrooms: number;
  numberOfRooms: number;
  price: number;
  isPublished: boolean;
  updatedAt: string;
  isDeleted: boolean;
}

// ─── Mappings ─────────────────────────────────────────────────────────────────

export function generateSlugFromHotel(id: string, nameEn: string): string {
  const idMap: Record<string, string> = {
    'h_movenpick': 'movenpick-hotel-sanaa',
    'h_hilton': 'hilton-sanaa',
    'h_sheraton': 'sheraton-sanaa-resort',
    'h_qamar': 'qamar-aden-hotel',
    'h_saif': 'saif-aden-hotel',
    'h_seyun': 'seyun-almukalla-hotel',
    'h_eastern': 'eastern-taiz-hotel',
    'h_seashore': 'hudaydah-seashore-hotel',
  };

  if (idMap[id]) return idMap[id];
  if (idMap[id.toLowerCase()]) return idMap[id.toLowerCase()];
  
  if (id.includes('-')) return id;

  const processed = (nameEn || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return processed || id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function mapApiAmenityToAmenity(api: any, category: 'general' | 'room' = 'general'): Amenity {
  if (typeof api === 'string') {
    return { id: api, name: api, nameEn: api, icon: api, category };
  }
  const icon = typeof (api?.iconKey || api?.icon || api?.key) === 'string' ? (api?.iconKey || api?.icon || api?.key) : 'check';
  
  const rawName = api?.label?.ar || api?.name || api?.ar || icon;
  const rawNameEn = api?.label?.en || api?.nameEn || api?.en || icon;

  const nameStr = typeof rawName === 'object' && rawName !== null ? (rawName.ar || rawName.en || String(icon)) : String(rawName || icon);
  const nameEnStr = typeof rawNameEn === 'object' && rawNameEn !== null ? (rawNameEn.en || rawNameEn.ar || String(icon)) : String(rawNameEn || icon);

  return {
    id: String(api?.id || icon),
    name: nameStr,
    nameEn: nameEnStr,
    icon: icon,
    category: category,
  };
}

export function mapApiCityToCity(api: any, hotelCount = 0): City {
  return {
    id: api.id,
    name: api.name || api.nameAr || '',
    nameEn: api.nameEn || '',
    governorate: api.name || api.nameAr || '',
    governorateEn: api.nameEn || '',
    image: api.imageUrl || api.image || '',
    hotelCount,
    isActive: true,
  };
}

export function mapApiRoomToRoom(api: any): Room {
  const nameAr = typeof api.name === 'object' && api.name !== null ? (api.name.ar || api.name.en || '') : String(api.name || '');
  const nameEn = typeof api.name === 'object' && api.name !== null ? (api.name.en || api.name.ar || '') : String(api.name || '');
  const descAr = typeof api.description === 'object' && api.description !== null ? (api.description.ar || api.description.en || '') : String(api.description || '');

  const rawFeatures = Array.isArray(api.features) ? api.features : (Array.isArray(api.amenities) ? api.amenities : []);
  const amenities = rawFeatures.map((f: any) => mapApiAmenityToAmenity(f, 'room'));

  return {
    id: api.id,
    hotelId: api.hotelId,
    name: nameAr || 'غرفة',
    nameEn: nameEn || 'Room',
    description: descAr,
    capacity: Number(api.numberOfPersons || api.capacity || api.maxGuests || 2),
    numberOfBeds: Number(api.numberOfBeds || 1),
    numberOfBathrooms: Number(api.numberOfBathrooms || 1),
    numberOfRooms: Number(api.numberOfRooms || 1),
    area: api.area || api.roomArea || api.space || undefined,
    pricePerNight: Number(api.price || api.pricePerNight || 0),
    images: api.images && api.images.length > 0 ? api.images : [api.mainImageUrl].filter(Boolean),
    amenities,
    isAvailable: !api.isDeleted && api.isPublished !== false,
  };
}

export function mapApiHotelToHotel(api: ApiHotel, rooms: Room[] = [], cities: City[] = []): Hotel {
  const dest = (api.destination || '').toLowerCase();
  const cityDoc = cities.find((c) =>
    (c.id && c.id.toLowerCase() === dest) ||
    (c.nameEn && c.nameEn.toLowerCase() === dest) ||
    (c.name && c.name.toLowerCase() === dest)
  );

  const cityName = cityDoc?.name || api.destination || '';
  const cityNameEn = cityDoc?.nameEn || api.destination || '';

  const nameAr = typeof api.name === 'object' && api.name !== null ? (api.name.ar || api.name.en || '') : String(api.name || '');
  const nameEn = typeof api.name === 'object' && api.name !== null ? (api.name.en || api.name.ar || '') : String(api.name || '');
  const overviewAr = typeof api.overview === 'object' && api.overview !== null ? (api.overview.ar || api.overview.en || '') : String(api.overview || '');
  const overviewEn = typeof api.overview === 'object' && api.overview !== null ? (api.overview.en || api.overview.ar || '') : String(api.overview || '');
  const addressAr = typeof api.address === 'object' && api.address !== null ? (api.address.ar || api.address.en || '') : String(api.address || '');
  const addressEn = typeof api.address === 'object' && api.address !== null ? (api.address.en || api.address.ar || '') : String(api.address || '');

  const coords = extractCoordinates(api);

  return {
    id: api.id,
    name: nameAr,
    nameEn: nameEn,
    slug: generateSlugFromHotel(api.id, nameEn),
    description: overviewAr,
    descriptionEn: overviewEn,
    city: cityName,
    cityEn: cityNameEn,
    governorate: cityName,
    governorateEn: cityNameEn,
    address: addressAr 
      ? normalizeAddress(addressAr, cityName)
      : normalizeAddress(addressEn, cityNameEn, ','),
    lat: coords.lat,
    lng: coords.lng,
    stars: Math.max(1, Math.min(5, api.stars)) as 1 | 2 | 3 | 4 | 5,
    rating: 4.5, // Fallback rating since API does not return a rating
    reviewCount: 12, // Fallback count
    priceFrom: api.price,
    currency: 'USD',
    images: api.images && api.images.length > 0 ? api.images : [api.mainImageUrl].filter(Boolean),
    thumbnail: api.mainImageUrl,
    amenities: (api.amenities || []).map((a) => mapApiAmenityToAmenity(a, 'general')),
    rooms,
    isFeatured: api.isSpecial || false,
    isActive: !api.isDeleted && api.isPublished,
    cityId: cityDoc?.id || api.destination,
    policyAr: Array.isArray(api.policies) && api.policies.length > 0
      ? api.policies.map((p: any) => (typeof p === 'object' && p !== null ? (p.ar || p.en || '') : String(p))).filter(Boolean).join('\n')
      : undefined,
    policyEn: Array.isArray(api.policies) && api.policies.length > 0
      ? api.policies.map((p: any) => (typeof p === 'object' && p !== null ? (p.en || p.ar || '') : String(p))).filter(Boolean).join('\n')
      : undefined,
    mapUrl: api.mapLink || undefined,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

function extractCoordinates(data: any): { lat?: number; lng?: number } {
  if (typeof data?.lat === 'number' && typeof data?.lng === 'number' && !isNaN(data.lat) && !isNaN(data.lng)) {
    return { lat: data.lat, lng: data.lng };
  }
  if (typeof data?.latitude === 'number' && typeof data?.longitude === 'number') {
    return { lat: data.latitude, lng: data.longitude };
  }
  if (data?.location && typeof data.location.latitude === 'number' && typeof data.location.longitude === 'number') {
    return { lat: data.location.latitude, lng: data.location.longitude };
  }
  if (data?.location && typeof data.location._latitude === 'number' && typeof data.location._longitude === 'number') {
    return { lat: data.location._latitude, lng: data.location._longitude };
  }
  if (data?.coordinates && typeof data.coordinates.lat === 'number' && typeof data.coordinates.lng === 'number') {
    return { lat: data.coordinates.lat, lng: data.coordinates.lng };
  }

  const url = data?.mapLink || data?.mapUrl || '';
  if (typeof url === 'string' && url) {
    const matchAt = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (matchAt) {
      return { lat: parseFloat(matchAt[1]), lng: parseFloat(matchAt[2]) };
    }
    const matchQ = url.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (matchQ) {
      return { lat: parseFloat(matchQ[1]), lng: parseFloat(matchQ[2]) };
    }
  }

  return {};
}

// ─── API Client ───────────────────────────────────────────────────────────────

class ApiClient {
  private getBaseUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl) return envUrl.replace(/\/$/, '');
    return 'https://us-central1-msariapp-v2.cloudfunctions.net/api/v1';
  }

  private getApiKey(): string {
    const key = process.env.NEXT_PUBLIC_API_KEY;
    if (!key) {
      console.warn('[API CLIENT] NEXT_PUBLIC_API_KEY is missing, using default fallback key.');
      return 'MSARI-DEV-P9UMADLA-FCGF1IBU';
    }
    return key;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.getBaseUrl()}/${path.replace(/^\//, '')}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.getApiKey(),
      ...headers,
    };

    // 3.5 seconds timeout to prevent hanging the Next.js dev server/client
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      cache: 'no-store',
      signal: controller.signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          // No JSON body
        }
        
        return {
          success: false,
          error: {
            code: errData?.error?.code || `HTTP_${response.status}`,
            message: errData?.error?.message || `Request failed with status ${response.status}`,
            fieldErrors: errData?.error?.fieldErrors,
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data as T,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn(`[API CLIENT TIMEOUT] ${method} ${url}: Request timed out after 3.5s.`);
      } else {
        console.error(`[API CLIENT ERROR] ${method} ${url}:`, error);
      }
      return {
        success: false,
        error: {
          code: error.name === 'AbortError' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          message: error.name === 'AbortError' ? 'Request timed out.' : (error.message || 'Network error occurred.'),
        },
      };
    }
  }

  public get<T>(path: string, headers?: Record<string, string>) {
    return this.request<T>('GET', path, undefined, headers);
  }

  public post<T>(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>('POST', path, body, headers);
  }

  public patch<T>(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>('PATCH', path, body, headers);
  }

  // ─── Authentication API ─────────────────────────────────────────────────────

  public async loginUser(email: string, passwordHash: string): Promise<ApiResponse<{
    id: string;
    email: string;
    name: string;
    phone?: string;
    image?: string;
    role: 'CUSTOMER' | 'ADMIN' | 'BOOKING_STAFF';
    token?: string;
  }>> {
    const res = await this.post<{
      uid: string;
      email: string;
      token: string;
    }>('/auth/login', { email, password: passwordHash });

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    // Call /me to get name, photo and Firestore user details
    const meRes = await this.get<{
      uid: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      phoneNumber?: string;
      photoUrl?: string;
      photoURL?: string;
      profileImageUrl?: string;
      avatarUrl?: string;
      image?: string;
      profilePicture?: string;
    }>('/me', { Authorization: `Bearer ${res.data.token}` });

    const role = (email.endsWith('@msari.net') || email === 'admin@msari.net') ? 'ADMIN' as const : 'CUSTOMER' as const;
    const me = meRes.success && meRes.data ? meRes.data : null;
    const name = me ? (me.name || `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'User') : 'User';
    const phone = me ? (me.phoneNumber || '') : '';
    const image = me ? (me.profileImageUrl || me.photoURL || me.photoUrl || me.avatarUrl || me.image || me.profilePicture || '') : '';

    return {
      success: true,
      data: {
        id: res.data.uid,
        email: res.data.email,
        name,
        phone,
        image,
        role,
        token: res.data.token,
      },
    };
  }

  public async registerUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string | null;
  }): Promise<ApiResponse<{ id: string }>> {
    const parts = data.name.split(' ');
    const firstName = parts[0] || 'User';
    const lastName = parts.slice(1).join(' ') || 'User';

    const res = await this.post<{ uid: string }>('/auth/register', {
      email: data.email,
      password: data.passwordHash,
      firstName,
      lastName,
      phoneNumber: data.phone || undefined,
    });

    if (!res.success || !res.data) {
      return { success: false, error: res.error };
    }

    return {
      success: true,
      data: { id: res.data.uid },
    };
  }

  // ─── Cities API ─────────────────────────────────────────────────────────────

  public async getCities(): Promise<City[]> {
    const res = await this.get<{ success: boolean; data: ApiCity[] }>('/cities');
    if (!res.success || !res.data || !res.data.data) return [];
    
    // Default map to frontend City structure
    return res.data.data.map((c) => mapApiCityToCity(c, 0));
  }

  // ─── Rooms API ──────────────────────────────────────────────────────────────

  public async getRooms(hotelId: string): Promise<Room[]> {
    const res = await this.get<{ success: boolean; data: ApiRoom[] }>(`/rooms?hotelId=${hotelId}`);
    if (!res.success || !res.data || !res.data.data) return [];
    return res.data.data.map(mapApiRoomToRoom);
  }

  // ─── Hotels API ─────────────────────────────────────────────────────────────

  public async fetchAllHotels(): Promise<ApiHotel[]> {
    const res = await this.get<{ success: boolean; data: ApiHotel[] }>('/hotels?limit=100');
    if (!res.success || !res.data || !res.data.data) return [];
    return res.data.data;
  }

  public async fetchHotelById(id: string): Promise<ApiHotel | null> {
    const res = await this.get<ApiHotel>(`/hotels/${id}`);
    if (!res.success || !res.data) return null;
    return res.data;
  }
}

export const apiClient = new ApiClient();
