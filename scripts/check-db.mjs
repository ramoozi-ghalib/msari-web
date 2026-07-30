/**
 * check-db.mjs — فحص حالة قاعدة البيانات قبل الهجرة
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 فحص قاعدة البيانات...\n');

  const [
    cityCount,
    amenityCount,
    hotelCount,
    roomCount,
    hotelImgCount,
    roomImgCount,
    userCount,
    bookingCount,
    reviewCount,
  ] = await Promise.all([
    prisma.city.count(),
    prisma.amenity.count(),
    prisma.hotel.count(),
    prisma.room.count(),
    prisma.hotelImage.count(),
    prisma.roomImage.count(),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.review.count(),
  ]);

  console.log('📊 عدد السجلات في كل جدول:');
  console.log('═══════════════════════════════');
  console.log(`  🏙  cities        : ${cityCount}`);
  console.log(`  🛎  amenities     : ${amenityCount}`);
  console.log(`  🏨  hotels        : ${hotelCount}`);
  console.log(`  🛏  rooms         : ${roomCount}`);
  console.log(`  🖼  hotel_images  : ${hotelImgCount}`);
  console.log(`  🖼  room_images   : ${roomImgCount}`);
  console.log(`  👤  users         : ${userCount}`);
  console.log(`  📋  bookings      : ${bookingCount}`);
  console.log(`  ⭐  reviews       : ${reviewCount}`);
  console.log('═══════════════════════════════');

  // فحص الفنادق الموجودة إن كانت هناك بيانات
  if (hotelCount > 0) {
    const hotels = await prisma.hotel.findMany({
      select: { id: true, nameAr: true, wpId: true, cityId: true, stars: true, priceFrom: true },
      take: 5,
    });
    console.log('\n🏨 أول 5 فنادق موجودة:');
    for (const h of hotels) {
      console.log(`  [${h.wpId ?? 'no-wpId'}] ${h.nameAr} — ${h.stars}⭐ — $${h.priceFrom}`);
    }
  }

  // فحص المدن الموجودة
  if (cityCount > 0) {
    const cities = await prisma.city.findMany({
      select: { nameAr: true, isActive: true },
    });
    console.log('\n🏙  المدن الموجودة:');
    for (const c of cities) {
      console.log(`  ${c.isActive ? '✅' : '⬜'} ${c.nameAr}`);
    }
  }

  // فحص wpId الفنادق (لتجنب التكرار)
  const hotelsWithWpId = await prisma.hotel.count({ where: { wpId: { not: null } } });
  console.log(`\n🔗 فنادق مع wpId: ${hotelsWithWpId}/${hotelCount}`);

  // تحقق من الاتصال
  console.log('\n✅ الاتصال بقاعدة البيانات يعمل بشكل صحيح');

  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('❌ خطأ:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
