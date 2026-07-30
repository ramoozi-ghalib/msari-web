import * as admin from 'firebase-admin';

console.log('[BOOT-3] Executing src/lib/firebase-admin.ts -> Module Loaded');

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.warn('[firebase-admin] ⚠️ Failed to initialize Firebase Admin SDK:', error);
    }
  }
}

// Proxy wrapper for db (Firestore) to prevent startup crash if uninitialized
export const db: admin.firestore.Firestore = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop, receiver) {
    if (!admin.apps.length) {
      const dummyChain: any = {
        where: () => dummyChain,
        doc: () => dummyChain,
        collection: () => dummyChain,
        orderBy: () => dummyChain,
        limit: () => dummyChain,
        get: async () => ({ docs: [], empty: true, size: 0 }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
      };
      return typeof dummyChain[prop] === 'function' ? dummyChain[prop] : dummyChain;
    }
    const realDb = admin.firestore();
    const value = Reflect.get(realDb, prop, receiver);
    return typeof value === 'function' ? value.bind(realDb) : value;
  },
});

// Proxy wrapper for storage (Cloud Storage)
export const storage: admin.storage.Storage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop, receiver) {
    if (!admin.apps.length) {
      const dummyStorage: any = {
        bucket: () => ({
          file: () => ({
            getSignedUrl: async () => [''],
            exists: async () => [false],
          }),
        }),
      };
      return typeof dummyStorage[prop] === 'function' ? dummyStorage[prop] : dummyStorage;
    }
    const realStorage = admin.storage();
    const value = Reflect.get(realStorage, prop, receiver);
    return typeof value === 'function' ? value.bind(realStorage) : value;
  },
});

export { admin };
