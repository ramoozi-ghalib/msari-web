import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Correct model names (PascalCase in Prisma client)
  const amenities = await prisma.amenity.findMany({ take: 5 });
  console.log('\n📋 Amenities in DB:', amenities.length);

  const hotelImages = await prisma.hotelImage.findMany({ take: 10 });
  console.log('\n🖼️  Hotel images count:', hotelImages.length);
  if (hotelImages.length > 0) {
    console.log('Sample URLs:');
    hotelImages.slice(0, 5).forEach(i => console.log(' -', i.url));
  }

  const roomImages = await prisma.roomImage.findMany({ take: 5 });
  console.log('\n🛏️  Room images count:', roomImages.length);

  const hotelAmenities = await prisma.hotelAmenity.findMany({
    take: 5,
    include: { amenity: true },
  });
  console.log('\n🔗 Hotel-Amenity links:', hotelAmenities.length);

  // Hotel with images
  const hotel = await prisma.hotel.findFirst({
    include: {
      images: { take: 3 },
      amenities: { include: { amenity: true }, take: 3 },
    },
  });
  console.log('\n🏨 Sample hotel:', hotel?.nameAr);
  console.log('   images:', hotel?.images?.length, '| amenities:', hotel?.amenities?.length);
  if (hotel?.images?.length) {
    hotel.images.forEach(img => console.log('   img URL:', img.url));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
