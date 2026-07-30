/**
 * debug-rooms.mjs — فحص ربط الغرف بالفنادق
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 فحص ربط الغرف بالفنادق...\n');

  // الفندق المشكل: منتجع-وشاليهات-المارينا-24951
  const testSlugs = [
    'منتجع-وشاليهات-المارينا-24951',
    'فندق-ستار-وود-25233',
  ];

  for (const slug of testSlugs) {
    console.log(`\n═══ ${slug} ═══`);
    
    const hotel = await prisma.hotel.findUnique({
      where: { slug },
      include: {
        rooms: {
          select: { id: true, nameAr: true, isAvailable: true, pricePerNight: true },
        },
      },
    });

    if (!hotel) {
      // Try with lowercase
      const hotelLower = await prisma.hotel.findUnique({
        where: { slug: slug.toLowerCase() },
        include: { rooms: { select: { id: true, nameAr: true } } },
      });
      
      if (hotelLower) {
        console.log(`  ⚠️  وُجد بـ toLowerCase() فقط!`);
        console.log(`  📎 Slug in DB: "${hotelLower.slug}"`);
      } else {
        // Search by wpId
        const wpId = parseInt(slug.match(/(\d+)$/)?.[1] || '0');
        const byWpId = await prisma.hotel.findFirst({
          where: { wpId },
          select: { slug: true, nameAr: true },
        });
        if (byWpId) {
          console.log(`  ⚠️  Slug mismatch!`);
          console.log(`  📎 Expected: "${slug}"`);
          console.log(`  📎 Actual:   "${byWpId.slug}"`);
          console.log(`  📎 Hotel:    "${byWpId.nameAr}"`);
        } else {
          console.log(`  ❌ NOT FOUND at all`);
        }
      }
      continue;
    }

    console.log(`  ✅ Hotel: ${hotel.nameAr} (ID: ${hotel.id})`);
    console.log(`  📎 Slug stored: "${hotel.slug}"`);
    console.log(`  🛏  Rooms: ${hotel.rooms.length}`);
    for (const r of hotel.rooms) {
      console.log(`    ${r.isAvailable ? '✅' : '❌'} ${r.id} — ${r.nameAr} — $${r.pricePerNight}`);
    }
  }

  // Also check if any hotels have 0 rooms
  const hotelsNoRooms = await prisma.hotel.findMany({
    where: { rooms: { none: {} } },
    select: { slug: true, nameAr: true, wpId: true },
  });
  console.log(`\n🏨 فنادق بدون غرف: ${hotelsNoRooms.length}`);
  for (const h of hotelsNoRooms) {
    console.log(`  ⬜ [${h.wpId}] ${h.nameAr}`);
  }

  // List all hotel slugs to spot encoding issues
  console.log('\n📋 كل Slugs المخزنة:');
  const allHotels = await prisma.hotel.findMany({
    select: { slug: true },
    orderBy: { slug: 'asc' },
  });
  for (const h of allHotels) {
    const hasEncoded = h.slug !== decodeURIComponent(h.slug);
    console.log(`  ${hasEncoded ? '⚠️' : '✅'} ${h.slug}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌', e.message);
  await prisma.$disconnect();
});
