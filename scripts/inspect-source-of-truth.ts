/**
 * scripts/inspect-source-of-truth.ts
 *
 * Deep verification of Firestore documents:
 * - website_settings/general
 * - website_homepage/main
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account key not found at ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function main() {
  console.log('====================================================');
  console.log('🔍 FIRESTORE SOURCE-OF-TRUTH DEEP INSPECTION');
  console.log('====================================================\n');

  // 1. Inspect website_settings/general
  console.log('1. Fetching website_settings/general...');
  const settingsDoc = await db.collection('website_settings').doc('general').get();
  console.log(`- Exists: ${settingsDoc.exists}`);
  if (settingsDoc.exists) {
    console.log('- Full Verbatim Payload:');
    console.log(JSON.stringify(settingsDoc.data(), null, 2));
  }

  console.log('\n----------------------------------------------------\n');

  // 2. Inspect website_homepage/main
  console.log('2. Fetching website_homepage/main...');
  const homeDoc = await db.collection('website_homepage').doc('main').get();
  console.log(`- Exists: ${homeDoc.exists}`);
  if (homeDoc.exists) {
    console.log('- Full Verbatim Payload:');
    console.log(JSON.stringify(homeDoc.data(), null, 2));
  }

  console.log('\n----------------------------------------------------\n');
  console.log('====================================================');
  console.log('✅ SOURCE OF TRUTH INSPECTION COMPLETED');
  console.log('====================================================');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error during inspection:', err);
  process.exit(1);
});
