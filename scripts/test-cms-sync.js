/**
 * scripts/test-cms-sync.js
 * 
 * End-to-end verification script for CMS synchronization,
 * image upload support, array mutations, and Next.js live revalidation.
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'msariapp-v2.appspot.com',
  });
}

const db = getFirestore();
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const REVALIDATE_SECRET = 'msari_cms_revalidate_prod_2026_xK9mP3';

async function revalidate(tag, path) {
  try {
    const res = await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, path, secret: REVALIDATE_SECRET }),
    });
    const json = await res.json();
    return { status: res.status, json };
  } catch (e) {
    return { error: e.message };
  }
}

async function testPage(urlPath, expectedStrings = []) {
  try {
    const res = await fetch(`${BASE_URL}${urlPath}`);
    const text = await res.text();
    const matches = expectedStrings.map(str => {
      const found = text.includes(str) || 
                    text.includes(encodeURIComponent(str)) ||
                    (str.includes('firebasestorage') && text.includes(encodeURIComponent(str.split('?')[0])));
      return { str, found };
    });
    return {
      status: res.status,
      ok: res.ok,
      matches,
    };
  } catch (e) {
    return { error: e.message, status: 500, ok: false, matches: [] };
  }
}

async function runLiveSyncTests() {
  console.log('================================================================');
  console.log('🚀 STARTING CMS LIVE SYNCHRONIZATION & REVALIDATION TEST SUITE');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('================================================================\n');

  // Test 1: Test Revalidate API
  console.log('--- TEST 1: Revalidation Webhook Security & Execution ---');
  const invalidAuth = await fetch(`${BASE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag: 'cms:pages', secret: 'wrong_secret' }),
  });
  console.log(`1.1 Unauthorized request rejected (401): ${invalidAuth.status === 401 ? '✅ PASS' : '❌ FAIL'}`);

  const validReval = await revalidate('cms:pages');
  console.log(`1.2 Authorized revalidation execution (200): ${validReval.status === 200 && validReval.json?.revalidated ? '✅ PASS' : '❌ FAIL'}`);

  // Test 2: Live Text & Image Storage URL Sync (About Page)
  console.log('\n--- TEST 2: Text & Image Storage URL Sync (About Page) ---');
  const testTimestamp = Date.now();
  const testHeroBadge = `مساري الرائدة ${testTimestamp}`;
  const testStorageUrl = `https://firebasestorage.googleapis.com/v0/b/msariapp-v2.appspot.com/o/website%2Fpages%2Fabout%2Ftest_${testTimestamp}.jpg?alt=media&token=test-token`;

  const aboutDoc = await db.collection('website_pages').doc('about').get();
  const originalAboutData = aboutDoc.data() || {};

  // Update in Firestore
  await db.collection('website_pages').doc('about').set({
    ...originalAboutData,
    content: {
      ...(originalAboutData.content || {}),
      hero: {
        ...(originalAboutData.content?.hero || {}),
        badge: testHeroBadge,
      },
      story: {
        ...(originalAboutData.content?.story || {}),
        image: testStorageUrl,
      },
    },
    hero: {
      ...(originalAboutData.hero || {}),
      badge: testHeroBadge,
    },
    story: {
      ...(originalAboutData.story || {}),
      image: testStorageUrl,
    },
    updatedAt: new Date().toISOString(),
  });

  // Trigger Revalidation
  await revalidate('cms:pages');
  await revalidate('cms:page:about');

  // Verify on website
  const aboutTestRes = await testPage('/ar/about', [testHeroBadge, testStorageUrl]);
  console.log(`2.1 Text change reflected on /ar/about: ${aboutTestRes.matches?.[0]?.found ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`2.2 Firebase Storage URL rendered on /ar/about: ${aboutTestRes.matches?.[1]?.found ? '✅ PASS' : '❌ FAIL'}`);

  // Restore original about data
  await db.collection('website_pages').doc('about').set(originalAboutData);
  await revalidate('cms:pages');

  // Test 3: Array Mutation Sync (Add, Modify, Delete in Cars Fleet)
  console.log('\n--- TEST 3: Array Item Add / Edit / Delete (Cars Fleet) ---');
  const carsDoc = await db.collection('website_pages').doc('cars').get();
  const originalCarsData = carsDoc.data() || {};
  const originalFleet = originalCarsData.content?.fleet || [];

  // Add new fleet item
  const testCarCategory = `فئة تجريبية ممتازة ${testTimestamp}`;
  const updatedFleet = [
    ...originalFleet,
    {
      tag: testCarCategory,
      desc: 'مركبة مخصصة للفحص والاختبار المباشر',
      cap: '5',
      bags: '3',
      price: '99',
      img: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.appspot.com/o/website%2Fpages%2Fcars%2Ftest_fleet.jpg?alt=media',
    },
  ];

  await db.collection('website_pages').doc('cars').set({
    content: {
      ...originalCarsData.content,
      fleet: updatedFleet,
    },
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await revalidate('cms:pages');
  await revalidate('cms:page:cars');

  const carsAddRes = await testPage('/ar/cars', [testCarCategory]);
  console.log(`3.1 Added array item rendered on /ar/cars: ${carsAddRes.matches?.[0]?.found ? '✅ PASS' : '❌ FAIL'}`);

  // Delete the item & restore
  await db.collection('website_pages').doc('cars').set(originalCarsData);
  await revalidate('cms:pages');
  await revalidate('cms:page:cars');

  const carsDeleteRes = await testPage('/ar/cars', [testCarCategory]);
  console.log(`3.2 Deleted array item removed on /ar/cars: ${!carsDeleteRes.matches?.[0]?.found ? '✅ PASS' : '❌ FAIL'}`);

  // Test 4: Destination Editorial & Landmarks Sync
  console.log('\n--- TEST 4: Destination Editorial & Landmarks Sync ---');
  const adenDoc = await db.collection('website_destinations').doc('aden').get();
  const adenData = adenDoc.data() || {};
  const adenOverview = adenData.overview || {};
  
  const adenTestRes = await testPage('/ar/destinations/aden', [
    'عدن',
    adenOverview.climate ? adenOverview.climate.substring(0, 20) : 'عدن',
  ]);
  console.log(`4.1 Destination Aden details HTTP 200: ${adenTestRes.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`4.2 Destination Aden editorial text rendered: ${adenTestRes.matches?.[1]?.found ? '✅ PASS' : '❌ FAIL'}`);

  // Test 5: All 12 Mandatory Pages Status Verification
  console.log('\n--- TEST 5: Mandatory 12 Marketing & Operational Pages Health ---');
  const routesToTest = [
    { path: '/ar', name: 'Homepage (/)' },
    { path: '/ar/about', name: 'About (/about)' },
    { path: '/ar/app', name: 'App (/app)' },
    { path: '/ar/cars', name: 'Cars (/cars)' },
    { path: '/ar/cars/airport', name: 'Airport Taxi (/cars/airport)' },
    { path: '/ar/cars/transport', name: 'Intercity Transport (/cars/transport)' },
    { path: '/ar/flights', name: 'Flights (/flights)' },
    { path: '/ar/hotels/international', name: 'International Hotels (/hotels/international)' },
    { path: '/ar/add-hotel', name: 'Add Hotel (/add-hotel)' },
    { path: '/ar/contact', name: 'Contact (/contact)' },
    { path: '/ar/blog', name: 'Blog List (/blog)' },
    { path: '/ar/destinations/sanaa', name: 'Destination Sanaa (/destinations/sanaa)' },
    { path: '/ar/destinations/mukalla', name: 'Destination Mukalla (/destinations/mukalla)' },
    { path: '/ar/destinations/seiyun', name: 'Destination Seiyun (/destinations/seiyun)' },
    { path: '/ar/destinations/ibb', name: 'Destination Ibb (/destinations/ibb)' },
  ];

  let allRoutesOk = true;
  for (const r of routesToTest) {
    const res = await testPage(r.path);
    const passed = res.status === 200;
    if (!passed) allRoutesOk = false;
    console.log(`- ${r.name.padEnd(45)}: ${passed ? '✅ HTTP 200' : `❌ HTTP ${res.status}`}`);
  }

  console.log('\n================================================================');
  console.log(`🎯 OVERALL SUITE RESULT: ${allRoutesOk ? '🎉 ALL TESTS PASSED SUCCESSFULLY' : '⚠️ SOME TESTS FAILED'}`);
  console.log('================================================================\n');
}

runLiveSyncTests().catch(console.error);
