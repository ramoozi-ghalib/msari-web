// Script to debug hotel slugs stored in the database
// Run with: npx tsx scripts/check-slugs.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hotels = await prisma.hotel.findMany({
    select: {
      id: true,
      slug: true,
      nameAr: true,
    },
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  console.log('\n📋 Hotel slugs in DB:\n');
  for (const h of hotels) {
    console.log(`Name: ${h.nameAr}`);
    console.log(`Slug: "${h.slug}"`);
    console.log(`Slug (hex): ${Buffer.from(h.slug).toString('hex').slice(0, 60)}...`);
    console.log('---');
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
