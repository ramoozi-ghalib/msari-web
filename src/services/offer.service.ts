import { db } from '@/lib/firebase-admin';
import type { Offer } from '@/types';

export class OfferService {
  /**
   * Fetch active offers (advertisements) from Firestore 'ads' collection
   */
  static async getActiveOffers(limit: number): Promise<Offer[]> {
    try {
      const snap = await db.collection('ads')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snap.docs.map(doc => {
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
      });
    } catch (error) {
      console.error('Error fetching active offers from Firestore:', error);
      return [];
    }
  }

  /**
   * Fetch all offers (advertisements) from Firestore
   */
  static async getAllOffers(limit: number): Promise<Offer[]> {
    try {
      const snap = await db.collection('ads')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: '',
          titleEn: '',
          image: data.imageUrl || '',
          link: '#',
          isActive: true,
          order: 0,
        };
      });
    } catch (error) {
      console.error('Error fetching all offers from Firestore:', error);
      return [];
    }
  }
}
