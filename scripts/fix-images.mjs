/**
 * fix-images.mjs — إصلاح الصور المعطوبة (404) في قاعدة البيانات
 * Run: node scripts/fix-images.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

async function main() {
  console.log('🔧 Fixing broken image URLs...\n');

  // ─── إصلاح صور المدن ─────────────────────────────────────────────────────
  // عدن: photo-1559592413-7cec4d0cae2b → 404
  await prisma.$executeRaw`
    UPDATE cities SET "imageUrl" = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800'
    WHERE id = 'city_aden';
  `;
  console.log('✅ Fixed: city_aden image');

  // تعز: photo-1583418855835-06e8b6f39ecf → 404
  await prisma.$executeRaw`
    UPDATE cities SET "imageUrl" = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800'
    WHERE id = 'city_taiz';
  `;
  console.log('✅ Fixed: city_taiz image');

  // ─── إصلاح صور الفنادق ────────────────────────────────────────────────────
  // شيراتون: photo-1551882547-ff40c63fe49c → 404
  await prisma.$executeRaw`
    UPDATE hotels SET "thumbnailUrl" = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop'
    WHERE id = 'h_sheraton';
  `;
  console.log('✅ Fixed: h_sheraton thumbnailUrl');

  // إصلاح hotel_images للشيراتون
  await prisma.$executeRaw`
    UPDATE hotel_images SET url = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop'
    WHERE id = 'hi_6';
  `;
  console.log('✅ Fixed: hi_6 (sheraton hotel image)');

  // ─── التحقق ───────────────────────────────────────────────────────────────
  console.log('\n🔍 Verification:');
  const cities = await prisma.$queryRaw`
    SELECT id, "imageUrl" FROM cities WHERE id IN ('city_aden', 'city_taiz');
  `;
  console.table(cities);

  const hotels = await prisma.$queryRaw`
    SELECT id, "thumbnailUrl" FROM hotels WHERE id = 'h_sheraton';
  `;
  console.table(hotels);

  console.log('\n✅ All broken images fixed.\n');
}

main()
  .catch(e => { console.error('[FATAL]', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
