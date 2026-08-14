import { db } from '../src/lib/firebase-admin';
import { getBlogPosts, getBlogPostBySlug } from '../src/actions/blog';
import { CmsClient } from '../src/services/cms/cms.client';

async function runComprehensiveVerification() {
  console.log('===============================================================');
  console.log('   MSARI CMS COVERAGE & ARCHITECTURAL VERIFICATION SUITE       ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string) {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      failed++;
    }
  }

  // 1. Settings & Shared Single Source of Truth
  console.log('\n--- 1. Shared Global Settings Verification ---');
  const settingsDoc = await CmsClient.getDoc<any>('website_settings', 'general');
  assert(settingsDoc !== null, 'website_settings/general exists in Firestore');
  assert(!!settingsDoc?.whatsapp_number || !!settingsDoc?.whatsappNumber, `WhatsApp number exists in SoT (${settingsDoc?.whatsapp_number || settingsDoc?.whatsappNumber})`);
  assert(!!settingsDoc?.play_store_url || !!settingsDoc?.playStoreUrl, `Google Play Store URL exists in SoT (${settingsDoc?.play_store_url || settingsDoc?.playStoreUrl})`);
  assert(!!settingsDoc?.app_store_url || !!settingsDoc?.appStoreUrl, `Apple App Store URL exists in SoT (${settingsDoc?.app_store_url || settingsDoc?.appStoreUrl})`);

  // 2. Blog Single Source of Truth (Firestore web_blog)
  console.log('\n--- 2. Blog Single Source of Truth Verification ---');
  const blogPosts = await getBlogPosts();
  assert(blogPosts.length === 3, `getBlogPosts() returned exactly 3 articles from Firestore web_blog (got ${blogPosts.length})`);
  
  const singleBlog = await getBlogPostBySlug('sanaa-heritage-hotels-guide');
  assert(singleBlog !== null && singleBlog.slug === 'sanaa-heritage-hotels-guide', `getBlogPostBySlug fetches real Firestore document`);

  // 3. Website Pages Polymorphic Structure (All 9 pages)
  console.log('\n--- 3. Website Pages Coverage (9 Pages) ---');
  const requiredSlugs = ['about', 'privacy', 'terms', 'developers', 'app', 'cars', 'add_hotel', 'international_hotels', 'flights'];
  const pagesSnap = await db.collection('website_pages').get();
  const existingSlugs = pagesSnap.docs.map(d => d.id);
  
  for (const slug of requiredSlugs) {
    assert(existingSlugs.includes(slug), `website_pages/${slug} document exists in Firestore`);
  }

  // Test marketing page contents
  const appDoc = await CmsClient.getDoc<any>('website_pages', 'app');
  assert(!!appDoc?.content?.hero?.title, `website_pages/app has valid hero title ("${appDoc?.content?.hero?.title}")`);

  const carsDoc = await CmsClient.getDoc<any>('website_pages', 'cars');
  assert(!!carsDoc?.content?.hero?.title, `website_pages/cars has valid hero title ("${carsDoc?.content?.hero?.title}")`);

  const addHotelDoc = await CmsClient.getDoc<any>('website_pages', 'add_hotel');
  assert(!!addHotelDoc?.content?.hero?.title, `website_pages/add_hotel has valid hero title ("${addHotelDoc?.content?.hero?.title}")`);

  const intlDoc = await CmsClient.getDoc<any>('website_pages', 'international_hotels');
  assert(!!intlDoc?.content?.hero?.title, `website_pages/international_hotels has valid hero title ("${intlDoc?.content?.hero?.title}")`);

  const flightsDoc = await CmsClient.getDoc<any>('website_pages', 'flights');
  assert(!!flightsDoc?.content?.hero?.title, `website_pages/flights has valid hero title ("${flightsDoc?.content?.hero?.title}")`);

  // 4. Invariant: Homepage does not contain store URLs
  console.log('\n--- 4. Homepage Invariants Check ---');
  const homeDoc = await db.collection('website_homepage').doc('main').get();
  const homeData = homeDoc.data() || {};
  const hasStoreInHome = homeData.app_store_url || homeData.play_store_url || homeData.appDownload?.appStoreUrl;
  assert(!hasStoreInHome, `Homepage collection strictly does NOT store redundant store URLs`);

  // 5. Operational Data Protection & Read-Only Isolation
  console.log('\n--- 5. Operational Isolation Check ---');
  const destinationsSnap = await db.collection('destinations').limit(3).get();
  assert(!destinationsSnap.empty, `Operational destinations collection is intact (${destinationsSnap.docs.length} sampled)`);

  const hotelsSnap = await db.collection('hotels').limit(3).get();
  assert(!hotelsSnap.empty, `Operational hotels collection is intact (${hotelsSnap.docs.length} sampled)`);

  console.log('\n===============================================================');
  console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveVerification().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
