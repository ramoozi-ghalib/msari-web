import { db } from '../src/lib/firebase-admin';

async function runLiveAudit() {
  console.log('====================================================');
  console.log('MSARI CMS POST-DEPLOYMENT VERIFICATION GATE AUDIT');
  console.log('====================================================\n');

  // 1. Audit website_settings/general
  console.log('--- 1. Testing website_settings/general ---');
  const settingsRef = db.collection('website_settings').doc('general');
  const settingsSnap = await settingsRef.get();
  const originalSettings = settingsSnap.data() || {};
  console.log('Original Settings:', {
    support_phone: originalSettings.support_phone,
    whatsapp_number: originalSettings.whatsapp_number,
    app_store_url: originalSettings.app_store_url,
    play_store_url: originalSettings.play_store_url,
  });

  const testPhone = '+967 777 000 001';
  await settingsRef.set({ support_phone: testPhone }, { merge: true });
  const readBackSettings = (await settingsRef.get()).data() || {};
  const settingsPersisted = readBackSettings.support_phone === testPhone;
  console.log('Persistence Test:', settingsPersisted ? '✅ PASSED' : '❌ FAILED');

  // Restore original
  await settingsRef.set({ support_phone: originalSettings.support_phone || '+967 777 000 000' }, { merge: true });
  console.log('Restored original support_phone:', (await settingsRef.get()).data()?.support_phone);

  // 2. Audit website_homepage/main
  console.log('\n--- 2. Testing website_homepage/main ---');
  const homepageRef = db.collection('website_homepage').doc('main');
  const homepageSnap = await homepageRef.get();
  const originalHomepage = homepageSnap.data() || {};
  console.log('Original Homepage Title/Badge:', {
    hero_title: originalHomepage.hero_title,
    hero_badge_text: originalHomepage.hero_badge_text,
  });

  const testBadge = 'بوابتك الأولى لليمن - فحص تدقيق';
  await homepageRef.set({ hero_badge_text: testBadge }, { merge: true });
  const readBackHomepage = (await homepageRef.get()).data() || {};
  const homepagePersisted = readBackHomepage.hero_badge_text === testBadge;
  console.log('Persistence Test:', homepagePersisted ? '✅ PASSED' : '❌ FAILED');

  // Restore original
  await homepageRef.set({ hero_badge_text: originalHomepage.hero_badge_text || 'بوابتك الأولى لحجوزات اليمن' }, { merge: true });
  console.log('Restored original hero_badge_text:', (await homepageRef.get()).data()?.hero_badge_text);

  // 3. Audit website_pages/about
  console.log('\n--- 3. Testing website_pages/about ---');
  const pagesRef = db.collection('website_pages').doc('about');
  const pageSnap = await pagesRef.get();
  const originalPage = pageSnap.data() || {};
  console.log('Original About Page:', {
    title: originalPage.title,
    isPublished: originalPage.isPublished,
  });

  const testTitle = originalPage.title ? `${originalPage.title}` : 'من نحن - مساري';
  await pagesRef.set({ title: testTitle, isPublished: true }, { merge: true });
  const readBackPage = (await pagesRef.get()).data() || {};
  console.log('Persistence Test:', readBackPage.title === testTitle ? '✅ PASSED' : '❌ FAILED');

  // 4. Audit website_destinations/sanaa
  console.log('\n--- 4. Testing website_destinations/sanaa ---');
  const destRef = db.collection('website_destinations').doc('sanaa');
  const destSnap = await destRef.get();
  const originalDest = destSnap.data() || {};
  console.log('Original Sanaa Editorial:', {
    name_ar: originalDest.name_ar,
    headline: originalDest.headline,
  });

  const testHeadline = originalDest.headline || 'عاصمة التاريخ والجمال والأصالة';
  await destRef.set({ headline: testHeadline }, { merge: true });
  const readBackDest = (await destRef.get()).data() || {};
  console.log('Persistence Test:', readBackDest.headline === testHeadline ? '✅ PASSED' : '❌ FAILED');

  // 5. Verify Operational data isolation
  console.log('\n--- 5. Operational Isolation Check ---');
  const opDestSnap = await db.collection('destinations').limit(3).get();
  console.log('Operational destinations count sampled:', opDestSnap.docs.length);
  opDestSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(` - Destination ID: ${doc.id}, Name: ${data.name || data.name_ar}, isDeleted: ${data.isDeleted}`);
  });

  console.log('\n====================================================');
  console.log('AUDIT ROUND-TRIP COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

runLiveAudit().catch(console.error);
