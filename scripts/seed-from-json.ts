/**
 * seed-from-json.ts
 * ────────────────────────────────────────────────────────────────
 * Reads transformed JSON files and seeds the Prisma/Supabase DB.
 * Safe to re-run (idempotent via wpId for hotels, nameAr for cities).
 *
 * Input (tries with-storage-urls first, falls back to plain):
 *   migration-output/transformed/cities.json
 *   migration-output/transformed/amenities.json
 *   migration-output/transformed/hotels[-with-storage-urls].json
 *   migration-output/transformed/rooms[-with-storage-urls].json
 *
 * Usage: npx tsx scripts/seed-from-json.ts
 */

import { PrismaClient, AmenityCategory } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';

const prisma  = new PrismaClient({ log: ['warn', 'error'] });
const TDIR    = path.join(process.cwd(), 'migration-output', 'transformed');

// ── Load helper ───────────────────────────────────────────────────
function load<T>(preferred: string, fallback: string): T[] {
  for (const name of [preferred, fallback]) {
    const p = path.join(TDIR, name);
    if (existsSync(p)) {
      const data = JSON.parse(readFileSync(p, 'utf8')) as T[];
      console.log(`  📥 ${name}  → ${data.length.toLocaleString()} records`);
      return data;
    }
  }
  console.warn(`  ⚠️  Neither ${preferred} nor ${fallback} found`);
  return [];
}

// ── JSON types ────────────────────────────────────────────────────
interface CityJson {
  id: string; _locId: number;
  nameAr: string; nameEn: string;
  governorateAr: string; governorateEn: string;
  country: string; imageUrl: string | null; isActive: boolean;
}
interface AmenityJson {
  id: string; _wpTermId: number;
  nameAr: string; nameEn: string;
  icon: string; category: 'HOTEL_AMENITIES' | 'ROOM_FEATURES';
}
interface HotelImageJson { url: string; order: number; altAr?: string; altEn?: string; }
interface HotelJson {
  id: string; _wpId: number; wpId: number; slug: string;
  nameAr: string; nameEn: string;
  descriptionAr: string; descriptionEn: string | null;
  address: string; mapUrl: string | null;
  lat: number | null; lng: number | null;
  stars: number; rating: number; reviewCount: number;
  priceFrom: number; currency: string;
  thumbnailUrl: string | null; isFeatured: boolean; isActive: boolean;
  cityId: string; policyAr: string | null; policyEn: string | null;
  images: HotelImageJson[]; amenityIds: string[];
}
interface RoomImageJson { url: string; order: number; }
interface RoomJson {
  id: string; _wpId: number; hotelId: string;
  nameAr: string; nameEn: string;
  descriptionAr: string | null; descriptionEn: string | null;
  capacity: number; pricePerNight: number; isAvailable: boolean;
  images: RoomImageJson[]; amenityIds: string[];
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database from transformed JSON...\n');
  console.log('📥 Loading files:');

  const cities    = load<CityJson>   ('cities.json',                    'cities.json');
  const amenities = load<AmenityJson>('amenities.json',                 'amenities.json');
  const hotels    = load<HotelJson>  ('hotels-with-storage-urls.json',  'hotels.json');
  const rooms     = load<RoomJson>   ('rooms-with-storage-urls.json',   'rooms.json');

  // ── ID remapping: JSON temp IDs → real DB IDs ─────────────────
  const cityIdMap:    Record<string, string> = {};  // "city_1" → real cuid
  const amenityIdMap: Record<string, string> = {};  // "amenity_3" → real cuid
  const hotelIdMap:   Record<string, string> = {};  // "hotel_5" → real cuid

  // ══════════════════════════════════════════════════════════════
  // STEP 1: Cities
  // ══════════════════════════════════════════════════════════════
  console.log(`\n🏙  Seeding ${cities.length} cities...`);
  let cityOk = 0;

  for (const c of cities) {
    try {
      // Find existing by nameAr (most stable identifier)
      let record = await prisma.city.findFirst({ where: { nameAr: c.nameAr } });

      if (!record) {
        record = await prisma.city.create({
          data: {
            nameAr:        c.nameAr,
            nameEn:        c.nameEn,
            governorateAr: c.governorateAr,
            governorateEn: c.governorateEn,
            imageUrl:      c.imageUrl,
            isActive:      c.isActive,
          },
        });
      } else {
        // Update non-destructively
        await prisma.city.update({
          where: { id: record.id },
          data:  { nameEn: c.nameEn, governorateAr: c.governorateAr, governorateEn: c.governorateEn },
        });
      }

      cityIdMap[c.id] = record.id;
      cityOk++;
      process.stdout.write('.');
    } catch (e: any) {
      console.warn(`\n  ⚠️  City "${c.nameAr}": ${e.message}`);
    }
  }
  console.log(`\n  ✅ ${cityOk}/${cities.length} cities done`);

  // ══════════════════════════════════════════════════════════════
  // STEP 2: Amenities — مُعطّل (المرافق تُدار عبر fix-amenities.mjs)
  // ══════════════════════════════════════════════════════════════
  console.log(`\n🛎  Skipping amenities (managed separately via fix-amenities.mjs)`);

  // ══════════════════════════════════════════════════════════════
  // STEP 3: Hotels
  // ══════════════════════════════════════════════════════════════
  console.log(`\n🏨  Seeding ${hotels.length} hotels...`);
  let hotelOk = 0, hotelErr = 0;

  for (const h of hotels) {
    const realCityId = cityIdMap[h.cityId] ?? null;
    if (!realCityId) {
      console.warn(`\n  ⚠️  Hotel "${h.nameAr}": city "${h.cityId}" not mapped, skipping`);
      hotelErr++;
      continue;
    }

    // Resolve amenity IDs
    const amenityConnects = (h.amenityIds ?? [])
      .map(aid => amenityIdMap[aid])
      .filter((id): id is string => Boolean(id))
      .map(id => ({ amenityId: id }));

    // Images (filter nulls)
    const validImages = (h.images ?? []).filter(img => img.url);
    const imagesCreate = validImages.map(img => ({
      url:   img.url,
      order: img.order ?? 0,
      altAr: img.altAr ?? h.nameAr,
      altEn: img.altEn ?? h.nameEn,
    }));

    // Ensure unique slug (append wpId which is already in slug from transform)
    const slug = h.slug;

    try {
      const existing = await prisma.hotel.findUnique({ where: { wpId: h.wpId } });

      let hotel;
      if (existing) {
        // Update core fields
        hotel = await prisma.hotel.update({
          where: { id: existing.id },
          data: {
            nameAr:        h.nameAr,
            nameEn:        h.nameEn,
            descriptionAr: h.descriptionAr || h.nameAr,
            address:       h.address || h.nameAr,
            lat:           h.lat,
            lng:           h.lng,
            stars:         h.stars,
            priceFrom:     h.priceFrom,
            thumbnailUrl:  h.thumbnailUrl,
            isFeatured:    h.isFeatured,
            isActive:      h.isActive,
            cityId:        realCityId,
          },
        });

        // Update images if we have more than what's currently stored
        if (imagesCreate.length > 0) {
          const currentImgCount = await prisma.hotelImage.count({ where: { hotelId: existing.id } });
          if (imagesCreate.length > currentImgCount) {
            await prisma.hotelImage.deleteMany({ where: { hotelId: existing.id } });
            await prisma.hotelImage.createMany({
              data: imagesCreate.map(img => ({ ...img, hotelId: existing.id })),
            });
          }
        }
      } else {
        hotel = await prisma.hotel.create({
          data: {
            slug,
            wpId:          h.wpId,
            type:          'LOCAL',
            nameAr:        h.nameAr,
            nameEn:        h.nameEn,
            descriptionAr: h.descriptionAr || h.nameAr,
            descriptionEn: h.descriptionEn,
            address:       h.address || h.nameAr,
            mapUrl:        h.mapUrl,
            lat:           h.lat,
            lng:           h.lng,
            stars:         h.stars,
            rating:        h.rating || 4.0,
            reviewCount:   0,
            priceFrom:     h.priceFrom,
            currency:      h.currency || 'USD',
            thumbnailUrl:  h.thumbnailUrl,
            isFeatured:    h.isFeatured,
            isActive:      h.isActive,
            cityId:        realCityId,
            policyAr:      h.policyAr,
            policyEn:      h.policyEn,
            images:    { create: imagesCreate },
            amenities: { create: amenityConnects },
          },
        });
      }

      hotelIdMap[h.id] = hotel.id;
      hotelOk++;
      process.stdout.write('.');
    } catch (e: any) {
      hotelErr++;
      // Slug conflict? try with a suffix
      if (e.code === 'P2002' && e.meta?.target?.includes('slug')) {
        try {
          const hotel = await prisma.hotel.create({
            data: {
              slug:          `${slug}-${Date.now()}`,
              wpId:          h.wpId,
              type:          'LOCAL',
              nameAr:        h.nameAr,
              nameEn:        h.nameEn,
              descriptionAr: h.descriptionAr || h.nameAr,
              address:       h.address || h.nameAr,
              lat:           h.lat,
              lng:           h.lng,
              stars:         h.stars,
              rating:        h.rating || 4.0,
              reviewCount:   0,
              priceFrom:     h.priceFrom,
              currency:      h.currency || 'USD',
              thumbnailUrl:  h.thumbnailUrl,
              isFeatured:    h.isFeatured,
              isActive:      h.isActive,
              cityId:        realCityId,
              images:    { create: imagesCreate },
              amenities: { create: amenityConnects },
            },
          });
          hotelIdMap[h.id] = hotel.id;
          hotelErr--; hotelOk++;
          process.stdout.write('s'); // s = slug-fixed
        } catch (e2: any) {
          console.warn(`\n  ⚠️  Hotel "${h.nameAr}" (wpId=${h.wpId}): ${e2.message}`);
        }
      } else {
        console.warn(`\n  ⚠️  Hotel "${h.nameAr}" (wpId=${h.wpId}): ${e.message}`);
      }
    }
  }
  console.log(`\n  ✅ ${hotelOk} seeded, ⚠️ ${hotelErr} failed`);

  // ══════════════════════════════════════════════════════════════
  // STEP 4: Rooms
  // ══════════════════════════════════════════════════════════════
  console.log(`\n🛏  Seeding ${rooms.length} rooms...`);
  let roomOk = 0, roomErr = 0;

  for (const r of rooms) {
    const realHotelId = hotelIdMap[r.hotelId];
    if (!realHotelId) {
      roomErr++;
      continue;
    }

    const amenityConnects = (r.amenityIds ?? [])
      .map(aid => amenityIdMap[aid])
      .filter((id): id is string => Boolean(id))
      .map(id => ({ amenityId: id }));

    const validImages = (r.images ?? []).filter(img => img.url);
    const imagesCreate = validImages.map(img => ({ url: img.url, order: img.order ?? 0 }));

    try {
      // Check if room already exists (by hotel + name)
      const existing = await prisma.room.findFirst({
        where: { hotelId: realHotelId, nameAr: r.nameAr },
      });

      if (!existing) {
        await prisma.room.create({
          data: {
            nameAr:        r.nameAr,
            nameEn:        r.nameEn,
            descriptionAr: r.descriptionAr,
            descriptionEn: r.descriptionEn,
            capacity:      r.capacity,
            pricePerNight: r.pricePerNight || 0,
            isAvailable:   r.isAvailable,
            hotelId:       realHotelId,
            images:    { create: imagesCreate },
            amenities: { create: amenityConnects },
          },
        });
      } else if (imagesCreate.length > 0) {
        // Room exists — update images if we have new gallery data
        const currentImgCount = await prisma.roomImage.count({ where: { roomId: existing.id } });
        if (imagesCreate.length > currentImgCount) {
          // Delete old images and replace with full gallery
          await prisma.roomImage.deleteMany({ where: { roomId: existing.id } });
          await prisma.roomImage.createMany({
            data: imagesCreate.map(img => ({ ...img, roomId: existing.id })),
          });
        }
      }

      roomOk++;
      process.stdout.write('.');
    } catch (e: any) {
      roomErr++;
      console.warn(`\n  ⚠️  Room "${r.nameAr}": ${e.message}`);
    }
  }
  console.log(`\n  ✅ ${roomOk} seeded, ⚠️ ${roomErr} failed`);

  // ══════════════════════════════════════════════════════════════
  // Final summary
  // ══════════════════════════════════════════════════════════════
  const [cityCount, amenityCount, hotelCount, roomCount, hotelImgCount, roomImgCount] = await Promise.all([
    prisma.city.count(),
    prisma.amenity.count(),
    prisma.hotel.count(),
    prisma.room.count(),
    prisma.hotelImage.count(),
    prisma.roomImage.count(),
  ]);

  console.log('\n══════════════════════════════════════════════');
  console.log('✅ Migration complete! Database now contains:');
  console.log(`   🏙  Cities:    ${cityCount}`);
  console.log(`   🛎  Amenities: ${amenityCount}`);
  console.log(`   🏨  Hotels:    ${hotelCount}`);
  console.log(`   🛏  Rooms:     ${roomCount}`);
  console.log(`   🖼  Images:    ${hotelImgCount + roomImgCount}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('\n❌ Fatal error:', err.message);
  console.error(err.stack);
  await prisma.$disconnect();
  process.exit(1);
});
