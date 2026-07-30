/**
 * clean-db.ts — تنظيف البيانات التجريبية قبل الهجرة
 * ─────────────────────────────────────────────────────
 * يحذف: hotels, rooms, images, bookings, cities, amenities
 * يُبقي: users (لحماية المستخدم admin)
 *
 * Usage: npx tsx scripts/clean-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 تنظيف قاعدة البيانات من البيانات التجريبية...\n');

  // ── فحص أولي ──────────────────────────────────────────────────
  const [hotelCount, cityCount, bookingCount, userCount] = await Promise.all([
    prisma.hotel.count(),
    prisma.city.count(),
    prisma.booking.count(),
    prisma.user.count(),
  ]);

  console.log('📊 الوضع الحالي:');
  console.log(`  🏨 Hotels:   ${hotelCount}`);
  console.log(`  🏙  Cities:   ${cityCount}`);
  console.log(`  📋 Bookings: ${bookingCount}`);
  console.log(`  👤 Users:    ${userCount} (لن يُحذف)`);
  console.log('');

  if (hotelCount === 0 && cityCount === 0) {
    console.log('✅ قاعدة البيانات فارغة مسبقاً — لا حاجة للتنظيف.');
    await prisma.$disconnect();
    return;
  }

  // ── الحذف بالترتيب الصحيح (cascade تلقائي لكن نتأكد) ──────────
  console.log('🗑️  جاري الحذف...');

  // 1. Bookings (تعتمد على hotels/rooms)
  const delBookings = await prisma.booking.deleteMany({});
  console.log(`  ✅ Bookings:    حُذف ${delBookings.count}`);

  // 2. Reviews
  const delReviews = await prisma.review.deleteMany({});
  console.log(`  ✅ Reviews:     حُذف ${delReviews.count}`);

  // 3. Favorites
  const delFavs = await prisma.favorite.deleteMany({});
  console.log(`  ✅ Favorites:   حُذف ${delFavs.count}`);

  // 4. Room Images
  const delRoomImgs = await prisma.roomImage.deleteMany({});
  console.log(`  ✅ RoomImages:  حُذف ${delRoomImgs.count}`);

  // 5. Room Amenities
  const delRoomAmen = await prisma.roomAmenity.deleteMany({});
  console.log(`  ✅ RoomAmenity: حُذف ${delRoomAmen.count}`);

  // 6. Rooms
  const delRooms = await prisma.room.deleteMany({});
  console.log(`  ✅ Rooms:       حُذف ${delRooms.count}`);

  // 7. Hotel Images
  const delHotelImgs = await prisma.hotelImage.deleteMany({});
  console.log(`  ✅ HotelImages: حُذف ${delHotelImgs.count}`);

  // 8. Hotel Amenities
  const delHotelAmen = await prisma.hotelAmenity.deleteMany({});
  console.log(`  ✅ HotelAmenity: حُذف ${delHotelAmen.count}`);

  // 9. Discounts
  const delDiscounts = await prisma.discount.deleteMany({});
  console.log(`  ✅ Discounts:   حُذف ${delDiscounts.count}`);

  // 10. Hotels
  const delHotels = await prisma.hotel.deleteMany({});
  console.log(`  ✅ Hotels:      حُذف ${delHotels.count}`);

  // 11. Cities
  const delCities = await prisma.city.deleteMany({});
  console.log(`  ✅ Cities:      حُذف ${delCities.count}`);

  // 12. Amenities
  const delAmenities = await prisma.amenity.deleteMany({});
  console.log(`  ✅ Amenities:   حُذف ${delAmenities.count}`);

  // ── تحقق نهائي ────────────────────────────────────────────────
  const usersAfter = await prisma.user.count();
  console.log(`\n  👤 Users:  ${usersAfter} (محفوظ)`);

  console.log('\n══════════════════════════════════════════════');
  console.log('✅ قاعدة البيانات جاهزة للهجرة النظيفة!');
  console.log('📌 الخطوة التالية: node scripts/upload-images.mjs');

  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('❌ خطأ:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
