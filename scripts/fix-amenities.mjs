/**
 * fix-amenities.mjs — إصلاح شامل للمرافق
 * 
 * 1. حذف جميع المرافق الحالية وارتباطاتها
 * 2. إنشاء المرافق الأصلية (20 خدمة فندق + 13 تجهيز غرفة)
 * 3. استخراج بيانات الأسرّة/الحمامات من WordPress وتحديث الغرف
 *
 * Run: node scripts/fix-amenities.mjs
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient({ log: ['error'] });

// ═══════════════════════════════════════════════════════════════
//  المرافق الأصلية
// ═══════════════════════════════════════════════════════════════

const HOTEL_AMENITIES = [
  { nameAr: 'بقالة',                    nameEn: 'Grocery',           icon: 'shopping-bag',   category: 'HOTEL_AMENITIES' },
  { nameAr: 'مطعم',                     nameEn: 'Restaurant',        icon: 'utensils',       category: 'HOTEL_AMENITIES' },
  { nameAr: 'كافيه',                    nameEn: 'Cafe',              icon: 'coffee',         category: 'HOTEL_AMENITIES' },
  { nameAr: 'كافتيريا',                 nameEn: 'Cafeteria',         icon: 'cup-soda',       category: 'HOTEL_AMENITIES' },
  { nameAr: 'حراسة أمنية',              nameEn: 'Security',          icon: 'shield-check',   category: 'HOTEL_AMENITIES' },
  { nameAr: 'صالون حلاقة',              nameEn: 'Barber Shop',       icon: 'scissors',       category: 'HOTEL_AMENITIES' },
  { nameAr: 'خدمة الغرف',              nameEn: 'Room Service',      icon: 'concierge-bell', category: 'HOTEL_AMENITIES' },
  { nameAr: 'مسبح',                     nameEn: 'Swimming Pool',     icon: 'waves',          category: 'HOTEL_AMENITIES' },
  { nameAr: 'خدمة النقل للمطار',        nameEn: 'Airport Transfer',  icon: 'plane',          category: 'HOTEL_AMENITIES' },
  { nameAr: 'مغسلة',                    nameEn: 'Laundry',           icon: 'shirt',          category: 'HOTEL_AMENITIES' },
  { nameAr: 'موقف سيارات',              nameEn: 'Parking',           icon: 'car',            category: 'HOTEL_AMENITIES' },
  { nameAr: 'منتزه',                    nameEn: 'Park',              icon: 'trees',          category: 'HOTEL_AMENITIES' },
  { nameAr: 'نادي صحي',                 nameEn: 'Health Club',       icon: 'dumbbell',       category: 'HOTEL_AMENITIES' },
  { nameAr: 'شيش ومعسل',                nameEn: 'Shisha Lounge',     icon: 'flame',          category: 'HOTEL_AMENITIES' },
  { nameAr: 'طيرمانات',                 nameEn: 'Tirmana Lounge',    icon: 'tent',           category: 'HOTEL_AMENITIES' },
  { nameAr: 'إنترنت',                   nameEn: 'Internet',          icon: 'wifi',           category: 'HOTEL_AMENITIES' },
  { nameAr: 'مصعد',                     nameEn: 'Elevator',          icon: 'arrow-up-down',  category: 'HOTEL_AMENITIES' },
  { nameAr: 'وسط المدينة',              nameEn: 'City Center',       icon: 'map-pin',        category: 'HOTEL_AMENITIES' },
  { nameAr: 'قريب المطار',              nameEn: 'Near Airport',      icon: 'plane-landing',  category: 'HOTEL_AMENITIES' },
  { nameAr: 'قاعات اجتماعات وتدريب',   nameEn: 'Meeting Rooms',     icon: 'presentation',   category: 'HOTEL_AMENITIES' },
];

const ROOM_FEATURES = [
  { nameAr: 'تكييف',             nameEn: 'Air Conditioning',  icon: 'wind',          category: 'ROOM_FEATURES' },
  { nameAr: 'شاشة ذكية',         nameEn: 'Smart TV',          icon: 'tv',            category: 'ROOM_FEATURES' },
  { nameAr: 'طاولة طعام',        nameEn: 'Dining Table',      icon: 'lamp-desk',     category: 'ROOM_FEATURES' },
  { nameAr: 'خزنة',              nameEn: 'Safe Box',          icon: 'lock',          category: 'ROOM_FEATURES' },
  { nameAr: 'ثلاجة',             nameEn: 'Refrigerator',      icon: 'refrigerator',  category: 'ROOM_FEATURES' },
  { nameAr: 'واي فاي',           nameEn: 'WiFi',              icon: 'wifi',          category: 'ROOM_FEATURES' },
  { nameAr: 'إطلالة على البحر',  nameEn: 'Sea View',          icon: 'ship',          category: 'ROOM_FEATURES' },
  { nameAr: 'إطلالة على المدينة', nameEn: 'City View',         icon: 'building',      category: 'ROOM_FEATURES' },
  { nameAr: 'مجفف شعر',          nameEn: 'Hair Dryer',        icon: 'wind',          category: 'ROOM_FEATURES' },
  { nameAr: 'سخان',              nameEn: 'Water Heater',      icon: 'flame',         category: 'ROOM_FEATURES' },
  { nameAr: 'جاكوزي',            nameEn: 'Jacuzzi',           icon: 'bath',          category: 'ROOM_FEATURES' },
  { nameAr: 'غلاية كهربائية',    nameEn: 'Electric Kettle',   icon: 'cup-soda',      category: 'ROOM_FEATURES' },
  { nameAr: 'ساونا',             nameEn: 'Sauna',             icon: 'thermometer',   category: 'ROOM_FEATURES' },
];

const ALL_AMENITIES = [...HOTEL_AMENITIES, ...ROOM_FEATURES];

// ═══════════════════════════════════════════════════════════════
//  Main
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('═'.repeat(60));
  console.log('  إصلاح المرافق — مساري');
  console.log('═'.repeat(60));

  // ── الحالة قبل الإصلاح ────────────────────────────────────
  const beforeCount = await prisma.amenity.count();
  const beforeHotelLinks = await prisma.hotelAmenity.count();
  const beforeRoomLinks = await prisma.roomAmenity.count();
  console.log(`\n📊 الحالة قبل الإصلاح:`);
  console.log(`   مرافق: ${beforeCount}`);
  console.log(`   ربط فنادق-مرافق: ${beforeHotelLinks}`);
  console.log(`   ربط غرف-مرافق: ${beforeRoomLinks}`);

  // ── خطوة 1: حذف كل الارتباطات والمرافق ────────────────────
  console.log('\n🗑  حذف جميع الارتباطات والمرافق...');
  
  const deletedHotelLinks = await prisma.hotelAmenity.deleteMany({});
  console.log(`   ✅ حُذف ${deletedHotelLinks.count} ربط فندق-مرفق`);

  const deletedRoomLinks = await prisma.roomAmenity.deleteMany({});
  console.log(`   ✅ حُذف ${deletedRoomLinks.count} ربط غرفة-مرفق`);

  const deletedAmenities = await prisma.amenity.deleteMany({});
  console.log(`   ✅ حُذف ${deletedAmenities.count} مرفق`);

  // ── خطوة 2: إنشاء المرافق الأصلية ─────────────────────────
  console.log(`\n✨ إنشاء ${ALL_AMENITIES.length} مرفق أصلي...`);

  for (const a of ALL_AMENITIES) {
    await prisma.amenity.create({ data: a });
  }

  const afterAmenities = await prisma.amenity.findMany({ orderBy: { category: 'asc' } });
  
  console.log(`\n   🏨 المرافق والخدمات (HOTEL_AMENITIES):`);
  for (const a of afterAmenities.filter(x => x.category === 'HOTEL_AMENITIES')) {
    console.log(`      • ${a.nameAr} — ${a.nameEn} [${a.icon}]`);
  }
  console.log(`\n   🛏  تجهيزات الغرف (ROOM_FEATURES):`);
  for (const a of afterAmenities.filter(x => x.category === 'ROOM_FEATURES')) {
    console.log(`      • ${a.nameAr} — ${a.nameEn} [${a.icon}]`);
  }

  // ── خطوة 3: استخراج بيانات الأسرّة/الحمامات من WordPress ───
  console.log('\n📦 استخراج بيانات الأسرّة والحمامات من WordPress...');
  
  const metaPath = join(__dirname, '..', 'migration-output', 'extracted', 'wp_postmeta.json');
  const roomsPath = join(__dirname, '..', 'migration-output', 'extracted', 'wp_hotel_room.json');

  if (existsSync(metaPath) && existsSync(roomsPath)) {
    const wpMeta = JSON.parse(readFileSync(metaPath, 'utf8'));
    const wpRooms = JSON.parse(readFileSync(roomsPath, 'utf8'));

    // Build meta lookup: postId → { key: value }
    const metaByPost = {};
    for (const m of wpMeta) {
      if (!metaByPost[m.post_id]) metaByPost[m.post_id] = {};
      metaByPost[m.post_id][m.meta_key] = m.meta_value;
    }

    // Get all DB rooms with wpId (via hotel)
    const dbRooms = await prisma.$queryRaw`
      SELECT r.id, r."nameAr", r."hotelId", h."wpId" as "hotelWpId"
      FROM rooms r
      JOIN hotels h ON r."hotelId" = h.id
      WHERE h."wpId" IS NOT NULL
    `;

    // Build wpRoomId → dbRoomId mapping via room order within hotel
    // wpRooms have post_id and room_parent (hotel wpId)
    const wpRoomsByHotel = {};
    for (const wr of wpRooms) {
      const parentId = wr.room_parent || (metaByPost[wr.post_id]?.room_parent);
      if (parentId) {
        if (!wpRoomsByHotel[parentId]) wpRoomsByHotel[parentId] = [];
        wpRoomsByHotel[parentId].push(wr.post_id);
      }
    }

    // Group DB rooms by hotel wpId
    const dbRoomsByHotel = {};
    for (const r of dbRooms) {
      if (!dbRoomsByHotel[r.hotelWpId]) dbRoomsByHotel[r.hotelWpId] = [];
      dbRoomsByHotel[r.hotelWpId].push(r);
    }

    let updated = 0;
    for (const [hotelWpId, wpRoomIds] of Object.entries(wpRoomsByHotel)) {
      const dbHotelRooms = dbRoomsByHotel[hotelWpId];
      if (!dbHotelRooms) continue;

      for (let i = 0; i < wpRoomIds.length && i < dbHotelRooms.length; i++) {
        const wpId = wpRoomIds[i];
        const dbRoom = dbHotelRooms[i];
        const meta = metaByPost[wpId] || {};

        const bedCount = parseInt(meta.bed_number) || 1;
        const capacity = parseInt(meta.adult_number) || 2;
        // WordPress doesn't have explicit bathroom/roomCount fields in most cases
        // We'll set defaults and user can edit from dashboard

        try {
          await prisma.room.update({
            where: { id: dbRoom.id },
            data: {
              bedCount,
              capacity,
              bedType: bedCount >= 2 ? 'فردي' : 'كبير',
              roomCount: 1,
              bathroomCount: 1,
            },
          });
          updated++;
        } catch (e) {
          // skip silently
        }
      }
    }

    console.log(`   ✅ تم تحديث ${updated} غرفة ببيانات الأسرّة`);
  } else {
    console.log('   ⚠️  ملفات WordPress غير موجودة — تخطي');
  }

  // ── التقرير النهائي ────────────────────────────────────────
  const finalCount = await prisma.amenity.count();
  const finalHotel = await prisma.amenity.count({ where: { category: 'HOTEL_AMENITIES' } });
  const finalRoom  = await prisma.amenity.count({ where: { category: 'ROOM_FEATURES' } });

  console.log('\n' + '═'.repeat(60));
  console.log('✅ الإصلاح مكتمل!');
  console.log(`   المرافق الإجمالية: ${finalCount}`);
  console.log(`   🏨 خدمات الفندق: ${finalHotel}`);
  console.log(`   🛏  تجهيزات الغرف: ${finalRoom}`);
  console.log(`   ربط فنادق-مرافق: 0 (يُربط من الداشبورد)`);
  console.log(`   ربط غرف-مرافق: 0 (يُربط من الداشبورد)`);
  console.log('═'.repeat(60));
}

main()
  .catch(e => { console.error('\n❌ خطأ:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
