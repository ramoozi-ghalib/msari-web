import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/actions/hotels';
import { db } from '@/lib/firebase-admin';
import { getPhaseMigrationMode, getCanaryRatio, inCanaryBucket } from '@/lib/api-migration/flags';
import { shadowCompare } from '@/lib/api-migration/shadow';
import { safeLog } from '@/lib/api-migration/log';
import RoomDetailClient from './RoomDetailClient';

import { getLocalizedAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string; slug: string; roomId: string }>;
}

export async function generateMetadata(props: Props) {
  const { locale, slug, roomId } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) return { title: 'غرفة غير موجودة | مساري' };
  
  const room = hotel.rooms?.find(r => r.id === roomId);
  if (!room) return { title: `${hotel.name} | مساري` };

  const path = `/hotels/${slug}/rooms/${roomId}`;
  const title = `${room.name} - ${hotel.name} | مساري`;
  const description = room.description || `احجز ${room.name} في ${hotel.name} بأفضل الأسعار.`;

  return {
    title,
    description,
    alternates: getLocalizedAlternates(path, locale),
    openGraph: { 
      title, 
      description, 
      url: `https://msari.net/${locale || 'ar'}${path}` 
    },
  };
}

export default async function RoomDetailPage(props: Props) {
  const { slug, roomId } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  // البحث عن الغرفة ضمن الفندق المحمل أولاً
  let room = hotel.rooms?.find(r => r.id === roomId);

  // إذا لم نجدها: Phase R — API-first fallback (server-only key) مع direct fallback.
  // OFF → direct فقط؛ SHADOW → direct + مقارنة؛ CANARY → 5% API مع diff-gate؛
  // ON → API أساسي + direct عند أي فشل. 404 حقيقي فقط عند الغياب في المسارين.
  if (!room) {
    room = (await findRoomFallback(hotel.id, roomId)) ?? undefined;

    if (!room) {
      notFound();
    }
  }

  return <RoomDetailClient hotel={hotel} room={room} />;
}

type RoomsApiMode = 'OFF' | 'SHADOW' | 'CANARY' | 'ON';

function getRoomsApiMode(): RoomsApiMode {
  try {
    return process.env.MSARI_API_ROOMS_MODE !== undefined
      ? getPhaseMigrationMode('rooms')
      : 'CANARY';
  } catch {
    return 'OFF';
  }
}

/** Direct Firestore subcollection read (website semantics). Fallback path — never deleted. */
async function findRoomDirect(hotelId: string, roomId: string) {
  const { toWebsiteRoom } = await import('@/lib/api-migration/hotels-api');
  const snap = await db.collection('hotels').doc(hotelId).collection('rooms').get();
  const hit = snap.docs.find(
    (d) => d.id === roomId && d.data().isPublished === true && d.data().isDeleted !== true
  );
  if (!hit) return null;
  return toWebsiteRoom({ id: hit.id, ...hit.data() }, hotelId);
}

/** API primary (server-only MSARI_API_KEY; throws on 401/403/5xx/timeout). */
async function findRoomViaApi(hotelId: string, roomId: string) {
  const { apiFetchRooms } = await import('@/lib/api-migration/hotels-api');
  const rooms = await apiFetchRooms(hotelId);
  return rooms.find((r) => r.id === roomId) ?? null;
}

async function findRoomFallback(hotelId: string, roomId: string) {
  const mode = getRoomsApiMode();
  if (mode === 'OFF') return findRoomDirect(hotelId, roomId);
  if (mode === 'SHADOW') {
    const direct = await findRoomDirect(hotelId, roomId);
    void (async () => {
      try {
        const api = await findRoomViaApi(hotelId, roomId);
        const same =
          (direct === null && api === null) ||
          (direct !== null && api !== null &&
            JSON.stringify(stripRoom(direct)) === JSON.stringify(stripRoom(api)));
        safeLog('rooms-shadow', {
          route: 'room-detail-fallback', hotelId, roomId, match: same,
        });
      } catch (e) {
        safeLog('rooms-shadow', {
          route: 'room-detail-fallback', hotelId, roomId,
          error: e instanceof Error ? e.message.slice(0, 120) : String(e).slice(0, 120),
        });
      }
    })().catch(() => undefined);
    return direct;
  }
  if (mode === 'CANARY') {
    const ratio = getCanaryRatio();
    const key = `rooms:${hotelId}:${roomId}:${Math.floor(Date.now() / 60000)}`;
    if (inCanaryBucket(key, ratio)) {
      try {
        const [api, direct] = await Promise.all([
          findRoomViaApi(hotelId, roomId),
          findRoomDirect(hotelId, roomId),
        ]);
        const same =
          (direct === null && api === null) ||
          (direct !== null && api !== null &&
            JSON.stringify(stripRoom(direct)) === JSON.stringify(stripRoom(api)));
        safeLog('rooms-canary', {
          route: 'room-detail-fallback', servedFrom: same ? 'api' : 'direct', ratio,
        });
        return same ? api : direct;
      } catch {
        return findRoomDirect(hotelId, roomId);
      }
    }
    return findRoomDirect(hotelId, roomId);
  }
  // ON: API primary, explicit direct fallback on any transport/auth failure.
  try {
    const api = await findRoomViaApi(hotelId, roomId);
    if (api) {
      try {
        safeLog('rooms-serve', { servedFrom: 'api', hotelId, roomId });
      } catch { /* never break */ }
    }
    return api ?? (await findRoomDirect(hotelId, roomId));
  } catch (e) {
    try {
      safeLog('rooms-serve', {
        servedFrom: 'direct-fallback',
        reason: e instanceof Error ? e.message.slice(0, 120) : String(e).slice(0, 120),
      });
    } catch { /* never break */ }
    return findRoomDirect(hotelId, roomId);
  }
}

function stripRoom(room: unknown): unknown {
  const { updatedAt: _u, ...rest } = room as Record<string, unknown>;
  void _u;
  return rest;
}
