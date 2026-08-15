const admin = require('firebase-admin');
const fs = require('fs');

const keyPath = 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'msariapp-v2',
  });
}

const db = admin.firestore();

async function run() {
  console.log('🚀 Checking and seeding Blog posts & Destinations guides...');

  // Blog posts
  const blogPosts = [
    {
      slug: 'top-10-hotels-sanaa',
      title: 'أفضل 10 فنادق للإقامة في صنعاء لعام 2026',
      titleEn: 'Top 10 Hotels to Stay in Sanaa 2026',
      excerpt: 'دليل شامل لأرقى الفنادق وأماكن الإقامة التراثية والحديثة في العاصمة صنعاء مع الأسعار والمميزات.',
      category: 'فنادق وإقامة',
      authorName: 'فريق تحرير مساري',
      status: 'published',
      publishedAt: new Date(),
      readTimeMinutes: 5,
      coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
      tags: ['صنعاء', 'فنادق', 'سياحة', 'اليمن'],
      contentHtml: '<p>تتميز مدينة صنعاء بتنوع فريد في خيارات الإقامة يجمع بين الفخامة العصرية والأصالة التراثية الفريدة في صنعاء القديمة...</p>',
    },
    {
      slug: 'aden-tourism-guide-2026',
      title: 'دليل السياحة في عدن: الشواطئ، المعالم، وأفضل المطاعم',
      titleEn: 'Aden Travel & Tourism Guide 2026',
      excerpt: 'استكشف عروس البحر العربي، من صهاريج عدن التاريخية وقلعة صيرة إلى أجمل شواطئ خليج الفيل وجولد مور.',
      category: 'أدلة الوجهات',
      authorName: 'أحمد السقاف',
      status: 'published',
      publishedAt: new Date(),
      readTimeMinutes: 7,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      tags: ['عدن', 'شواطئ', 'سياحة', 'معالم'],
      contentHtml: '<p>تعد مدينة عدن الساحلية واحدة من أجمل الوجهات السياحية في جنوب شبه الجزيرة العربية بفضل شواطئها الخلابة وتاريخها العريق...</p>',
    },
    {
      slug: 'socotra-travel-tips',
      title: 'كل ما تحتاج معرفته قبل السفر إلى جزيرة سقطرى العذراء',
      titleEn: 'Ultimate Travel Guide to Socotra Island',
      excerpt: 'نصائح مهمة للمسافرين إلى سقطرى، مواسم الزيارة، كيفية الوصول، وأندر النباتات والطيور في الجزيرة.',
      category: 'نصائح السفر',
      authorName: 'مريم العدني',
      status: 'published',
      publishedAt: new Date(),
      readTimeMinutes: 6,
      coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop',
      tags: ['سقطرى', 'طبيعة', 'مغامرات', 'اليمن'],
      contentHtml: '<p>تعتبر جزيرة سقطرى جوهرة الطبيعة اليمنية وموقع تراث عالمي فريد يضم شجرة دم الأخوين النادرة وشواطئ بيضاء بكر...</p>',
    },
  ];

  for (const post of blogPosts) {
    await db.collection('web_blog').doc(post.slug).set(post, { merge: true });
    console.log(`✅ Blog: ${post.slug}`);
  }

  // Destinations Guides
  const destinations = [
    {
      slug: 'sanaa',
      cityId: 'sanaa',
      cityNameAr: 'صنعاء',
      cityNameEn: "Sana'a",
      tagline: 'مدينة التاريخ والحضارة العريقة وعاصمة التراث اليمني الأصيل',
      heroImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
      overview: 'تعد صنعاء واحدة من أقدم المدن المأهولة في العالم، وتتميز بطرازها المعماري الفريد في صنعاء القديمة المدرجة على قائمة التراث العالمي لليونسكو وأسواقها الشعبية العريقة مثل سوق الملح والجامع الكبير.',
      landmarks: [
        { name: 'صنعاء القديمة وباب اليمن', description: 'رمز المدينة التاريخي وتحفة معمارية بنيت بالآجر والجص المزين بالقمريات الملونة.' },
        { name: 'دار الحجر في وادي ظهر', description: 'قصر صخري مذهل يتربع على قمة صخرة شاهقة في وادي ظهر الخصيب.' },
        { name: 'جامع الصالح', description: 'أحد أكبر وأجمل الصروح المعمارية الإسلامية الحديثة في اليمن والمنطقة.' },
      ],
      isPublished: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      slug: 'aden',
      cityId: 'aden',
      cityNameAr: 'عدن',
      cityNameEn: 'Aden',
      tagline: 'عروس البحر العربي وثغر اليمن الباسم بشواطئها الساحرة وتاريخها التجاري',
      heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      overview: 'تقع عدن على شبه جزيرة بركانية تشرف على خليج عدن، وتتميز بمينائها الطبيعي العالمي وتاريخها التجاري الحافل إضافة إلى شواطئها الرملية الذهبية ومعالمها التاريخية كصهاريج عدن وقلعة صيرة.',
      landmarks: [
        { name: 'صهاريج الطويلة التاريخية', description: 'نظام هندسي مائي عريق محفور في صخور جبل شمسان يعود لآلاف السنين.' },
        { name: 'قلعة صيرة التاريخية', description: 'حصن أثري منيع على جزيرة صيرة البركانية يوفر إطلالة بانورامية على خليج عدن.' },
        { name: 'ساحل جولد مور وخليج الفيل', description: 'من أجمل الشواطئ الساحلية لممارسة السباحة والأنشطة البحرية والاسترخاء.' },
      ],
      isPublished: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const dest of destinations) {
    await db.collection('website_destinations').doc(dest.slug).set(dest, { merge: true });
    console.log(`✅ Destination: ${dest.slug}`);
  }

  console.log('🎉 Blog and Destinations synchronized successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
