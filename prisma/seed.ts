/**
 * prisma/seed.ts — Seed شامل لقاعدة بيانات Msari
 *
 * يُنشئ:
 *  1. SUPER_ADMIN user
 *  2. المرافق (Amenities)
 *  3. المدن اليمنية الرئيسية
 *  4. فنادق واقعية بصور وغرف
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, UserRole, HotelType, AmenityCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

// ─── المرافق ──────────────────────────────────────────────────────────────────
const AMENITIES = [
  { nameAr: 'واي فاي مجاني',  nameEn: 'Free WiFi',        icon: 'wifi',           category: AmenityCategory.general },
  { nameAr: 'موقف سيارات',    nameEn: 'Parking',           icon: 'car',            category: AmenityCategory.general },
  { nameAr: 'مطعم',           nameEn: 'Restaurant',        icon: 'utensils',       category: AmenityCategory.dining  },
  { nameAr: 'مسبح',           nameEn: 'Swimming Pool',     icon: 'waves',          category: AmenityCategory.sport   },
  { nameAr: 'صالة رياضية',   nameEn: 'Gym',               icon: 'dumbbell',       category: AmenityCategory.sport   },
  { nameAr: 'تكييف هواء',    nameEn: 'Air Conditioning',  icon: 'wind',           category: AmenityCategory.room    },
  { nameAr: 'خدمة الغرف',    nameEn: 'Room Service',      icon: 'concierge-bell', category: AmenityCategory.service },
  { nameAr: 'استقبال 24/7',  nameEn: '24/7 Reception',    icon: 'clock',          category: AmenityCategory.general },
  { nameAr: 'مركز أعمال',    nameEn: 'Business Center',   icon: 'briefcase',      category: AmenityCategory.business},
  { nameAr: 'سبا',            nameEn: 'Spa',               icon: 'sparkles',       category: AmenityCategory.wellness},
  { nameAr: 'إفطار مجاني',   nameEn: 'Free Breakfast',    icon: 'coffee',         category: AmenityCategory.dining  },
  { nameAr: 'خزنة أمان',     nameEn: 'Safe Box',          icon: 'lock',           category: AmenityCategory.room    },
  { nameAr: 'تلفزيون',       nameEn: 'TV',                icon: 'tv',             category: AmenityCategory.room    },
  { nameAr: 'خدمة نقل المطار', nameEn: 'Airport Transfer', icon: 'plane',         category: AmenityCategory.service },
];

// ─── المدن ────────────────────────────────────────────────────────────────────
const CITIES = [
  {
    nameAr: 'صنعاء', nameEn: "Sana'a", governorateAr: 'أمانة العاصمة', governorateEn: "Sana'a Capital",
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nameAr: 'عدن', nameEn: 'Aden', governorateAr: 'عدن', governorateEn: 'Aden',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nameAr: 'حضرموت', nameEn: 'Hadhramaut', governorateAr: 'حضرموت', governorateEn: 'Hadhramaut',
    imageUrl: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nameAr: 'المكلا', nameEn: "Al-Mukalla", governorateAr: 'حضرموت', governorateEn: 'Hadhramaut',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nameAr: 'تعز', nameEn: "Ta'iz", governorateAr: 'تعز', governorateEn: "Ta'iz",
    imageUrl: 'https://images.unsplash.com/photo-1583418855835-06e8b6f39ecf?q=80&w=1200&auto=format&fit=crop',
  },
  {
    nameAr: 'الحديدة', nameEn: 'Hudaydah', governorateAr: 'الحديدة', governorateEn: 'Hudaydah',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
  },
];

// ─── الفنادق ──────────────────────────────────────────────────────────────────
function buildHotels(cityMap: Record<string, string>, amenityMap: Record<string, string>) {
  const wifi    = amenityMap['واي فاي مجاني'];
  const parking = amenityMap['موقف سيارات'];
  const rest    = amenityMap['مطعم'];
  const pool    = amenityMap['مسبح'];
  const gym     = amenityMap['صالة رياضية'];
  const ac      = amenityMap['تكييف هواء'];
  const room    = amenityMap['خدمة الغرف'];
  const recep   = amenityMap['استقبال 24/7'];
  const biz     = amenityMap['مركز أعمال'];
  const brkfst  = amenityMap['إفطار مجاني'];
  const tv      = amenityMap['تلفزيون'];
  const transfer = amenityMap['خدمة نقل المطار'];

  return [
    // ─── صنعاء ───
    {
      nameAr: 'فندق موفنبيك صنعاء', nameEn: "Movenpick Hotel Sana'a",
      slug: 'movenpick-hotel-sanaa',
      descriptionAr: 'يقع فندق موفنبيك في قلب العاصمة صنعاء ويوفر إقامة فاخرة مع إطلالات رائعة على المدينة القديمة. يتميز الفندق بمرافق عالمية المستوى وخدمات متميزة.',
      descriptionEn: "Movenpick Hotel Sana'a is situated in the heart of the Yemeni capital, offering luxurious accommodation with stunning views of the old city.",
      address: 'شارع الستين، صنعاء', stars: 5, rating: 4.8, reviewCount: 124,
      priceFrom: 120, currency: 'USD', isFeatured: true, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['صنعاء'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, pool, gym, ac, room, recep, biz, transfer],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1631049035182-249067d7618e?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة ستاندرد', nameEn: 'Standard Room', descriptionAr: 'غرفة مريحة مع إطلالة على الحديقة', capacity: 2, pricePerNight: 120, isAvailable: true, amenityIds: [wifi, ac, tv] },
        { nameAr: 'غرفة ديلوكس', nameEn: 'Deluxe Room', descriptionAr: 'غرفة فاخرة مع إطلالة على المدينة', capacity: 2, pricePerNight: 160, isAvailable: true, amenityIds: [wifi, ac, tv, room] },
        { nameAr: 'جناح تنفيذي', nameEn: 'Executive Suite', descriptionAr: 'جناح واسع مع صالة جلوس منفصلة', capacity: 4, pricePerNight: 280, isAvailable: true, amenityIds: [wifi, ac, tv, room, biz] },
      ],
    },
    {
      nameAr: 'فندق هيلتون صنعاء', nameEn: "Hilton Sana'a",
      slug: 'hilton-sanaa',
      descriptionAr: 'فندق هيلتون صنعاء وجهة مثالية للمسافرين من رجال الأعمال والسياح، يقدم مزيجاً من الأجواء العربية الأصيلة مع الراحة العصرية.',
      descriptionEn: "Hilton Sana'a is the perfect destination for business and leisure travelers, offering a blend of authentic Arabic atmosphere with modern comfort.",
      address: 'حي السبعين، صنعاء', stars: 5, rating: 4.6, reviewCount: 89,
      priceFrom: 95, currency: 'USD', isFeatured: true, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['صنعاء'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, pool, ac, room, recep, brkfst],
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة سوبيريور', nameEn: 'Superior Room', descriptionAr: 'غرفة أنيقة مع مرافق حديثة', capacity: 2, pricePerNight: 95, isAvailable: true, amenityIds: [wifi, ac, tv] },
        { nameAr: 'غرفة كينج ديلوكس', nameEn: 'King Deluxe', descriptionAr: 'غرفة فاخرة مع سرير كينج', capacity: 2, pricePerNight: 140, isAvailable: true, amenityIds: [wifi, ac, tv, room] },
      ],
    },
    {
      nameAr: 'شيراتون صنعاء', nameEn: "Sheraton Sana'a Resort",
      slug: 'sheraton-sanaa-resort',
      descriptionAr: 'يتميز شيراتون صنعاء بموقعه الاستراتيجي وتصميمه المعماري الفريد الذي يجمع بين الطراز اليمني التقليدي والحداثة.',
      descriptionEn: "Sheraton Sana'a Resort features a strategic location and unique architectural design that combines traditional Yemeni style with modernity.",
      address: 'حي سنحان، صنعاء', stars: 4, rating: 4.3, reviewCount: 67,
      priceFrom: 75, currency: 'USD', isFeatured: false, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['صنعاء'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe49c?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, ac, room, recep],
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe49c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة كلاسيك', nameEn: 'Classic Room', descriptionAr: 'غرفة بتصميم يمني تقليدي', capacity: 2, pricePerNight: 75, isAvailable: true, amenityIds: [wifi, ac, tv] },
        { nameAr: 'غرفة برميوم', nameEn: 'Premium Room', descriptionAr: 'غرفة فاخرة مطلة على المسبح', capacity: 3, pricePerNight: 110, isAvailable: true, amenityIds: [wifi, ac, tv, room] },
      ],
    },
    // ─── عدن ───
    {
      nameAr: 'فندق قمر عدن', nameEn: "Qamar Aden Hotel",
      slug: 'qamar-aden-hotel',
      descriptionAr: 'فندق قمر عدن المطل على خليج عدن الساحر، يوفر إقامة لا تُنسى مع إطلالات بانورامية على البحر العربي وأجواء استوائية خلابة.',
      descriptionEn: 'Qamar Aden Hotel overlooking the charming Aden Bay, offers an unforgettable stay with panoramic views of the Arabian Sea.',
      address: 'كريتر، عدن', stars: 4, rating: 4.5, reviewCount: 98,
      priceFrom: 80, currency: 'USD', isFeatured: true, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['عدن'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, pool, ac, room, recep, brkfst, transfer],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة إطلالة بحرية', nameEn: 'Sea View Room', descriptionAr: 'غرفة رائعة مع إطلالة مباشرة على البحر', capacity: 2, pricePerNight: 80, isAvailable: true, amenityIds: [wifi, ac, tv] },
        { nameAr: 'جناح بينتهاوس', nameEn: 'Penthouse Suite', descriptionAr: 'جناح فاخر في الطابق الأخير مع تراس خاص', capacity: 4, pricePerNight: 200, isAvailable: true, amenityIds: [wifi, ac, tv, room] },
      ],
    },
    {
      nameAr: 'فندق سيف عدن', nameEn: 'Saif Aden Hotel',
      slug: 'saif-aden-hotel',
      descriptionAr: 'يقع فندق سيف عدن في منطقة المعلا الحيوية، ويتميز بأسعاره التنافسية وخدماته الراقية التي تجعله الخيار الأمثل للمسافرين.',
      descriptionEn: 'Located in the vibrant Al-Mualla area, Saif Aden Hotel stands out for its competitive prices and premium services.',
      address: 'المعلا، عدن', stars: 3, rating: 4.1, reviewCount: 45,
      priceFrom: 45, currency: 'USD', isFeatured: false, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['عدن'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, ac, recep, brkfst],
      images: [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة مفردة', nameEn: 'Single Room', descriptionAr: 'غرفة اقتصادية مريحة', capacity: 1, pricePerNight: 45, isAvailable: true, amenityIds: [wifi, ac, tv] },
        { nameAr: 'غرفة مزدوجة', nameEn: 'Double Room', descriptionAr: 'غرفة مزدوجة لشخصين', capacity: 2, pricePerNight: 65, isAvailable: true, amenityIds: [wifi, ac, tv] },
      ],
    },
    // ─── المكلا ───
    {
      nameAr: 'فندق سيفان المكلا', nameEn: 'Seyun Al-Mukalla Hotel',
      slug: 'seyun-almukalla-hotel',
      descriptionAr: 'فندق سيفان المطل على خليج المكلا، أفضل وجهة للاستمتاع بالطبيعة الساحلية الخلابة وأجواء حضرموت الأصيلة.',
      descriptionEn: 'Seyun Hotel overlooking Al-Mukalla Bay, the best destination to enjoy the stunning coastal nature and authentic Hadhramaut atmosphere.',
      address: 'شاطئ المكلا، حضرموت', stars: 4, rating: 4.4, reviewCount: 62,
      priceFrom: 70, currency: 'USD', isFeatured: true, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['المكلا'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, pool, ac, room, recep],
      images: [
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة إطلالة خليج', nameEn: 'Bay View Room', descriptionAr: 'غرفة مع إطلالة رائعة على الخليج', capacity: 2, pricePerNight: 70, isAvailable: true, amenityIds: [wifi, ac, tv] },
        { nameAr: 'غرفة فاميلي', nameEn: 'Family Room', descriptionAr: 'غرفة مناسبة للعائلات مع سريرين', capacity: 4, pricePerNight: 110, isAvailable: true, amenityIds: [wifi, ac, tv, room] },
      ],
    },
    // ─── تعز ───
    {
      nameAr: 'فندق إيسترن تعز', nameEn: 'Eastern Ta\'iz Hotel',
      slug: 'eastern-taiz-hotel',
      descriptionAr: 'فندق إيسترن في قلب مدينة تعز الجبلية الخلابة، يوفر أجواءً هادئة ومريحة مع خدمات متكاملة تناسب المسافر اليمني والعربي.',
      descriptionEn: "Eastern Hotel in the heart of the mountainous city of Ta'iz, provides a calm and comfortable atmosphere with comprehensive services.",
      address: 'وسط المدينة، تعز', stars: 3, rating: 4.0, reviewCount: 38,
      priceFrom: 40, currency: 'USD', isFeatured: false, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['تعز'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, ac, recep],
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة ستاندرد', nameEn: 'Standard Room', descriptionAr: 'غرفة مريحة بإطلالة جبلية', capacity: 2, pricePerNight: 40, isAvailable: true, amenityIds: [wifi, ac] },
        { nameAr: 'غرفة ديلوكس', nameEn: 'Deluxe Room', descriptionAr: 'غرفة فاخرة بمرافق كاملة', capacity: 2, pricePerNight: 60, isAvailable: true, amenityIds: [wifi, ac, tv] },
      ],
    },
    // ─── الحديدة ───
    {
      nameAr: 'فندق الحديدة سيشور', nameEn: 'Al-Hudaydah Seashore Hotel',
      slug: 'hudaydah-seashore-hotel',
      descriptionAr: 'فندق الحديدة سيشور الرائد يطل على البحر الأحمر مباشرة، يوفر تجربة بحرية فريدة مع أجواء مدينة الحديدة الدافئة.',
      descriptionEn: 'Al-Hudaydah Seashore Hotel directly overlooks the Red Sea, offering a unique maritime experience with the warm atmosphere of Hudaydah.',
      address: 'كورنيش الحديدة، الحديدة', stars: 3, rating: 4.2, reviewCount: 54,
      priceFrom: 50, currency: 'USD', isFeatured: false, isActive: true,
      type: HotelType.LOCAL, cityId: cityMap['الحديدة'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=800&auto=format&fit=crop',
      amenityIds: [wifi, parking, rest, ac, recep, brkfst],
      images: [
        'https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=1200&auto=format&fit=crop',
      ],
      rooms: [
        { nameAr: 'غرفة بحرية', nameEn: 'Sea Room', descriptionAr: 'غرفة مطلة على البحر الأحمر', capacity: 2, pricePerNight: 50, isAvailable: true, amenityIds: [wifi, ac, tv] },
        { nameAr: 'جناح عائلي', nameEn: 'Family Suite', descriptionAr: 'جناح مناسب للعائلات', capacity: 5, pricePerNight: 95, isAvailable: true, amenityIds: [wifi, ac, tv, room] },
      ],
    },
  ];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 بدء عملية إنشاء البيانات الأولية...\n');

  // 1. Admin User
  const email    = process.env.ADMIN_EMAIL    ?? 'admin@msari.net';
  const password = process.env.ADMIN_PASSWORD ?? 'msari@admin2024';
  const hash     = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    update: { role: UserRole.SUPER_ADMIN, isActive: true },
    create: { email, name: 'مدير النظام', passwordHash: hash, role: UserRole.SUPER_ADMIN, isActive: true },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // 2. Amenities
  await prisma.amenity.deleteMany({});
  const createdAmenities = await prisma.amenity.createMany({ data: AMENITIES });
  const allAmenities   = await prisma.amenity.findMany();
  const amenityMap: Record<string, string> = {};
  for (const a of allAmenities) amenityMap[a.nameAr] = a.id;
  console.log(`✅ المرافق: ${createdAmenities.count} مرفق`);

  // 3. Cities
  await prisma.city.deleteMany({});
  await prisma.city.createMany({ data: CITIES.map(c => ({ ...c, isActive: true })) });
  const allCities = await prisma.city.findMany();
  const cityMap: Record<string, string> = {};
  for (const c of allCities) cityMap[c.nameAr] = c.id;
  console.log(`✅ المدن: ${allCities.length} مدينة`);

  // 4. Hotels
  const hotels = buildHotels(cityMap, amenityMap);
  let hotelCount = 0;

  for (const h of hotels) {
    const { amenityIds, images, rooms, ...hotelData } = h;

    // حذف الفندق إذا كان موجوداً مسبقاً (للتشغيل المتكرر)
    await prisma.hotel.deleteMany({ where: { slug: hotelData.slug } });
    const hotel = await prisma.hotel.create({ data: hotelData });

    // Images
    for (let i = 0; i < images.length; i++) {
      await prisma.hotelImage.create({ data: { hotelId: hotel.id, url: images[i], order: i } });
    }

    // Amenities
    for (const amenityId of amenityIds.filter(Boolean)) {
      await prisma.hotelAmenity.create({ data: { hotelId: hotel.id, amenityId } });
    }

    // Rooms
    for (const room of rooms) {
      const { amenityIds: roomAmenityIds, ...roomData } = room;
      const dbRoom = await prisma.room.create({ data: { ...roomData, hotelId: hotel.id } });

      for (const amenityId of roomAmenityIds.filter(Boolean)) {
        await prisma.roomAmenity.create({ data: { roomId: dbRoom.id, amenityId } });
      }
    }

    hotelCount++;
    console.log(`  ✅ ${hotelData.nameAr}`);
  }

  // 5. Sample Offer
  await prisma.offer.deleteMany({ where: { id: 'offer-seed-1' } });
  await prisma.offer.create({
    data: {
      id:       'offer-seed-1',
      titleAr:  'عروض الصيف — وفّر حتى 30%',
      titleEn:  'Summer Deals — Save up to 30%',
      imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop',
      link:     '/hotels',
      isActive: true,
      order:    1,
    },
  });

  console.log(`\n🎉 اكتمل! ${hotelCount} فندق، ${allCities.length} مدينة، ${allAmenities.length} مرفق`);
  console.log('   شغّل npm run dev وافتح http://localhost:3000/hotels');

}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ خطأ في الـ seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
