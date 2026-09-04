import { unstable_cache } from 'next/cache';
import { db } from '@/lib/firebase-admin';
import type { Offer } from '@/types';

// Phase 2: كاش 60s — طلبات الصفحة الرئيسية تُعاد كل دقيقة بدل كل طلب
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

async function fetchActiveOffersInternal(limit: number): Promise<Offer[]> {
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

async function fetchAllOffersInternal(limit: number): Promise<Offer[]> {
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
   * Fetch active offers (advertisements) from Firestore 'ads' collection (cached 60s)
   */
  static getActiveOffers = unstable_cache(
    fetchActiveOffersInternal,
    ['offers:active'],
    { revalidate: OFFERS_REVALIDATE, tags: ['offers'] }
  );

  /**
   * Fetch all offers (advertisements) from Firestore (cached 60s, same tag)
   */
  static getAllOffers = unstable_cache(
    fetchAllOffersInternal,
    ['offers:all'],
    { revalidate: OFFERS_REVALIDATE, tags: ['offers'] }
  );
}
