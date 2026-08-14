import * as admin from 'firebase-admin';
import * as fs from 'fs';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function updateAdminPermissions() {
  console.log('=== UPDATING ADMIN ROLES & PERMISSIONS ===');
  const snap = await db.collection('admins').get();

  for (const doc of snap.docs) {
    const data = doc.data();
    console.log(`Processing: ${doc.id} (${data.email})`);

    // Ensure all website pages are in allowed_pages if supervisor, or upgrade to super_admin
    const currentAllowed = Array.isArray(data.allowed_pages) ? data.allowed_pages : [];
    const websitePages = [
      'website_homepage',
      'website_pages',
      'website_blog',
      'website_destinations',
      'website_settings',
    ];

    const mergedAllowed = Array.from(new Set([...currentAllowed, ...websitePages]));

    await doc.ref.update({
      allowed_pages: mergedAllowed,
      role: data.email === 'info@msari.net' || data.email === 'tab77x@gmail.com' ? 'super_admin' : (data.role || 'supervisor'),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Updated ${doc.id} (${data.email}) to role super_admin with full allowed_pages.`);
  }
}

updateAdminPermissions().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
