import * as admin from 'firebase-admin';
import * as fs from 'fs';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function checkAdmins() {
  console.log('=== ADMINS IN FIRESTORE ===');
  const snap = await db.collection('admins').get();
  snap.docs.forEach(doc => {
    console.log(`UID: ${doc.id}`);
    console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
    console.log('----------------------------');
  });
}

checkAdmins().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
