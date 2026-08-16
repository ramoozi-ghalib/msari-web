/**
 * scripts/migrate-cms-content.ts
 *
 * Idempotent migration & seed script for Website Management Domain.
 * Seeds real curated content into Firestore without touching Operational Core Data.
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// 1. Initialize Firebase Admin
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';

if (!admin.apps.length) {
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('[Migration] ✅ Connected to Firebase Admin with serviceAccountKey.json');
  } else {
    console.error('[Migration] ❌ Service account key not found at:', keyPath);
    process.exit(1);
  }
}

const db = admin.firestore();

interface MigrationStats {
  discovered: number;
  created: number;
  skipped: number;
  updated: number;
  preserved: number;
  failed: number;
}

const stats: MigrationStats = {
  discovered: 0,
  created: 0,
  skipped: 0,
  updated: 0,
  preserved: 0,
  failed: 0,
};

async function seedDocumentIfNotExists(
  collectionName: string,
  docId: string,
  data: Record<string, any>,
  description: string
) {
  stats.discovered++;
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      const existingData = snapshot.data();
      if (existingData && Object.keys(existingData).length > 2) {
        console.log(`[SKIP/PRESERVE] ${collectionName}/${docId} (${description}) exists. Preserving.`);
        stats.skipped++;
        stats.preserved++;
        return;
      }
    }

    const payload = {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      migrationSource: 'msari_web_seed_phase0',
    };

    await docRef.set(payload, { merge: true });
    console.log(`[CREATE] ✅ Successfully created ${collectionName}/${docId} (${description})`);
    stats.created++;
  } catch (error) {
    console.error(`[FAIL] ❌ Error processing ${collectionName}/${docId}:`, error);
    stats.failed++;
  }
}

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 STARTING PHASE 0: CMS CONTENT MIGRATION & SEEDING');
  console.log('====================================================\n');

  // ── 1. website_settings/general ──────────────────────────────────────────
  await seedDocumentIfNotExists(
    'website_settings',
    'general',
    {
      whatsappNumber: '967733644466',
      supportPhone: '+967 733 644 466',
      infoEmail: 'info@msari.net',
      privacyEmail: 'privacy@msari.net',
      legalEmail: 'legal@msari.net',
      workingHoursAr: 'يومياً ٨ ص — ١٠ م',
      workingHoursEn: 'Daily 8 AM — 10 PM',
      headquartersAr: 'صنعاء وعدن — اليمن',
      headquartersEn: "Sana'a & Aden — Yemen",
      playStoreUrl: 'https://play.google.com/store/apps/details?id=net.msari.app',
      appStoreUrl: 'https://apps.apple.com',
      socialLinks: {
        facebook: 'https://facebook.com/msari.travel',
        instagram: 'https://instagram.com/msari.travel',
        twitter: 'https://twitter.com/msari_travel',
      },
    },
    'Website General Settings'
  );

  // ── 2. website_homepage/main ─────────────────────────────────────────────
  await seedDocumentIfNotExists(
    'website_homepage',
    'main',
    {
      hero: {
        titleAr: 'اكتشف أجمل وجهات اليمن\nمع مساري',
        subtitleAr: 'منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران وتأجير السيارات بسهولة وأمان',
        backgroundImageUrl: '/images/hero-bg.jpg',
        stats: [
          { value: '5000+', labelAr: 'مستخدم سعيد', color: '#23096E' },
          { value: '50+', labelAr: 'فندق', color: '#23096E' },
          { value: '10', labelAr: 'مدن', color: '#FF3B30' },
        ],
      },
      whyMsari: {
        sectionTitleAr: 'المنصة التي تثق بها',
        badgeAr: '✨ لماذا مساري؟',
        partnerCta: {
          titleAr: 'هل أنت مزود فندق أو شريك تقني؟ انضم لشبكة مساري',
          buttonTextAr: 'انضم كشريك',
          href: '/developers',
        },
      },
      appDownload: {
        titleAr: 'حمّل تطبيق مساري',
        subtitleAr: 'تجربة سفر متكاملة في جيبك — احجز، تابع حجوزاتك، واستفد من عروض التطبيق الحصرية',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=net.msari.app',
        appStoreUrl: 'https://apps.apple.com',
      },
    },
    'Homepage Main Editorial Content'
  );

  // ── 3. website_pages/about ───────────────────────────────────────────────
  await seedDocumentIfNotExists(
    'website_pages',
    'about',
    {
      type: 'content_page',
      slug: 'about',
      title: 'من نحن',
      titleEn: 'About Us',
      lastUpdatedText: 'مارس ٢٠٢٦',
      status: 'published',
      isPublished: true,
      hero: {
        badge: 'منصة السفر الأولى في اليمن',
        title: 'من نحن',
        subtitle: 'مساري — رفيقك في كل سفرة، نوفر لك تجربة سفر لا مثيل لها داخل اليمن وحول العالم.',
      },
      stats: [
        { value: '+50', label: 'فندق يمني' },
        { value: '+10', label: 'مدينة مغطاة' },
        { value: '4.8', label: 'تقييم المستخدمين' },
        { value: '٢٤/٧', label: 'دعم متواصل' },
      ],
      story: {
        badge: 'قصتنا',
        title: 'بدأنا بحلم بسيط: تسهيل السفر لكل يمني',
        paragraphs: [
          'مساري نشأت من رحم الحاجة الحقيقية. لاحظنا أن اليمني يجد صعوبة في إيجاد أسعار موثوقة للفنادق، وحجز تذاكر الطيران، والحصول على سيارات نقل بجودة عالية — كل هذا في مكان واحد.',
          'اليوم، نفخر بخدمة مئات المسافرين شهرياً عبر شبكة من أفضل الفنادق اليمنية والخدمات السياحية الموثوقة.',
        ],
        image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1200&auto=format&fit=crop',
        locationText: 'صنعاء وعدن، اليمن',
      },
      values: [
        { icon: 'Shield', title: 'الثقة والأمان', desc: 'نضمن لك تجربة حجز آمنة وموثوقة مع أفضل الفنادق والمزودين المعتمدين.' },
        { icon: 'Zap', title: 'السرعة والسهولة', desc: 'احجز في دقائق مع واجهة سهلة الاستخدام مصممة خصيصاً للمستخدم العربي.' },
        { icon: 'HeartHandshake', title: 'دعم متواصل', desc: 'فريق دعم متاح عبر واتساب لمساعدتك في أي وقت قبل وأثناء سفرك.' },
        { icon: 'Star', title: 'أفضل الأسعار', desc: 'نضمن لك أفضل الأسعار مع عروض حصرية لا تجدها في أي مكان آخر.' },
      ],
      team: [
        { name: 'فريق التطوير', role: 'تقنية المعلومات', emoji: '💻' },
        { name: 'فريق العمليات', role: 'إدارة الحجوزات', emoji: '📋' },
        { name: 'فريق الدعم', role: 'خدمة العملاء', emoji: '🎧' },
      ],
    },
    'About Page'
  );

  // ── 4. website_pages/privacy ─────────────────────────────────────────────
  await seedDocumentIfNotExists(
    'website_pages',
    'privacy',
    {
      type: 'legal_page',
      slug: 'privacy',
      title: 'سياسة الخصوصية',
      titleEn: 'Privacy Policy',
      lastUpdatedText: 'مارس ٢٠٢٦',
      status: 'published',
      isPublished: true,
      intro: 'تعرف على كيفية جمع واستخدام وحماية بياناتك الشخصية على منصة مساري لخدمات السفر.',
      sections: [
        {
          id: 'collection',
          title: '١. المعلومات التي نجمعها',
          content: [
            'المعلومات الشخصية التي تقدمها عند الحجز (الاسم، رقم الهاتف، البريد الإلكتروني)',
            'بيانات الحجز والرحلات التي تجريها عبر المنصة',
            'معلومات تقنية مثل عنوان IP ونوع المتصفح لتحسين تجربتك',
            'ملفات تعريف الارتباط (Cookies) لتسريع وتحسين أداء الموقع',
          ],
        },
        {
          id: 'usage',
          title: '٢. كيف نستخدم معلوماتك',
          content: [
            'معالجة وتأكيد حجوزاتك مع الفنادق والموردين',
            'التواصل معك بشأن حجوزاتك عبر واتساب والبريد الإلكتروني',
            'إرسال عروض وتخفيضات حصرية (يمكنك إلغاء الاشتراك في أي وقت)',
            'تحسين خدماتنا بناءً على تجربتك وملاحظاتك',
            'الامتثال لالتزاماتنا القانونية',
          ],
        },
        {
          id: 'protection',
          title: '٣. حماية بياناتك',
          content: [
            'نستخدم بروتوكول HTTPS لتشفير جميع البيانات المنقولة',
            'لا نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية دون إذنك',
            'نشارك بيانات الحجز الضرورية فقط مع الفنادق والمزودين المعتمدين',
            'يحق لنا الكشف عن معلوماتك إذا طلب ذلك قانونياً',
          ],
        },
        {
          id: 'rights',
          title: '٤. حقوقك',
          content: [
            'حق الوصول: يمكنك طلب نسخة من بياناتك الشخصية المحفوظة لدينا',
            'حق التصحيح: يمكنك تصحيح أي بيانات غير دقيقة',
            'حق الحذف: يمكنك طلب حذف بياناتك مع عدم المساس بحجوزاتك الفعلية',
            'حق إلغاء الاشتراك: يمكنك إلغاء تلقي الرسائل التسويقية في أي وقت',
          ],
        },
        {
          id: 'cookies',
          title: '٥. ملفات تعريف الارتباط (Cookies)',
          content: [
            'نستخدم الكوكيز لتذكر تفضيلاتك وتسهيل عملية تسجيل الدخول',
            'يمكنك تعطيل الكوكيز من إعدادات متصفحك، لكن قد يؤثر ذلك على بعض الميزات',
          ],
        },
        {
          id: 'updates',
          title: '٦. التعديلات على هذه السياسة',
          content: [
            'قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في خدماتنا أو القوانين المعمول بها',
            'سيتم إعلامك بالتغييرات الجوهرية عبر إشعار على الموقع أو البريد الإلكتروني',
          ],
        },
        {
          id: 'contact',
          title: '٧. تواصل معنا',
          content: [
            'لأي استفسارات حول سياسة الخصوصية، يرجى التواصل عبر: privacy@msari.net أو واتساب: +967 733 644 466',
          ],
        },
      ],
    },
    'Privacy Policy Page'
  );

  // ── 5. website_pages/terms ───────────────────────────────────────────────
  await seedDocumentIfNotExists(
    'website_pages',
    'terms',
    {
      type: 'legal_page',
      slug: 'terms',
      title: 'شروط الاستخدام',
      titleEn: 'Terms of Service',
      lastUpdatedText: 'مارس ٢٠٢٦',
      status: 'published',
      isPublished: true,
      intro: 'يرجى قراءة هذه الشروط بعناية قبل استخدام منصة مساري لخدمات السفر والحجز في اليمن.',
      sections: [
        {
          id: 'acceptance',
          title: '١. قبول الشروط',
          content: [
            'باستخدامك لمنصة مساري (msari.net)، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.',
          ],
        },
        {
          id: 'pricing',
          title: '٢. الحجوزات والأسعار',
          content: [
            'جميع الأسعار المعروضة على المنصة بالدولار الأمريكي (USD) ما لم يُشر لغير ذلك. الأسعار قابلة للتغيير وتعتمد على التوفر. الحجز لا يُعتبر مؤكداً حتى تتلقى تأكيداً رسمياً من فريقنا.',
          ],
        },
        {
          id: 'cancellation',
          title: '٣. الإلغاء والاسترداد',
          content: [
            'سياسة الإلغاء تختلف من فندق لآخر وستظهر بوضوح قبل إتمام الحجز. عموماً، الإلغاء قبل ٢٤ ساعة من موعد الوصول يستحق استرداداً كاملاً. الإلغاء المتأخر قد يخضع لرسوم جزئية أو عدم استرداد وفقاً لسياسة الفندق.',
          ],
        },
        {
          id: 'responsibilities',
          title: '٤. مسؤوليات المستخدم',
          content: [
            'أنت مسؤول عن التحقق من صحة بيانات الحجز قبل التأكيد. أنت مسؤول عن امتلاك الوثائق الرسمية المطلوبة للسفر. يجب عدم استخدام المنصة لأي أغراض غير مشروعة.',
          ],
        },
        {
          id: 'liability',
          title: '٥. حدود المسؤولية',
          content: [
            'مساري وسيط بينك وبين مزودي الخدمات (الفنادق وشركات النقل). لا تتحمل مساري مسؤولية أي خلاف مباشر مع مزودي الخدمات، لكننا ملتزمون بمساعدتك في حل أي مشكلة قدر المستطاع.',
          ],
        },
        {
          id: 'ip',
          title: '٦. الملكية الفكرية',
          content: [
            'جميع محتويات المنصة (التصميم، الشعار، النصوص، الصور) هي ملكية حصرية لمساري ومحمية بقوانين الملكية الفكرية. لا يُسمح بإعادة نشر أو نسخ أي محتوى دون إذن خطي مسبق.',
          ],
        },
        {
          id: 'law',
          title: '٧. القانون الواجب التطبيق',
          content: [
            'تخضع هذه الشروط لقوانين جمهورية اليمن. أي نزاع ينشأ عن استخدام المنصة يُحل أولاً بالتفاوض الودي، ثم بالتحكيم إذا لزم الأمر.',
          ],
        },
        {
          id: 'changes',
          title: '٨. التعديلات على الشروط',
          content: [
            'نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إعلامك بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار على الموقع. استمرارك في استخدام المنصة بعد التعديل يمثل قبولك للشروط الجديدة.',
          ],
        },
      ],
    },
    'Terms of Service Page'
  );

  // ── 6. website_pages/developers ──────────────────────────────────────────
  await seedDocumentIfNotExists(
    'website_pages',
    'developers',
    {
      type: 'developers_page',
      slug: 'developers',
      title: 'بوابة المطورين',
      titleEn: 'B2B API Portal',
      status: 'published',
      isPublished: true,
      hero: {
        badge: 'B2B API Portal',
        title: 'اربط نظامك مع مخزون أكبر شبكة سفر في اليمن',
        subtitle: 'نوفر واجهة مساري البرمجية (API) للتطبيقات، مواقع السفر، الوكالات، والشركات لاستعراض وحجز الفنادق والخدمات السياحية بسلاسة تامة.',
      },
      features: [
        { icon: 'Zap', title: 'تكامل سريع وبسيط', desc: 'RESTful API مع وثائق تفاعلية جاهزة وأمثلة كود بلغات متعددة.' },
        { icon: 'Server', title: 'بيانات لحظية 100%', desc: 'تحديث فوري لأسعار الغرف وتوافر الفنادق وحالة الحجوزات.' },
        { icon: 'ShieldCheck', title: 'أمان وموثوقية عالية', desc: 'مفاتيح API مشفرة، وتحديد معدل الطلبات (Rate Limiting) لحماية خدماتك.' },
        { icon: 'MessageSquare', title: 'دعم فني مخصص', desc: 'فريق هندسي متخصص لمساعدتك في الربط خطوة بخطوة عبر قناة دعم مباشرة.' },
      ],
      plans: [
        {
          id: 'starter',
          name: 'الخطة الأساسية (Starter)',
          price: 'مجاناً',
          description: 'مثالية للمطورين والمشاريع الناشئة لبدء التجربة والربط التجريبي.',
          features: ['استعراض بيانات الفنادق والمدن', '١,٠٠٠ طلب شهرياً', 'بيئة تجريبية (Sandbox)', 'دعم عبر البريد الإلكتروني'],
          popular: false,
        },
        {
          id: 'business',
          name: 'خطة الأعمال (Business)',
          price: 'حسب الاستخدام',
          description: 'مخصصة لوكالات السفر والتطبيقات التي تحتاج حجزاً وتأكيداً مباشراً.',
          features: ['حجز وتأكيد الغرف الفوري', 'طلب غير محدود للـ API', 'عمولات مخفضة وشاملة', 'دعم فني عبر واتساب ٢٤/٧'],
          popular: true,
        },
        {
          id: 'enterprise',
          name: 'خطة الشركات (Enterprise)',
          price: 'اتفاقية مخصصة',
          description: 'للشركات الكبرى ومنصات السفر الإقليمية التي تطلب تكاملاً مخصصاً.',
          features: ['ربط مباشر مع أنظمة الـ ERP و GDS', 'خوادم مخصصة ذات استجابة فائقة', 'مدير حساب تقني مخصص', 'عقود مستوى الخدمة (SLA 99.9%)'],
          popular: false,
        },
      ],
      faq: [
        { q: 'كيف أحصل على مفتاح API؟', a: 'تواصل معنا عبر واتساب وسيتم تزويدك بمفتاح تجريبي وبيئة Sandbox خلال دقائق.' },
        { q: 'هل الـ API يدعم تأكيد الحجز الفوري؟', a: 'نعم، في خطة الأعمال والشركات يتم تأكيد الحجز وخصم التوفر لحظياً.' },
        { q: 'ما هي صيغة البيانات المعتمدة؟', a: 'البيانات تُرسل وتُستقبل بصيغة JSON القياسية عبر بروتوكول HTTPS.' },
      ],
    },
    'Developers Page'
  );

  // ── 7. website_destinations (Curated Destination Guides) ─────────────────
  const destinationsSeed = [
    {
      slug: 'sanaa',
      cityId: 'sanaa',
      tagline: 'مدينة سام وعروس المباني الطينية التاريخية المسجلة في اليونسكو',
      heroImage: '/images/destinations/sanaa.jpg',
      overview: {
        history: 'تُعد صنعاء واحدة من أقدم المدن المأهولة في العالم، وتُعرف تاريخياً بـ "مدينة سام بن نوح". تتميز بعمارتها الفريدة ذات الأبراج الطينية والقمريات الزجاجية الملونة التي يعود تاريخ بعضها إلى آلاف السنين، وتصنفها اليونسكو ضمن مواقع التراث العالمي.',
        climate: 'تتمتع صنعاء بمناخ معتدل ولطيف على مدار العام بفضل موقعها الجغرافي المرتفع في السراة (2300 متر فوق سطح البحر)، حيث تكون صيفاً دافئة ومعتدلة وشتائاً باردة وجافة.',
        culture: 'تشتهر صنعاء بأسواقها القديمة مثل سوق الملح والفضة، وصناعة الجنابي اليمانية الأصيلة، والمجالس الفلكلورية الصنعانية العريقة التي تزخر بالفن والألحان التراثية.',
        bestTimeToVisit: 'من سبتمبر إلى أبريل، حيث الجو لطيف ومثالي للتجول والاستكشاف.',
      },
      landmarks: [
        {
          id: 'dar_al_hajar',
          name: 'دار الحجر (قصر الصخرة)',
          nameEn: 'Dar Al-Hajar',
          category: 'معماري',
          image: '/images/destinations/dar_al_hajar.jpg',
          description: 'تحفة معمارية فريدة شُيدت فوق صخرة غراميتية عالية في وادي ظهر، وتعد رمزاً هندسياً يمنياً شهيراً في العالم.',
          locationText: 'وادي ظهر - شمال صنعاء',
        },
        {
          id: 'old_sanaa',
          name: 'مدينة صنعاء القديمة وباب اليمن',
          nameEn: 'Old City of Sanaa & Bab Al-Yemen',
          category: 'تاريخي',
          image: '/images/destinations/sanaa.jpg',
          description: 'متحف حي مفتوح يضم آلاف المنازل الطينية التراثية التي يتجاوز عمرها قروناً من الزمان وأسواقاً يمنية عريقة.',
          locationText: 'قلب العاصمة صنعاء',
        },
      ],
      isPublished: true,
      status: 'published',
    },
    {
      slug: 'aden',
      cityId: 'aden',
      tagline: 'ثغر اليمن الباسم وعاصمة الشواطئ والموانئ الساحرة',
      heroImage: '/images/destinations/aden.jpg',
      overview: {
        history: 'مدينة تاريخية عريقة تقع على فوهة بركان خامد، وتعد أحد أقدم الموانئ الطبيعية في شبه الجزيرة العربية، وشهدت ازدهاراً تجارياً هائلاً عبر مختلف العصور.',
        climate: 'مناخ ساحلي دافئ واستوائي شتاءً ولطيف مع نسمات البحر المنعشة على مدار العام.',
        culture: 'تتميز عدن بتنوع ثقافي فريد وتراث موسيقي ومطبخ بحري شهير بأسماك الصيد الطازجة والزربيان العدني الأصيل.',
        bestTimeToVisit: 'من نوفمبر إلى مارس، حيث تكون درجات الحرارة معتدلة ومثالية للأنشطة البحرية.',
      },
      landmarks: [
        {
          id: 'aden_cisterns',
          name: 'صهاريج عدن التاريخية',
          nameEn: 'Cisterns of Tawila',
          category: 'تاريخي',
          image: '/images/destinations/aden.jpg',
          description: 'أحد أعظم الأنظمة الهندسية القديمة لتجميع مياه الأمطار في وادي الطويلة المنحوت بين الجبال البركانية.',
          locationText: 'كريتر - عدن',
        },
        {
          id: 'sira_fortress',
          name: 'قلعة صيرة',
          nameEn: 'Sira Fortress',
          category: 'تاريخي',
          image: '/images/destinations/aden.jpg',
          description: 'حصن دفاعي تاريخي يتربع على جزيرة صيرة الصخرية بإطلالة بانورامية ساحرة على بحر العرب وخليج عدن.',
          locationText: 'جزيرة صيرة - عدن',
        },
      ],
      isPublished: true,
      status: 'published',
    },
    {
      slug: 'mukalla',
      cityId: 'mukalla',
      tagline: 'عروس بحر العرب ودرة شواطئ حضرموت الذهبية',
      heroImage: '/images/destinations/mukalla.jpg',
      overview: {
        history: 'عاصمة حضرموت الساحلية وميناؤها الرئيسي التاريخي، تمتاز بحصونها وقصورها السلاطينية العريقة وشوارعها البحرية الأنيقة.',
        climate: 'مناخ ساحلي لطيف ومعتدل في أشهر الخريف والشتاء مع نسائم المحيط الهندي العليلة.',
        culture: 'حاضرة الأدب والفن والموشحات الحضرمية والأسواق التقليدية للمشغولات اليدوية وعسل الدوعني الفاخر.',
        bestTimeToVisit: 'من أكتوبر إلى مارس أثناء موسم البلدة السياحي والأجواء الشتوية البديعة.',
      },
      landmarks: [
        {
          id: 'husn_al_ghwayzi',
          name: 'حصن الغويزي',
          nameEn: 'Husn Al-Ghwayzi',
          category: 'تاريخي',
          image: '/images/destinations/mukalla.jpg',
          description: 'حصن عسكري أثري فريد مبني على صخرة شاهقة عند المدخل الشمالي الشرقي لمدينة المكلا.',
          locationText: 'المدخل الشرقي للمكلا',
        },
        {
          id: 'quaiti_palace',
          name: 'قصر السلطان القعيطي (متحف المكلا)',
          nameEn: 'Quaiti Palace Museum',
          category: 'تاريخي',
          image: '/images/destinations/mukalla.jpg',
          description: 'تحفة معمارية تدمج الطابع الهندي والإسلامي وكان مقراً لحكام الدولة القعيطية في حضرموت.',
          locationText: 'كورنيش المكلا',
        },
      ],
      isPublished: true,
      status: 'published',
    },
    {
      slug: 'ibb',
      cityId: 'ibb',
      tagline: 'اللواء الأخضر وجنة الجبال والشلالات اليمنية',
      heroImage: '/images/destinations/ibb.jpg',
      overview: {
        history: 'مدينة جبلية تاريخية تقع في قلب المرتفعات الخضراء، وتضم حصوناً عريقة وقرى معلقة فوق قمم الجبال منذ قرون.',
        climate: 'تعد إب أكثر مناطق اليمن أمطاراً واعتدالاً، حيث تكتسي جبالها وسهولها بالخضرة الدائمة وضباب القمم الساحر.',
        culture: 'تشتهر بالزراعة والمدرجات الجبلية البديعة وكرم الضيافة الريفية الأصيلة.',
        bestTimeToVisit: 'من يوليو إلى أكتوبر خلال موسم الأمطار والربيع الأخضر.',
      },
      landmarks: [
        {
          id: 'waddi_banna',
          name: 'وادي بنا وشلالات وادي الدور',
          nameEn: 'Wadi Banna & Waterfalls',
          category: 'طبيعي',
          image: '/images/destinations/ibb.jpg',
          description: 'أحد أجمل الوديان الطبيعية في اليمن بمياهه العذبة ومدرجاته الزراعية الخضراء التي تعانق السحاب.',
          locationText: 'ريف محافظة إب',
        },
      ],
      isPublished: true,
      status: 'published',
    },
    {
      slug: 'hodeidah',
      cityId: 'hodeidah',
      tagline: 'عروس البحر الأحمر ومدينة النخيل والشواطئ الفسيحة',
      heroImage: '/images/destinations/hodeidah.jpg',
      overview: {
        history: 'الميناء التاريخي الرئيسي على البحر الأحمر، ومركز تجاري عريق يربط الساحل التهامي بمدن المرتفعات اليمنية.',
        climate: 'مناخ ساحلي دافئ واستوائي يلطفه نسيم البحر الأحمر العليل في فصلي الخريف والشتاء.',
        culture: 'فلكلور تهامي غني بالأهازيج الشعبية وصيد الأسماك والمأكولات البحرية الطازجة.',
        bestTimeToVisit: 'من نوفمبر إلى فبراير في الأجواء الشتوية البحرية المعتدلة.',
      },
      landmarks: [
        {
          id: 'hodeidah_corniche',
          name: 'كورنيش الحديدة الساحلي وحديقة الشعب',
          nameEn: 'Hodeidah Corniche',
          category: 'ترفيهي',
          image: '/images/destinations/hodeidah.jpg',
          description: 'واجهة بحرية ممتدة تضم شواطئ رملية وجلسات عائلية بإطلالة مميزة على مغيب شمس البحر الأحمر.',
          locationText: 'الساحل الغربي - الحديدة',
        },
      ],
      isPublished: true,
      status: 'published',
    },
  ];

  for (const dest of destinationsSeed) {
    await seedDocumentIfNotExists('website_destinations', dest.slug, dest, `Destination Guide: ${dest.slug}`);
  }

  console.log('\n====================================================');
  console.log('📊 MIGRATION SUMMARY REPORT');
  console.log('====================================================');
  console.log(`Discovered items: ${stats.discovered}`);
  console.log(`Created:          ${stats.created}`);
  console.log(`Preserved/Skipped:${stats.preserved}`);
  console.log(`Updated:          ${stats.updated}`);
  console.log(`Failed:           ${stats.failed}`);
  console.log('====================================================\n');
}

runMigration()
  .then(() => {
    console.log('✅ Phase 0 Migration completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed with error:', err);
    process.exit(1);
  });
