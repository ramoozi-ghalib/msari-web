const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const keyPath = 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function run() {
  const testTimestamp = Date.now();
  const testHeroBadge = `مساري الرائدة ${testTimestamp}`;
  const testStorageUrl = `https://firebasestorage.googleapis.com/v0/b/msariapp-v2.appspot.com/o/website%2Fpages%2Fabout%2Ftest_${testTimestamp}.jpg?alt=media&token=test-token`;

  const doc = await db.collection('website_pages').doc('about').get();
  const original = doc.data();

  console.log('Writing test data to Firestore...');
  await db.collection('website_pages').doc('about').set({
    ...original,
    content: {
      ...(original.content || {}),
      hero: {
        ...(original.content?.hero || {}),
        badge: testHeroBadge,
      },
      story: {
        ...(original.content?.story || {}),
        image: testStorageUrl,
      },
    },
    hero: {
      ...(original.hero || {}),
      badge: testHeroBadge,
    },
    story: {
      ...(original.story || {}),
      image: testStorageUrl,
    },
    updatedAt: new Date().toISOString(),
  });

  console.log('Revalidating tag cms:pages...');
  const revalRes = await fetch('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag: 'cms:pages', path: '/ar/about', secret: 'msari_cms_secure_revalidate_2026' }),
  });
  console.log('Revalidate status:', revalRes.status, await revalRes.json());

  console.log('Fetching /ar/about...');
  const pageRes = await fetch('http://localhost:3000/ar/about');
  const html = await pageRes.text();

  console.log('Includes testHeroBadge:', html.includes(testHeroBadge));
  console.log('Includes testStorageUrl:', html.includes(testStorageUrl));
  console.log('Includes testStorageUrl encoded:', html.includes(encodeURIComponent(testStorageUrl)));

  const imgMatches = html.match(/<img[^>]+>/g) || [];
  console.log('Found img tags:', imgMatches);

  // Restore original
  await db.collection('website_pages').doc('about').set(original);
  await fetch('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag: 'cms:pages', path: '/ar/about', secret: 'msari_cms_secure_revalidate_2026' }),
  });
  console.log('Restored original data.');
}

run();
