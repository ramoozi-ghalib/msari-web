const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const keyPath = 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'msariapp-v2.firebasestorage.app',
  });
}

const db = getFirestore();
const userId = 'V7x92SzkXNVpnnknW1cr6bc7B3l1';

(async () => {
  try {
    console.log('Testing getMyBookings simulation for userId:', userId);
    const snap = await db.collection('bookings').doc(userId).collection('entries').orderBy('createdAt', 'desc').get();
    console.log('Found docs:', snap.size);
    for (const doc of snap.docs) {
      const data = doc.data();
      console.log('Doc ID:', doc.id);
      console.log('  Hotel:', data.hotel);
      console.log('  Pricing:', data.pricing);
      console.log('  Stay:', data.stay);
      console.log('  Status:', data.status);
    }
  } catch (err) {
    console.error('Query error:', err);
  }
})();
