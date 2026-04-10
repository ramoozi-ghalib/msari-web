import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 بدء سكربت سحب الغرف والمستخدمين عبر الدائرة المباشرة...');
  
  const url = 'https://msari.net/wp-json/msari/v1/data';
  console.log(`📡 جلب البيانات من: ${url}`);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch from custom endpoint: ${res.statusText}`);
    }
    
    const data = await res.json() as { users: any[], rooms: any[] };
    
    // ============================================
    // 1. إدخال المستخدمين (Optimized)
    // ============================================
    console.log(`\n👥 تم العثور على ${data.users?.length || 0} مستخدم. جاري الإدخال...`);
    
    if (data.users && data.users.length > 0) {
      const existingUsers = await prisma.user.findMany({ select: { email: true } });
      const existingEmails = new Set(existingUsers.map((u: any) => u.email));

      const usersToCreate = [];
      for (const u of data.users) {
        if (!u.user_email || existingEmails.has(u.user_email)) continue;
        
        usersToCreate.push({
          email: u.user_email,
          name: u.display_name || u.user_login,
          role: u.roles?.includes('administrator') ? 'SUPER_ADMIN' : 'CUSTOMER',
        });
        existingEmails.add(u.user_email); // Prevent duplicates in the same batch
      }

      if (usersToCreate.length > 0) {
        const createResult = await prisma.user.createMany({
          data: usersToCreate,
          skipDuplicates: true,
        });
        console.log(`✅ تمت إضافة ${createResult.count} مستخدم بنجاح.`);
      } else {
        console.log(`✅ لم يتم إضافة أي مستخدمين جدد (جميعهم موجودون مسبقاً).`);
      }
    }

    // ============================================
    // 2. إدخال الغرف والأجنحة (Optimized)
    // ============================================
    console.log(`\n🛏️ تم العثور على ${data.rooms?.length || 0} فرقة/جناح. جاري الإدخال...`);
    let roomsInserted = 0;

    if (data.rooms && data.rooms.length > 0) {
      // Pre-fetch all hotels to map wpId -> id
      const allHotels = await prisma.hotel.findMany({ select: { id: true, wpId: true } });
      const hotelMap = new Map<number, string>();
      for (const h of allHotels) {
        if (h.wpId) hotelMap.set(h.wpId, h.id);
      }

      for (const room of data.rooms) {
        // جلب معرف الفندق التابع
        const parentHotelArray = room.meta?.room_parent;
        const hotelWpId = parentHotelArray && parentHotelArray.length > 0 ? parentHotelArray[0] : 0;
        
        if (!hotelWpId) continue;

        // التحقق من وجود الفندق في الـ Map
        const hotelId = hotelMap.get(Number(hotelWpId));
        if (!hotelId) {
          console.log(`⚠️ تم تخطي غرفة '${room.post_title}' لأن الفندق التابع لها غير موجود.`);
          continue;
        }

        const price = room.meta?.price ? room.meta.price[0] : (room.meta?.base_price ? room.meta.base_price[0] : 0);
        const capacity = room.meta?.adult_number ? room.meta.adult_number[0] : 2;

        const createdRoom = await prisma.room.create({
          data: {
            hotelId: hotelId,
            nameAr: room.post_title || 'غرفة',
            nameEn: room.post_title || 'Room',
            descriptionAr: room.post_content?.replace(/(<([^>]+)>)/gi, '') || '',
            pricePerNight: Number(price) || 0,
            capacity: Number(capacity) || 2,
          }
        });

        // إدخال صورة الغرفة إن وجدت
        if (room.thumb) {
          await prisma.roomImage.create({
            data: {
              url: room.thumb,
              roomId: createdRoom.id,
            }
          });
        }

        roomsInserted++;
      }
    }
    console.log(`✅ تمت إضافة ${roomsInserted} غرفة فندقية بنجاح.`);

    console.log('\n🎉 اكتمل النقل الإضافي بنجاح!');

  } catch (err) {
    console.error('❌ حدث خطأ:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
