/**
 * Phase B — Hotels API adapter (server-only).
 *
 * Maps MSARI API hotel payloads to the website Hotel type using the SAME mapping
 * helpers as the direct Firestore path, then applies the SHARED filter/sort
 * helpers from `@/actions/hotels`. Any behavioral difference vs direct is a bug.
 *
 * Key mapping decisions (all parity-proven):
 * - priceFrom := api.displayPrice (proven equal to website min(explicit, rooms)).
 * - createdAt := api.createdAt ?? epoch fallback (API returns null when missing,
 *   exactly like the direct path fallback).
 * - slug := api.slug (persisted, backfilled 57/57) — same generator either way.
 * - amenities/policies mapped with mapAmenitiesToDTO (same as direct path).
 * - city join uses direct getActiveCities (transitional; cities full migration later).
 */
import { getServerApiBaseUrl, getServerApiKey } from './msari-api';
import {
  mapApiHotelToHotel,
  mapApiRoomToRoom,
} from '@/lib/api-client';
import type { Hotel, Room, City } from '@/types';
import {
  filterHotels,
  sortHotels,
  mapAmenitiesToDTO,
} from '@/lib/hotel-utils';
import type { GetLocalHotelsParams } from '@/actions/hotels';

export interface ApiHotelV2 {
  id: string;
  slug?: string | null;
  destination?: string;
  name?: { ar?: string; en?: string } | string;
  address?: { ar?: string; en?: string } | string;
  overview?: { ar?: string; en?: string } | string;
  mainImageUrl?: string;
  images?: string[];
  amenities?: unknown[];
  policies?: unknown[];
  stars?: number;
  price?: number;
  displayPrice?: number | null;
  featured?: boolean;
  isSpecial?: boolean;
  isPublished?: boolean;
  mapLink?: string;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  location?: unknown;
  coordinates?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
  isDeleted?: boolean;
}

async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  if (typeof window !== 'undefined') {
    throw new Error('[hotels-api] server-only: must never run in the browser.');
  }
  const base = getServerApiBaseUrl();
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  }
  const url = qs.toString() ? `${base}${path}?${qs}` : `${base}${path}`;
  // Conservative 8s cap (not 15s): on serverless timeouts the caller must still
  // have budget left for the direct-Firestore fallback. Proven: cold Functions
  // can take 7s+; hanging the full budget would turn fallback into a 504.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { 'x-api-key': getServerApiKey() },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API ${path} -> HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/** Map one API hotel to the website Hotel type with direct-path-identical semantics.
 *
 * priceSource:
 * - 'display' (listing/cards/nearby): priceFrom := displayPrice (proven equal to
 *   website min(explicit, rooms)).
 * - 'explicit' (detail/booking): priceFrom := explicit hotel price only, mirroring
 *   getHotelBySlug which never folds rooms into the hotel price (rooms travel
 *   separately in `hotel.rooms`).
 */
export function toWebsiteHotel(
  apiH: ApiHotelV2,
  apiCities: City[],
  rooms: Room[] = [],
  priceSource: 'display' | 'explicit' | 'probe' = 'display'
): Hotel {
  const dto: any = {
    id: apiH.id,
    destination: apiH.destination || '',
    name: apiH.name || { ar: '', en: '' },
    address: apiH.address || { ar: '', en: '' },
    overview: apiH.overview || { ar: '', en: '' },
    mainImageUrl: apiH.mainImageUrl || '',
    images: apiH.images || [],
    amenities: mapAmenitiesToDTO(apiH.amenities),
    policies: (apiH.policies || []).map((pol: any) => {
      if (typeof pol === 'object' && pol !== null) {
        return pol.ar || pol.en || '';
      }
      return String(pol);
    }),
    stars: Math.max(1, Math.min(5, Number(apiH.stars) || 3)),
    // Listing/cards show the canonical display min; detail shows explicit only;
    // nearby probes show explicit||30 — each mirrors its direct counterpart exactly.
    price: (() => {
      const explicit = Number((apiH as any).price || (apiH as any).priceFrom || 0);
      if (priceSource === 'explicit' || priceSource === 'probe') {
        return priceSource === 'probe' ? (explicit > 0 ? explicit : 30) : explicit;
      }
      return typeof apiH.displayPrice === 'number' ? apiH.displayPrice : explicit;
    })(),
    isSpecial: apiH.isSpecial || apiH.featured || false,
    isPublished: apiH.isPublished !== false,
    mapLink: (apiH as any).mapLink || (apiH as any).mapUrl || '',
    lat:
      (apiH as any).lat ||
      (apiH as any).latitude ||
      (apiH as any).location?.latitude ||
      (apiH as any).location?._latitude ||
      (apiH as any).coordinates?.lat,
    lng:
      (apiH as any).lng ||
      (apiH as any).longitude ||
      (apiH as any).location?.longitude ||
      (apiH as any).location?._longitude ||
      (apiH as any).coordinates?.lng,
    createdAt: apiH.createdAt || '1970-01-01T00:00:00.000Z',
    updatedAt: (apiH as any).updatedAt || new Date().toISOString(),
    isDeleted: apiH.isDeleted || false,
  };
  const hotel = mapApiHotelToHotel(dto, rooms, apiCities);
  if (typeof apiH.slug === 'string' && apiH.slug) {
    hotel.slug = apiH.slug;
  }
  return hotel;
}

export interface ApiListResponse {
  success: boolean;
  count: number;
  nextCursor: string | null;
  data: ApiHotelV2[];
}

/** Single bounded API call — full hotel list, NO rooms fan-out (prices come from displayPrice). */
export async function apiFetchAllHotels(): Promise<{ hotels: ApiHotelV2[] }> {
  const res = await apiGet<ApiListResponse>('/hotels', { limit: 100, sort: 'recommended' });
  return { hotels: Array.isArray(res.data) ? res.data : [] };
}

export async function apiFetchHotelBySlug(slug: string): Promise<ApiHotelV2 | null> {
  try {
    const hotel = await apiGet<ApiHotelV2 | null>(`/hotels/by-slug/${encodeURIComponent(slug)}`);
    return hotel && (hotel as any).id ? hotel : null;
  } catch {
    return null;
  }
}

export async function apiFetchHotelById(id: string): Promise<ApiHotelV2 | null> {
  try {
    const hotel = await apiGet<ApiHotelV2 | null>(`/hotels/${encodeURIComponent(id)}`);
    return hotel && (hotel as any).id ? hotel : null;
  } catch {
    return null;
  }
}

export async function apiFetchRooms(hotelId: string): Promise<Room[]> {
  try {
    const res = await apiGet<{ data?: any[] }>(`/rooms`, { hotelId });
    const list = Array.isArray(res.data) ? res.data : [];
    // Mirror the direct path's query-level filter (rooms where isPublished==true).
    // Docs missing the field are excluded on both paths.
    return list
      .filter((r: any) => r && r.isPublished === true && r.isDeleted !== true)
      .map((r: any) => toWebsiteRoom(r, hotelId));
  } catch {
    return [];
  }
}

/**
 * Map one API room with DIRECT-path-identical semantics (mirrors the
 * getHotelBySlug room block: same field expressions, same amenities mapper).
 * API rooms carry the same raw shapes (features[] with iconKey/label) because
 * the API passes Firestore room documents through verbatim.
 */
export function toWebsiteRoom(apiRoom: any, hotelId: string): Room {
  const rawFeatures = apiRoom.features || apiRoom.amenities || [];
  return mapApiRoomToRoom({
    id: apiRoom.id,
    hotelId,
    name: apiRoom.name || { ar: '', en: '' },
    description: apiRoom.description || { ar: '', en: '' },
    price: Number(apiRoom.price || apiRoom.pricePerNight || 0),
    numberOfPersons: Number(apiRoom.numberOfPersons || apiRoom.capacity || apiRoom.maxGuests || 2),
    numberOfBeds: Number(apiRoom.numberOfBeds || 1),
    numberOfBathrooms: Number(apiRoom.numberOfBathrooms || 1),
    numberOfRooms: Number(apiRoom.numberOfRooms || 1),
    area: apiRoom.area || apiRoom.roomArea || apiRoom.space,
    images: apiRoom.images || (apiRoom.mainImageUrl ? [apiRoom.mainImageUrl] : []),
    mainImageUrl: apiRoom.mainImageUrl || '',
    features: mapAmenitiesToDTO(rawFeatures),
    isPublished: apiRoom.isPublished !== false,
    updatedAt: apiRoom.updatedAt,
    isDeleted: apiRoom.isDeleted || false,
  });
}

/**
 * Website-equivalent list operation over API data: map → shared filter →
 * shared sort → slice. Returns { data, total } like getLocalHotels.
 */
export function applyWebsiteListSemantics(
  apiHotels: ApiHotelV2[],
  apiCities: City[],
  params: GetLocalHotelsParams | undefined,
  page: number,
  pageSize: number
): { data: Hotel[]; total: number } {
  const mapped = apiHotels.map((h) =>
    toWebsiteHotel(h, apiCities, [], params?.skipRoomPrices ? 'probe' : 'display')
  );
  const filtered = filterHotels(mapped, params);
  const sorted = sortHotels(filtered, params?.sort);
  const skip = (page - 1) * pageSize;
  return { data: sorted.slice(skip, skip + pageSize), total: sorted.length };
}
