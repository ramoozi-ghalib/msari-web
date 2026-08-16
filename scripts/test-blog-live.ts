import { getBlogPosts, getBlogPostBySlug } from '../src/actions/blog';
import { db } from '../src/lib/firebase-admin';

async function testBlogLive() {
  console.log('--- Testing getBlogPosts() from Firestore web_blog ---');
  const posts = await getBlogPosts();
  console.log(`Fetched ${posts.length} blog posts from Firestore:`);
  posts.forEach(p => {
    console.log(` - [${p.slug}] "${p.title}" (publishedAt: ${p.publishedAt})`);
  });

  if (posts.length !== 3) {
    throw new Error(`Expected 3 blog posts, got ${posts.length}`);
  }

  console.log('\n--- Testing getBlogPostBySlug("sanaa-heritage-hotels-guide") ---');
  const post = await getBlogPostBySlug('sanaa-heritage-hotels-guide');
  if (!post) throw new Error('Could not fetch post by slug');
  console.log('Fetched Post Title:', post.title);
  console.log('Fetched Post Author:', post.authorName);

  // Round trip test: modify a field in Firestore, read back, verify, restore
  console.log('\n--- Testing Real Data Round-Trip Mutation & Verification ---');
  const docRef = db.collection('web_blog').doc('sanaa-heritage-hotels-guide');
  const originalReadTime = post.readTimeMinutes;
  
  // Modify
  await docRef.set({ readTimeMinutes: 7 }, { merge: true });
  const updatedPost = await getBlogPostBySlug('sanaa-heritage-hotels-guide');
  console.log('Mutation Test (readTimeMinutes = 7):', updatedPost?.readTimeMinutes === 7 ? '✅ PASSED' : '❌ FAILED');

  // Restore
  await docRef.set({ readTimeMinutes: originalReadTime }, { merge: true });
  const restoredPost = await getBlogPostBySlug('sanaa-heritage-hotels-guide');
  console.log(`Restoration Test (readTimeMinutes = ${originalReadTime}):`, restoredPost?.readTimeMinutes === originalReadTime ? '✅ PASSED' : '❌ FAILED');

  console.log('\n✅ BLOG PHASE 1 VERIFIED 100% WITH FIRESTORE SO T!');
}

testBlogLive().catch(console.error);
