import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['query'] });

async function check() {
  const count = await prisma.hotel.count();
  console.log("Total Hotels:", count);
  
  const getHotels = await prisma.hotel.findMany({
    where: { isActive: true, type: 'LOCAL' },
    include: {
      city: true,
      images: true,
      amenities: { include: { amenity: true } }
    }
  });

  console.log("Active Local Hotels:", getHotels.length);
  if (getHotels.length > 0) {
    console.log("Sample Hotel:", getHotels[0].id, getHotels[0].nameEn, "City:", getHotels[0].city?.nameEn);
  } else {
    // Let's see if ANY hotel exists at all
    const all = await prisma.hotel.findMany();
    console.log("ALL HOTELS RAW:", all.map(h => ({id: h.id, type: h.type, isActive: h.isActive})));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
