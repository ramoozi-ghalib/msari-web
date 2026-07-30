/**
 * Seeds the amenities table with standard hotel amenities.
 * Run with: npx tsx scripts/seed-amenities.ts
 */
import { PrismaClient, AmenityCategory } from '@prisma/client';

const prisma = new PrismaClient();

const AMENITIES: { nameAr: string; nameEn: string; icon: string; category: AmenityCategory }[] = [
  // GENERAL
  { nameAr: 'واي فاي مجاني', nameEn: 'Free Wi-Fi', icon: 'wifi', category: 'GENERAL' },
  { nameAr: 'موقف سيارات', nameEn: 'Parking', icon: 'car', category: 'GENERAL' },
  { nameAr: 'مصعد', nameEn: 'Elevator', icon: 'arrow-up-square', category: 'GENERAL' },
  { nameAr: 'تكييف هواء', nameEn: 'Air Conditioning', icon: 'wind', category: 'GENERAL' },
  { nameAr: 'مكتب استقبال 24 ساعة', nameEn: '24/7 Reception', icon: 'clock', category: 'GENERAL' },
  { nameAr: 'خدمة تنظيف يومية', nameEn: 'Daily Housekeeping', icon: 'sparkles', category: 'GENERAL' },
  { nameAr: 'خدمات الغرف', nameEn: 'Room Service', icon: 'bell', category: 'GENERAL' },
  { nameAr: 'أمن وحراسة', nameEn: 'Security', icon: 'shield', category: 'GENERAL' },
  // DINING
  { nameAr: 'مطعم', nameEn: 'Restaurant', icon: 'utensils', category: 'DINING' },
  { nameAr: 'فطور مجاني', nameEn: 'Free Breakfast', icon: 'coffee', category: 'DINING' },
  { nameAr: 'كافيتيريا', nameEn: 'Cafeteria', icon: 'coffee', category: 'DINING' },
  { nameAr: 'بوفيه إفطار', nameEn: 'Breakfast Buffet', icon: 'utensils', category: 'DINING' },
  // WELLNESS
  { nameAr: 'مسبح', nameEn: 'Swimming Pool', icon: 'waves', category: 'WELLNESS' },
  { nameAr: 'مسبح أطفال', nameEn: "Children's Pool", icon: 'waves', category: 'WELLNESS' },
  { nameAr: 'سبا', nameEn: 'Spa', icon: 'leaf', category: 'WELLNESS' },
  { nameAr: 'جاكوزي', nameEn: 'Jacuzzi', icon: 'droplets', category: 'WELLNESS' },
  // SPORT
  { nameAr: 'صالة لياقة بدنية', nameEn: 'Gym', icon: 'dumbbell', category: 'SPORT' },
  { nameAr: 'ملعب تنس', nameEn: 'Tennis Court', icon: 'circle-dot', category: 'SPORT' },
  // BUSINESS
  { nameAr: 'قاعة اجتماعات', nameEn: 'Meeting Room', icon: 'presentation', category: 'BUSINESS' },
  { nameAr: 'مركز أعمال', nameEn: 'Business Center', icon: 'briefcase', category: 'BUSINESS' },
  // ROOM
  { nameAr: 'شاشة ذكية', nameEn: 'Smart TV', icon: 'tv', category: 'ROOM' },
  { nameAr: 'مطبخ تحضيري', nameEn: 'Kitchenette', icon: 'chef-hat', category: 'ROOM' },
  { nameAr: 'إطلالة على البحر', nameEn: 'Sea View', icon: 'eye', category: 'ROOM' },
  { nameAr: 'شرفة خاصة', nameEn: 'Private Balcony', icon: 'home', category: 'ROOM' },
];

async function main() {
  console.log('🌱 Seeding amenities...\n');

  let created = 0;
  let skipped = 0;

  for (const amenity of AMENITIES) {
    const existing = await prisma.amenity.findFirst({
      where: { nameAr: amenity.nameAr },
    });
    if (!existing) {
      await prisma.amenity.create({ data: amenity });
      console.log(`  ✅ [${amenity.category}] ${amenity.nameAr}`);
      created++;
    } else {
      console.log(`  ⏭️  Exists: ${amenity.nameAr}`);
      skipped++;
    }
  }

  const total = await prisma.amenity.count();
  console.log(`\n✨ Done! Created: ${created} | Skipped: ${skipped} | Total in DB: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
