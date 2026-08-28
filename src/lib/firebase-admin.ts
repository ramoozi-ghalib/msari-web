import * as admin from 'firebase-admin';
import * as fs from 'fs';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';

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
      console.warn('[firebase-admin] ⚠️ Failed to initialize Firebase Admin SDK from env:', error);
    }
  } else if (fs.existsSync(keyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

    } catch (error) {
      console.warn('[firebase-admin] ⚠️ Failed to initialize Firebase Admin SDK from key file:', error);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FAILURE MODE POLICY (security hardening)
// ─────────────────────────────────────────────────────────────────────────────
//  - READS  : degrade gracefully (empty results) — every read call-site in
//             this codebase has an explicit try/catch with fallback content
//             (CmsClient, sitemap.ts, actions/*). This preserves uptime and
//             build-time resilience when Firebase credentials are absent.
//  - WRITES : FAIL FAST with a loud, explicit error. The previous behaviour
//             returned a dummy chain that silently accepted writes
//             (e.g. hotel-requests returned success:true while nothing was
//             persisted) — silent data loss is never acceptable.

const WRITE_METHODS = new Set([
  'add', 'set', 'update', 'delete', 'create',
  'runTransaction', 'batch', 'bulkWriter', 'increment',
]);

function rejectUninitializedWrite(method: string): never {
  throw new Error(
    `[firebase-admin] REJECTED ${method}(): Firebase Admin SDK is NOT initialized ` +
    `(missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY ` +
    `or GOOGLE_APPLICATION_CREDENTIALS). Failing fast to prevent silent data loss.`
  );
}

function makeUninitializedWriteGuard(target: object): object {
  return new Proxy(target, {
    get(_t, prop: string | symbol) {
      if (typeof prop === 'string' && WRITE_METHODS.has(prop)) {
        return () => rejectUninitializedWrite(prop);
      }
      throw new Error(
        `[firebase-admin] REJECTED access to '${String(prop)}': Firebase Admin SDK is NOT initialized.`
      );
    },
  });
}

// Proxy wrapper for db (Firestore) to prevent startup crash if uninitialized
export const db: admin.firestore.Firestore = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop, receiver) {
    if (!admin.apps.length) {
      const propStr = String(prop);
      if (WRITE_METHODS.has(propStr)) {
        return () => rejectUninitializedWrite(propStr);
      }
      const dummyChain: any = {
        where: () => dummyChain,
        doc: () => dummyChain,
        collection: () => dummyChain,
        collectionGroup: () => dummyChain,
        orderBy: () => dummyChain,
        limit: () => dummyChain,
        offset: () => dummyChain,
        startAfter: () => dummyChain,
        startAt: () => dummyChain,
        endAt: () => dummyChain,
        endBefore: () => dummyChain,
        select: () => dummyChain,
        get: async () => ({ docs: [], empty: true, size: 0 }),
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
      return makeUninitializedWriteGuard({});
    }
    const realStorage = admin.storage();
    const value = Reflect.get(realStorage, prop, receiver);
    return typeof value === 'function' ? value.bind(realStorage) : value;
  },
});

export { admin };
