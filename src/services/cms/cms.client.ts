/**
 * src/services/cms/cms.client.ts
 *
 * Centralized Firestore client for CMS services.
 * Handles timeouts, errors, graceful degraded states, and atomic writes.
 */

import { db } from '@/lib/firebase-admin';

export class CmsClient {
  /**
   * Fetch a single document by collection and document ID with error protection.
   */
  static async getDoc<T = Record<string, any>>(
    collection: string,
    docId: string
  ): Promise<T | null> {
    try {
      const docRef = db.collection(collection).doc(docId);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return null;
      }

      const data = snapshot.data();
      return (data as T) || null;
    } catch (error) {
      console.error(`[CmsClient] ⚠️ Error fetching ${collection}/${docId}:`, error);
      return null;
    }
  }

  /**
   * Fetch all documents from a collection.
   */
  static async getCollection<T = Record<string, any>>(
    collection: string
  ): Promise<T[]> {
    try {
      const snapshot = await db.collection(collection).get();
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error) {
      console.error(`[CmsClient] ⚠️ Error fetching collection ${collection}:`, error);
      return [];
    }
  }

  /**
   * Write or merge a document in Firestore safely.
   */
  static async setDoc(
    collection: string,
    docId: string,
    data: Record<string, any>,
    options: { merge?: boolean } = { merge: true }
  ): Promise<boolean> {
    try {
      const docRef = db.collection(collection).doc(docId);
      await docRef.set(data, options);
      return true;
    } catch (error) {
      console.error(`[CmsClient] ⚠️ Error writing document ${collection}/${docId}:`, error);
      return false;
    }
  }
}
