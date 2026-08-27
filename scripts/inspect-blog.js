const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const admin = require('firebase-admin');
if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  } else {
    admin.initializeApp({ projectId });
  }
}

const db = admin.firestore();

async function inspect() {
  const snap = await db.collection('web_blog').get();
  console.log('Total blog posts in web_blog:', snap.size);
  snap.forEach(doc => {
    const d = doc.data();
    console.log('--- POST:', doc.id, '---');
    console.log('Title:', d.title);
    console.log('Slug:', d.slug);
    console.log('Excerpt:', d.excerpt);
    console.log('Content sample:', (d.contentHtml || d.content || '').substring(0, 200));
  });
}

inspect().catch(console.error);
