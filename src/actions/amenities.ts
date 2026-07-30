'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { adminGuard } from '@/lib/action-guard';
import { Policies } from '@/lib/policies';

export async function getAllAmenities() {
  try {
    const snap = await db.collection('amenities').where('isDeleted', '==', false).get();
    const amenities = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nameAr: data.nameAr || data.name || '',
        nameEn: data.nameEn || '',
        icon: data.icon || 'Sparkles',
        category: data.category || 'HOTEL_AMENITIES',
      };
    });

    return { success: true, data: amenities };
  } catch (error) {
    console.error('Failed to fetch amenities:', error);
    return { success: false, error: { message: 'Failed to fetch amenities' } };
  }
}

export async function createAmenity(data: { nameAr: string; nameEn: string; icon: string; category: any }) {
  const guard = await adminGuard(Policies.isFullAdmin);
  if (!guard.ok) return guard.error;

  try {
    const docRef = db.collection('amenities').doc();
    await docRef.set({
      id: docRef.id,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      icon: data.icon,
      category: data.category,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    });
    
    revalidatePath('/admin/settings');
    revalidatePath('/admin/hotels');
    return { success: true };
  } catch (error) {
    return { success: false, error: { message: 'Failed to create amenity' } };
  }
}

export async function deleteAmenity(id: string) {
  const guard = await adminGuard(Policies.isFullAdmin);
  if (!guard.ok) return guard.error;

  try {
    await db.collection('amenities').doc(id).update({
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
    
    revalidatePath('/admin/settings');
    revalidatePath('/admin/hotels');
    return { success: true };
  } catch (error) {
    return { success: false, error: { message: 'Failed to delete amenity' } };
  }
}

export async function reseedAmenities() {
  const guard = await adminGuard(Policies.isFullAdmin);
  if (!guard.ok) return guard.error;

  try {
    const batch = db.batch();
    const hotelAmenities = [
      { nameAr: 'بقالة', nameEn: 'Grocery', icon: 'ShoppingCart', category: 'HOTEL_AMENITIES' },
      { nameAr: 'مطعم', nameEn: 'Restaurant', icon: 'UtensilsCrossed', category: 'HOTEL_AMENITIES' },
      { nameAr: 'كافيه', nameEn: 'Cafe', icon: 'Coffee', category: 'HOTEL_AMENITIES' },
      { nameAr: 'كافتيريا', nameEn: 'Cafeteria', icon: 'CupSoda', category: 'HOTEL_AMENITIES' },
      { nameAr: 'حراسة أمنية', nameEn: 'Security', icon: 'ShieldCheck', category: 'HOTEL_AMENITIES' },
      { nameAr: 'صالون حلاقة', nameEn: 'Barber', icon: 'Scissors', category: 'HOTEL_AMENITIES' },
      { nameAr: 'خدمة الغرف', nameEn: 'Room Service', icon: 'BellRing', category: 'HOTEL_AMENITIES' },
      { nameAr: 'مسبح', nameEn: 'Pool', icon: 'Waves', category: 'HOTEL_AMENITIES' },
      { nameAr: 'خدمة النقل للمطار', nameEn: 'Airport Shuttle', icon: 'Car', category: 'HOTEL_AMENITIES' },
      { nameAr: 'مغسلة', nameEn: 'Laundry', icon: 'Shirt', category: 'HOTEL_AMENITIES' },
      { nameAr: 'موقف سيارات', nameEn: 'Parking', icon: 'ParkingCircle', category: 'HOTEL_AMENITIES' },
      { nameAr: 'منتزه', nameEn: 'Park', icon: 'Trees', category: 'HOTEL_AMENITIES' },
      { nameAr: 'نادي صحي', nameEn: 'Gym', icon: 'Dumbbell', category: 'HOTEL_AMENITIES' },
      { nameAr: 'شيش ومعسل', nameEn: 'Shisha', icon: 'Flame', category: 'HOTEL_AMENITIES' },
      { nameAr: 'طيرمانات', nameEn: 'Balcony', icon: 'Home', category: 'HOTEL_AMENITIES' },
      { nameAr: 'إنترنت', nameEn: 'Internet', icon: 'Wifi', category: 'HOTEL_AMENITIES' },
      { nameAr: 'مصعد', nameEn: 'Elevator', icon: 'ArrowUpDown', category: 'HOTEL_AMENITIES' },
      { nameAr: 'وسط المدينة', nameEn: 'City Center', icon: 'MapPin', category: 'HOTEL_AMENITIES' },
      { nameAr: 'قريب المطار', nameEn: 'Near Airport', icon: 'Plane', category: 'HOTEL_AMENITIES' },
      { nameAr: 'قاعات إجتماعات وتدريب', nameEn: 'Meeting Rooms', icon: 'Presentation', category: 'HOTEL_AMENITIES' },
    ];

    const roomFeatures = [
      { nameAr: 'تكييف', nameEn: 'AC', icon: 'Wind', category: 'ROOM_FEATURES' },
      { nameAr: 'شاشة ذكية', nameEn: 'Smart TV', icon: 'Tv', category: 'ROOM_FEATURES' },
      { nameAr: 'طاولة طعام', nameEn: 'Dining Table', icon: 'Table', category: 'ROOM_FEATURES' },
      { nameAr: 'خزنة', nameEn: 'Safe', icon: 'Lock', category: 'ROOM_FEATURES' },
      { nameAr: 'ثلاجة', nameEn: 'Fridge', icon: 'Refrigerator', category: 'ROOM_FEATURES' },
      { nameAr: 'إنترنت', nameEn: 'Internet', icon: 'Wifi', category: 'ROOM_FEATURES' },
      { nameAr: 'إطلالة على البحر', nameEn: 'Sea View', icon: 'Waves', category: 'ROOM_FEATURES' },
      { nameAr: 'إطلالة على المدينة', nameEn: 'City View', icon: 'Building2', category: 'ROOM_FEATURES' },
      { nameAr: 'مجفف شعر', nameEn: 'Hair Dryer', icon: 'Wind', category: 'ROOM_FEATURES' },
      { nameAr: 'سخان', nameEn: 'Heater', icon: 'Flame', category: 'ROOM_FEATURES' },
      { nameAr: 'جاكوزي', nameEn: 'Jacuzzi', icon: 'Bath', category: 'ROOM_FEATURES' },
      { nameAr: 'غلاية كهربائية', nameEn: 'Kettle', icon: 'Coffee', category: 'ROOM_FEATURES' },
      { nameAr: 'ساونا', nameEn: 'Sauna', icon: 'ThermometerSun', category: 'ROOM_FEATURES' },
    ];

    const all = [...hotelAmenities, ...roomFeatures];

    for (const item of all) {
      const docRef = db.collection('amenities').doc();
      batch.set(docRef, {
        id: docRef.id,
        ...item,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    revalidatePath('/admin/settings');
    revalidatePath('/admin/hotels');
    
    return { success: true, count: all.length };
  } catch (error: any) {
    console.error('Reseed Error:', error);
    return { success: false, error: { message: 'Failed to reseed amenities: ' + error.message } };
  }
}
