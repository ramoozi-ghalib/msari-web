import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Step 1: Raw SQL count
  const countResult = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM hotels;`;
  console.log('\n=== RAW SQL COUNT ===');
  console.log(JSON.stringify(countResult, null, 2));

  // Step 2: prisma.hotel.findMany() — no filters
  const all = await prisma.hotel.findMany({
    select: { id: true, slug: true, isActive: true, type: true, cityId: true }
  });
  console.log('\n=== prisma.hotel.findMany() — NO FILTER ===');
  console.log(`Total returned: ${all.length}`);
  console.log(JSON.stringify(all, null, 2));

  // Step 3: with isActive + type filter (production query)
  const filtered = await prisma.hotel.findMany({
    where: { isActive: true, type: 'LOCAL' },
    select: { id: true, slug: true, isActive: true, type: true }
  });
  console.log('\n=== prisma.hotel.findMany({ where: { isActive: true, type: LOCAL } }) ===');
  console.log(`Total returned: ${filtered.length}`);
  console.log(JSON.stringify(filtered, null, 2));
}

main()
  .catch(e => { console.error('\n=== PRISMA ERROR ===\n', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
