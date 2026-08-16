import { db } from '../src/lib/firebase-admin';

async function checkHomepage() {
  const doc = await db.collection('website_homepage').doc('main').get();
  console.log('website_homepage/main data:', JSON.stringify(doc.data(), null, 2));

  // Clean redundant store links if any
  const data = doc.data() || {};
  if (data.appDownload) {
    delete data.appDownload.playStoreUrl;
    delete data.appDownload.appStoreUrl;
  }
  delete data.play_store_url;
  delete data.app_store_url;

  await db.collection('website_homepage').doc('main').set(data);
  console.log('Cleaned website_homepage/main to enforce SoT invariant (store URLs belong solely in website_settings/general)');
}

checkHomepage().catch(console.error);
