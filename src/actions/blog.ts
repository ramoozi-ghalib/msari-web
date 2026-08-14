'use server';

import { db } from '@/lib/firebase-admin';
import type { BlogPost } from '@/types';

// Fallback neutral SEO travel & tourism articles for Yemen destinations
const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'best-hotels-aden-sea-view',
    title: 'دليل السياحة والمعالم التاريخية في مدينة عدن',
    titleEn: 'Travel & Heritage Guide to Aden City',
    excerpt: 'استكشف أهم المعالم السياحية والشواطئ الساحرة في مدينة عدن، من صهاريج عدن التاريخية إلى قلعة صيرة وساحل الجولدن مور.',
    excerptEn: 'Discover the top historical landmarks and beaches in Aden, from Sira Fortress to Tawahi.',
    content: `
      <h2>عدن: عروس البحر العربي ودرة السياحة</h2>
      <p>تتميز مدينة عدن بموقعها الجغرافي الفريد الذي يجمع بين التضاريس البركانية والشواطئ الرملية الساحرة. تعد عدن من أعرق المدن التاريخية والتجارية على خليج عدن والبحر العربي.</p>
      
      <h3>أبرز المعالم السياحية والتاريخية في عدن:</h3>
      <ul>
        <li><strong>صهاريج عدن (Cisterns of Tawahi):</strong> إحدى أعجب المنشآت الهندسية التاريخية المخصصة لتجميع مياه الأمطار في وادي الطويلة.</li>
        <li><strong>قلعة صيرة البركانية:</strong> من أبرز القلاع العسكرية التاريخية المطلة على البحر والتي شهدت أحداثاً تاريخية جليلة.</li>
        <li><strong>ساحل أبين والشواطئ الساحلية:</strong> تمتد الشواطئ الرملية على مساحات واسعة وتعد الخيار المثالي للعائلات وهواة الاستجمام.</li>
        <li><strong>منارة عدن التاريخية:</strong> معلم أثري شامخ في قلب كريتر يعبر عن التراث المعماري الأصيل.</li>
      </ul>

      <h3>نصائح للمسافرين والزوار:</h3>
      <p>يُفضل زيارة الشواطئ خلال أوقات الشروق والغروب للاستمتاع بالأجواء المعتدلة، واستغلال الجولات في الأسوق الشعبية القديمة في كريتر والتواهي.</p>
    `,
    contentEn: 'Aden is renowned for its coastal beauty and historic landmarks.',
    coverImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600',
    authorName: 'فريق تحرير مساري',
    category: 'أدلة السفر',
    categoryEn: 'Travel Guides',
    tags: ['سياحة عدن', 'معالم تاريخية', 'سفر اليمن', 'شواطئ عدن'],
    readTimeMinutes: 5,
    publishedAt: '2026-07-20T10:00:00Z',
    isPublished: true,
  },
  {
    id: '2',
    slug: 'sanaa-heritage-hotels-guide',
    title: 'سحر المعمار والتاريخ في مدينة صنعاء القديمة',
    titleEn: 'Heritage & Architecture Guide to Old Sanaa',
    excerpt: 'تعرف على الطراز المعماري الفريد لصنعاء القديمة المسجلة ضمن قائمة التراث العالمي لليونسكو وأبرز أسواقها التاريخية.',
    excerptEn: 'Explore the UNESCO heritage site of Old Sanaa, its unique architecture, and ancient souks.',
    content: `
      <h2>صنعاء القديمة: متحف حي للمعمار اليمني</h2>
      <p>صنعاء القديمة، بما تحويه من طراز معماري يعود لآلاف السنين وتفاصيل الياجور والقمريات الملونة، تمنح الزائر شعوراً بالسفر عبر الزمن.</p>

      <h3>أهم المعالم والمزارات السياحية في صنعاء:</h3>
      <ul>
        <li><strong>باب اليمن والأسواق القديمة:</strong> البوابة التاريخية العريقة التي تقودك لأكثر من 40 سوقاً حرفياً وتراثياً.</li>
        <li><strong>دار الحجر (وادي ظهر):</strong> التحفة المعمارية الشهيرة المبنية على قمة صخرية غرامية، وتعد رمزاً سياحياً لليمن.</li>
        <li><strong>الجامع الكبير بصنعاء:</strong> أحد أوائل المساجد في الإسلام ويمتاز ببنائه التاريخي وعمدته الأثرية.</li>
      </ul>
    `,
    contentEn: 'Sanaa offers unique traditional architecture and historic landmarks.',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600',
    authorName: 'رمزي غالب',
    category: 'وجهات سياحية',
    categoryEn: 'Destinations',
    tags: ['صنعاء القديمة', 'دار الحجر', 'تراث يمني', 'سياحة'],
    readTimeMinutes: 4,
    publishedAt: '2026-07-15T12:00:00Z',
    isPublished: true,
  },
  {
    id: '3',
    slug: 'mukalla-beach-resorts-2026',
    title: 'دليل السياحة في المكلا وشبام حضرموت',
    titleEn: 'Tourism Guide to Mukalla & Shibam Hadramout',
    excerpt: 'اكتشف جمال خور المكلا، العمارة الطينية النادرة في شبام حضرموت، وقصور السلطان القعيطي التاريخية.',
    excerptEn: 'Plan your travel to Mukalla and Shibam Hadramout with our complete heritage guide.',
    content: `
      <h2>حضرموت: الأصالة والتاريخ</h2>
      <p>تعتبر محافظة حضرموت ومدينة المكلا من أهدأ وأجمل الوجهات السياحية، وتتميز بتنوع طبيعي بين الشواطئ والمحافات المعمارية النادرة.</p>

      <h3>أبرز مزارات المكلا وحضرموت:</h3>
      <ul>
        <li><strong>خور المكلا:</strong> كورنيش ساحري يمر في قلب المدينة وتحيط به القوارب والمقاهي.</li>
        <li><strong>شبام حضرموت (ناطحات السحاب الطينية):</strong> أول مدينة ناطحات سحاب في العالم مبنية بالكامل من الطين واللبن.</li>
        <li><strong>قصر السلطان القعيطي:</strong> متحف تاريخي يجسد فترة الحكم المعظمة والتراث الحضرمي الاصيل.</li>
      </ul>
    `,
    contentEn: 'Hadramout offers rich heritage sites and natural coastal beauty.',
    coverImage: 'https://images.unsplash.com/photo-1576403986427-bc0c12e73ce4?auto=format&fit=crop&q=80&w=1600',
    authorName: 'فريق مساري',
    category: 'عروض ونصائح',
    categoryEn: 'Deals & Tips',
    tags: ['المكلا', 'حضرموت', 'شبام', 'سياحة اليمن'],
    readTimeMinutes: 6,
    publishedAt: '2026-07-10T09:30:00Z',
    isPublished: true,
  },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    let snap = await db.collection('web_blog').get();
    if (snap.empty) {
      snap = await db.collection('blog_posts').get();
    }

    if (!snap || snap.empty) {
      return sampleBlogPosts;
    }

    const posts = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug || doc.id,
        title: data.title || '',
        titleEn: data.titleEn || '',
        excerpt: data.excerpt || '',
        excerptEn: data.excerptEn || '',
        content: data.contentHtml || data.content || '',
        contentEn: data.contentEn || '',
        coverImage: data.coverImage || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600',
        authorName: data.authorName || 'مساري',
        authorAvatar: data.authorAvatar || '',
        category: data.category || data.categoryId || 'عام',
        categoryEn: data.categoryEn || 'General',
        tags: data.tags || [],
        readTimeMinutes: data.readTimeMinutes || 5,
        publishedAt: data.publishedAt || data.updatedAt || new Date().toISOString(),
        isPublished: data.status ? data.status === 'published' : (data.isPublished !== undefined ? data.isPublished : true),
      };
    }).filter(p => p.isPublished);

    if (posts.length === 0) {
      return sampleBlogPosts;
    }

    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return posts;
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    return sampleBlogPosts;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // 1. Direct Document ID lookup (Atomic Document ID = slug strategy)
    const directDoc = await db.collection('web_blog').doc(slug).get();
    let doc = directDoc.exists ? directDoc : null;

    // 2. Query fallback if not found by direct doc ID
    if (!doc) {
      const snap = await db.collection('web_blog').where('slug', '==', slug).limit(1).get();
      if (!snap.empty) {
        doc = snap.docs[0];
      }
    }

    // 3. Fallback to legacy blog_posts collection
    if (!doc) {
      const legacySnap = await db.collection('blog_posts').where('slug', '==', slug).limit(1).get();
      if (!legacySnap.empty) {
        doc = legacySnap.docs[0];
      }
    }

    // 4. In-memory sample fallback
    if (!doc) {
      const match = sampleBlogPosts.find(p => p.slug === slug);
      return match || null;
    }

    const data = doc.data() || {};
    // Canonical status check: status is canonical SoT, isPublished is derived
    const isPublished = data.status ? data.status === 'published' : (data.isPublished !== undefined ? data.isPublished : true);
    if (!isPublished) {
      return null;
    }

    return {
      id: doc.id,
      slug: data.slug || doc.id,
      title: data.title || '',
      titleEn: data.titleEn || '',
      excerpt: data.excerpt || '',
      excerptEn: data.excerptEn || '',
      content: data.contentHtml || data.content || '',
      contentEn: data.contentEn || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600',
      authorName: data.authorName || 'مساري',
      authorAvatar: data.authorAvatar || '',
      category: data.category || data.categoryId || 'عام',
      categoryEn: data.categoryEn || 'General',
      tags: data.tags || [],
      readTimeMinutes: data.readTimeMinutes || 5,
      publishedAt: data.publishedAt || data.updatedAt || new Date().toISOString(),
      isPublished: true,
    };
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    const match = sampleBlogPosts.find(p => p.slug === slug);
    return match || null;
  }
}
