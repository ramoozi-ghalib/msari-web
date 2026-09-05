import { unstable_cache } from 'next/cache';
import { db } from '@/lib/firebase-admin';
import type { Offer } from '@/types';

// B6: كاش شبه ثابت 60s لإعلانات الت banners (محتوى تسويقي — تصنيف B).
// الإبطال عبر مسار /api/revalidate (tag: offers). تأخر ≤60s مقبول تسويقياً.
// الأسعار/التوفر لا تمر هنا إطلاقاً.
const OFFERS_REVALIDATE = 60;

function mapAdDoc(doc: FirebaseFirestore.QueryDocumentSnapshot): Offer {
  const data = doc.data();
  return {
    id: doc.id,
    title: '', // Graphic banners do not have text titles
    titleEn: '',
    image: data.imageUrl || '',
    link: '#',
    isActive: true,
    order: 0,
  };
}

async function fetchActiveOffersFresh(limit: number): Promise<Offer[]> {
  try {
    const snap = await db.collection('ads')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(mapAdDoc);
  } catch (error) {
    console.error('Error fetching active offers from Firestore:', error);
    return [];
  }
}

async function fetchAllOffersFresh(limit: number): Promise<Offer[]> {
  try {
    const snap = await db.collection('ads')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(mapAdDoc);
  } catch (error) {
    console.error('Error fetching all offers from Firestore:', error);
    return [];
  }
}

export class OfferService {
  /**
   * Fetch active offers (advertisements) from Firestore 'ads' collection
   */
  static getActiveOffers = unstable_cache(fetchActiveOffersFresh, ['offers:active'], {
    revalidate: OFFERS_REVALIDATE,
    tags: ['offers'],
  });

  /**
   * Fetch all offers (advertisements) from Firestore
   */
  static getAllOffers = unstable_cache(fetchAllOffersFresh, ['offers:all'], {
    revalidate: OFFERS_REVALIDATE,
    tags: ['offers'],
  });
}
