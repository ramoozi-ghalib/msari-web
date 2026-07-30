import { PrismaClient } from '@prisma/client';

/**
 * Seed minimal test data for booking flow.
 * Creates a city, a hotel (slug: "test-hotel"), a room, and an optional discount.
 * After seeding, logs the IDs and a test booking URL.
 */
async function main() {
  // Use DATABASE_URL (pooler) for connection; DIRECT_URL may point to a non‑reachable host in this environment.
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  // 1. Create a test city (if not exists)
  const cityNameAr = 'مدينة الاختبار';
  const cityNameEn = 'Test City';
  // `nameAr` is not a unique field, so we use `findFirst` to locate an existing city.
  let city = await prisma.city.findFirst({ where: { nameAr: cityNameAr } });
  if (!city) {
    city = await prisma.city.create({
      data: {
        nameAr: cityNameAr,
        nameEn: cityNameEn,
        governorateAr: 'محافظة الاختبار',
        governorateEn: 'Test Governorate',
        isActive: true,
      },
    });
    console.log('✅ Created test city');
  } else {
    console.log('✅ Test city already exists');
  }

  // 2. Create test hotel (if not exists)
  const hotelSlug = 'test-hotel';
  let hotel = await prisma.hotel.findUnique({ where: { slug: hotelSlug } });
  if (!hotel) {
    hotel = await prisma.hotel.create({
      data: {
        slug: hotelSlug,
        type: 'LOCAL', // enum HotelType
        nameAr: 'فندق الاختبار',
        nameEn: 'Test Hotel',
        descriptionAr: 'فندق اختبار بسيط لتجربة الحجز.',
        descriptionEn: 'Simple test hotel for booking flow.',
        address: 'شارع الاختبار 1',
        stars: 3,
        rating: 4.0,
        reviewCount: 0,
        priceFrom: 100,
        currency: 'USD',
        isFeatured: false,
        isActive: true,
        cityId: city.id,
      },
    });
    console.log('✅ Created test hotel');
  } else {
    console.log('✅ Test hotel already exists');
  }

  // 3. Create test room (if not exists)
  const roomNameEn = 'Standard Room';
  let room = await prisma.room.findFirst({
    where: { hotelId: hotel.id, nameEn: roomNameEn },
  });
  if (!room) {
    room = await prisma.room.create({
      data: {
        nameAr: 'غرفة قياسية',
        nameEn: roomNameEn,
        descriptionAr: 'غرفة قياسية للاختبار.',
        descriptionEn: 'Standard test room.',
        capacity: 2,
        pricePerNight: 100,
        isAvailable: true,
        hotelId: hotel.id,
      },
    });
    console.log('✅ Created test room');
  } else {
    console.log('✅ Test room already exists');
  }

  // 4. Optional discount (10% for 30 days)
  const now = new Date();
  const discount = await prisma.discount.findUnique({ where: { hotelId: hotel.id } });
  if (!discount) {
    await prisma.discount.create({
      data: {
        percentage: 10,
        validFrom: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
        validTo: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
        hotelId: hotel.id,
      },
    });
    console.log('✅ Created 10% discount for test hotel');
  } else {
    console.log('✅ Discount already exists for test hotel');
  }

  // 5. Output IDs and test booking URL
  const checkIn = new Date();
  const checkOut = new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 nights
  const format = (d: Date) => d.toISOString().split('T')[0];
  const url = `http://localhost:3000/ar/booking?city=${encodeURIComponent(cityNameEn)}&hotel=${hotel.slug}&hotelId=${hotel.id}&room=${room.id}&checkIn=${format(checkIn)}&checkOut=${format(checkOut)}&guests=2`;

  console.log('\n--- Seed completed ---');
  console.log('Hotel ID:', hotel.id);
  console.log('Room ID:', room.id);
  console.log('Test booking URL:', url);

  await prisma.$disconnect();
}

main()
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await new PrismaClient().$disconnect();
    process.exit(1);
  });
