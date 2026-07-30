import { PrismaClient, HotelType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء نقل بيانات دليل الفنادق إلى قاعدة البيانات...');
  const jsonPath = path.join(process.cwd(), 'migration-output', 'hotels-transformed.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ خطأ: لم يتم العثور على ملف البيانات.');
    console.error('رجاءً قم بتشغيل سكربت الهجرة الأول أولاً: npx tsx scripts/migrate-hotels.ts');
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const hotelsData = JSON.parse(rawData);
  console.log(`📡 تم تحميل ${hotelsData.length} فندق من الملف.`);

  // 1. استخراج المدن المتاحة وإنشائها
  const uniqueCities = new Set<string>();
  hotelsData.forEach((h: any) => {
    if (!h.city) {
      h.city = 'غير محدد';
    }
    uniqueCities.add(h.city);
  });

  console.log(`🏙️ تم العثور على ${uniqueCities.size} مدن. جاري التأكد منها...`);
  const cityMap = new Map<string, string>(); 

  for (const cityName of Array.from(uniqueCities)) {
    let cityRecord = await prisma.city.findFirst({ where: { nameAr: cityName } });
    if (!cityRecord) {
      cityRecord = await prisma.city.create({
        data: {
          nameAr: cityName,
          nameEn: cityName, // Need manual translation later
          governorateAr: cityName,
          governorateEn: cityName,
          isActive: true,
        }
      });
    }
    cityMap.set(cityName, cityRecord.id);
  }

  // 2. إدخال الفنادق
  console.log('\n🏨 جاري إدخال الفنادق إلى قاعدة البيانات (Supabase)...');
  let inserted = 0;
  let skipped = 0;

  for (const hotel of hotelsData) {
    const cityId = cityMap.get(hotel.city);
    if (!cityId) continue;

    const existing = await prisma.hotel.findFirst({
      where: { OR: [{ slug: hotel.slug }, { wpId: hotel.wp_id }] }
    });

    if (existing) {
      console.log(`⚠️ تم تخطي ${hotel.name} (موجود مسبقاً)`);
      skipped++;
      continue;
    }

    const createdHotel = await prisma.hotel.create({
      data: {
        wpId: hotel.wp_id,
        slug: hotel.slug,
        type: HotelType.LOCAL,
        nameAr: hotel.name,
        nameEn: hotel.nameEn,
        descriptionAr: hotel.description,
        descriptionEn: hotel.descriptionEn,
        address: hotel.address,
        lat: hotel.lat,
        lng: hotel.lng,
        stars: hotel.stars,
        rating: hotel.rating,
        priceFrom: hotel.priceFrom,
        currency: hotel.currency || 'USD',
        thumbnailUrl: hotel.thumbnail || null,
        isFeatured: false,
        isActive: true,
        cityId: cityId,
      }
    });

    // 3. إدخال صور الفندق
    if (hotel.images && Array.isArray(hotel.images)) {
      for (let i = 0; i < hotel.images.length; i++) {
        await prisma.hotelImage.create({
          data: {
            url: hotel.images[i],
            order: i,
            hotelId: createdHotel.id
          }
        });
      }
    }
    
    console.log(`✅ تمت إضافة: ${hotel.name}`);
    inserted++;
  }

  console.log('\n======================================');
  console.log(`🎉 اكتمل النقل بنجاح!`);
  console.log(`📈 الفنادق المضافة: ${inserted}`);
  console.log(`⏭️ الفنادق المتخطاة: ${skipped}`);
  console.log('======================================');
}

main()
  .catch((e) => {
    console.error('❌ حدث خطأ أثناء إدخال البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
