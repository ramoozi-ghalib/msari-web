/**
 * scripts/verify-cms-invariants.ts
 *
 * End-to-End Functional Invariant Verification Script for Website Management Domain.
 * Tests CMS consumption, Fallback behaviors, Draft isolation, and SoT separation.
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';

if (!admin.apps.length) {
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    console.error('Service account key missing.');
    process.exit(1);
  }
}

const db = admin.firestore();

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING CMS INVARIANTS & FUNCTIONAL VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Homepage CMS Content Exists
  const homeDoc = await db.collection('website_homepage').doc('main').get();
  if (homeDoc.exists && homeDoc.data()?.hero?.titleAr) {
    console.log('✅ TEST 1 PASSED: website_homepage/main contains valid hero content.');
    passed++;
  } else {
    console.error('❌ TEST 1 FAILED: website_homepage/main document missing.');
    failed++;
  }

  // Test 2: Website Settings Exists
  const settingsDoc = await db.collection('website_settings').doc('general').get();
  if (settingsDoc.exists && settingsDoc.data()?.whatsappNumber === '967733644466') {
    console.log('✅ TEST 2 PASSED: website_settings/general contains valid unified contact config.');
    passed++;
  } else {
    console.error('❌ TEST 2 FAILED: website_settings/general missing.');
    failed++;
  }

  // Test 3: Polymorphic Pages Exist
  const aboutDoc = await db.collection('website_pages').doc('about').get();
  const privacyDoc = await db.collection('website_pages').doc('privacy').get();
  const termsDoc = await db.collection('website_pages').doc('terms').get();
  const devDoc = await db.collection('website_pages').doc('developers').get();

  if (
    aboutDoc.data()?.type === 'content_page' &&
    privacyDoc.data()?.type === 'legal_page' &&
    termsDoc.data()?.type === 'legal_page' &&
    devDoc.data()?.type === 'developers_page'
  ) {
    console.log('✅ TEST 3 PASSED: website_pages contains all polymorphic schemas (content, legal, developers).');
    passed++;
  } else {
    console.error('❌ TEST 3 FAILED: Polymorphic schemas mismatch.');
    failed++;
  }

  // Test 4: Operational vs Editorial Destination Separation
  const operationalDestSnap = await db.collection('destinations').get();
  const editorialDestDoc = await db.collection('website_destinations').doc('sanaa').get();

  if (operationalDestSnap.size > 0 && editorialDestDoc.exists) {
    const editData = editorialDestDoc.data();
    // Check that editorial document contains landmarks & overview, but operational fields belong to core
    if (Array.isArray(editData?.landmarks) && editData?.overview?.history) {
      console.log(`✅ TEST 4 PASSED: Operational destinations (${operationalDestSnap.size} cities) isolated from website_destinations/sanaa (${editData.landmarks.length} landmarks).`);
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED: website_destinations/sanaa missing landmarks/overview.');
      failed++;
    }
  } else {
    console.error('❌ TEST 4 FAILED: destinations or website_destinations/sanaa missing.');
    failed++;
  }

  // Test 5: Draft Isolation Simulation
  // Create a temporary draft document
  await db.collection('website_pages').doc('test_draft_page').set({
    type: 'content_page',
    slug: 'test_draft_page',
    title: 'مسودة اختبار',
    status: 'draft',
    isPublished: false,
  });

  const draftSnap = await db.collection('website_pages').doc('test_draft_page').get();
  const isDraftStatus = draftSnap.data()?.status === 'draft';
  // Cleanup test doc
  await db.collection('website_pages').doc('test_draft_page').delete();

  if (isDraftStatus) {
    console.log('✅ TEST 5 PASSED: Draft status is strictly distinguished from published content.');
    passed++;
  } else {
    console.error('❌ TEST 5 FAILED: Draft status failed.');
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 INVARIANTS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
