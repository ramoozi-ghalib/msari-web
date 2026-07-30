/**
 * diagnose-hotels.mjs
 * Run: node scripts/diagnose-hotels.mjs
 * Purpose: Compare raw SQL vs Prisma query to isolate the data-gap layer
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'warn', 'error'],
});

async function main() {
  console.log('\n============================================================');
  console.log('   MSARI — HOTEL DATA DIAGNOSIS SCRIPT');
  console.log('============================================================\n');

  // ── 1. DATABASE_URL verification ──────────────────────────────────────────
  console.log('[1] DATABASE_URL in use:');
  const dbUrl = process.env.DATABASE_URL || '(not set)';
  // Mask password for safety
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':***@');
  console.log('   ', maskedUrl);

  // ── 2. Raw SQL — SELECT * FROM hotels ────────────────────────────────────
  console.log('\n[2] Raw SQL: SELECT id, slug, "isActive", "cityId", type FROM hotels;');
  try {
    const rawHotels = await prisma.$queryRaw`
      SELECT id, slug, "isActive", "cityId", type, "isFeatured", "nameAr"
      FROM hotels
      ORDER BY "createdAt" DESC;
    `;
    console.log(`   Row count: ${rawHotels.length}`);
    console.table(rawHotels);
  } catch (e) {
    console.error('   RAW SQL ERROR:', e.message);
  }

  // ── 3. Raw SQL — Verify isActive column values ────────────────────────────
  console.log('\n[3] Raw SQL: isActive distribution in hotels');
  try {
    const activeCounts = await prisma.$queryRaw`
      SELECT "isActive", COUNT(*) as count FROM hotels GROUP BY "isActive";
    `;
    console.table(activeCounts);
  } catch (e) {
    console.error('   ERROR:', e.message);
  }

  // ── 4. Raw SQL — Verify cityId FK validity ────────────────────────────────
  console.log('\n[4] Raw SQL: FK validity — hotels with missing cityId');
  try {
    const fkCheck = await prisma.$queryRaw`
      SELECT h.id, h.slug, h."cityId",
             c.id AS city_exists
      FROM hotels h
      LEFT JOIN cities c ON c.id = h."cityId"
      WHERE c.id IS NULL;
    `;
    if (fkCheck.length === 0) {
      console.log('   ✅ All cityId foreign keys are valid');
    } else {
      console.log('   ❌ Hotels with INVALID cityId:');
      console.table(fkCheck);
    }
  } catch (e) {
    console.error('   ERROR:', e.message);
  }

  // ── 5. Raw SQL — Verify cities isActive ───────────────────────────────────
  console.log('\n[5] Raw SQL: Cities isActive distribution');
  try {
    const cities = await prisma.$queryRaw`
      SELECT id, "nameAr", "isActive" FROM cities ORDER BY "nameAr";
    `;
    console.table(cities);
  } catch (e) {
    console.error('   ERROR:', e.message);
  }

  // ── 6. Prisma.hotel.findMany() — NO filter ────────────────────────────────
  console.log('\n[6] Prisma: hotel.findMany() — NO where filter (baseline)');
  try {
    const all = await prisma.hotel.findMany({ select: { id: true, slug: true, isActive: true, type: true } });
    console.log(`   Prisma count (no filter): ${all.length}`);
    console.table(all);
  } catch (e) {
    console.error('   ERROR:', e.message);
  }

  // ── 7. Prisma.hotel.findMany() — WITH isActive + type filter (production query) ──
  console.log('\n[7] Prisma: hotel.findMany({ where: { isActive: true, type: "LOCAL" } })');
  try {
    const filtered = await prisma.hotel.findMany({
      where: { isActive: true, type: 'LOCAL' },
      select: { id: true, slug: true, isActive: true, type: true, isFeatured: true },
    });
    console.log(`   Prisma count (isActive=true, type=LOCAL): ${filtered.length}`);
    console.table(filtered);
  } catch (e) {
    console.error('   ERROR:', e.message);
  }

  // ── 8. Check if HotelType enum value is "LOCAL" or mismatched ────────────
  console.log('\n[8] Raw SQL: Distinct values in the "type" column');
  try {
    const types = await prisma.$queryRaw`
      SELECT DISTINCT type, COUNT(*) as count FROM hotels GROUP BY type;
    `;
    console.table(types);
  } catch (e) {
    console.error('   ERROR:', e.message);
  }

  // ── 9. Rooms availability check (rooms filter in HOTEL_WITH_ROOMS_INCLUDE) ──
  console.log('\n[9] Raw SQL: Count of available rooms per hotel');
  try {
    const rooms = await prisma.$queryRaw`
      SELECT h.slug, COUNT(r.id)::int AS available_rooms
      FROM hotels h
      LEFT JOIN rooms r ON r."hotelId" = h.id AND r."isAvailable" = true
      GROUP BY h.slug
      ORDER BY h.slug;
    `;
    console.table(rooms);
  } catch (e) {
    console.error('   ERROR:', e.message);
  }

  // ── 10. Check if .next cache may be serving stale data ───────────────────
  console.log('\n[10] Next.js cache: Checking for export/rendering directives in hotels page');
  console.log('   (Manual check required — see hotels/page.tsx for export const dynamic)');
  console.log('   Tip: Run `Remove-Item -Recurse -Force .next` and restart dev server to bust cache');

  console.log('\n============================================================');
  console.log('   DIAGNOSIS COMPLETE');
  console.log('============================================================\n');
}

main()
  .catch((e) => {
    console.error('\n[FATAL] Diagnostic script crashed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
