/**
 * scripts/seed-complete-cms-v2.ts
 *
 * Populates / synchronizes all CMS documents in Firestore according to the
 * normalized schema (content map in website_pages + website_settings + website_homepage).
 */

import { db } from '../src/lib/firebase-admin';

async function seed() {
  console.log('🚀 Starting Full CMS Synchronization via Firebase Admin...');

  // 1. website_settings/general
  await db.collection('website_settings').doc('general').set({
    whatsappNumber: '967733644466',
    supportPhone: '+967 733 644 466',
    infoEmail: 'info@msari.net',
    privacyEmail: 'privacy@msari.net',
    legalEmail: 'legal@msari.net',
    workingHoursAr: 'يومياً ٨ ص — ١٠ م',
    workingHoursEn: 'Daily 8 AM — 10 PM',
    headquartersAr: 'صنعاء وعدن — اليمن',
    headquartersEn: "Sana'a & Aden — Yemen",
    mapUrl: 'https://maps.google.com/?q=Sanaa,Yemen',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=net.msari.app',
    appStoreUrl: 'https://apps.apple.com',
    footerDescriptionAr: 'منصة السفر الأولى في اليمن — نوفر لك أفضل خيارات الإقامة والطيران وخدمات النقل بأمان وموثوقية.',
    footerDescriptionEn: "Yemen's #1 Travel Platform — providing premium hotel bookings, flights, and transportation.",
    copyrightTextAr: 'جميع الحقوق محفوظة لـ مساري لخدمات السفر والسياحة.',
    copyrightTextEn: 'All rights reserved to Msari Travel & Tourism Services.',
    socialLinks: {
      facebook: 'https://facebook.com/msariapp',
      instagram: 'https://instagram.com/msariapp',
      twitter: 'https://twitter.com/msariapp',
      linkedin: 'https://linkedin.com/company/msariapp',
    },
    contactFaqs: [
      { q: 'كيف يمكنني تأكيد حجزي؟', a: 'بعد إتمام الحجز، ستظهر لك صفحة تأكيد وستصلك رسالة واتساب تحتوي على تفاصيل حجزك كاملة.' },
      { q: 'هل يمكنني إلغاء أو تعديل الحجز؟', a: 'نعم، يمكنك التواصل معنا عبر واتساب وسنقوم بمساعدتك في الإلغاء أو التعديل خلال 24 ساعة.' },
      { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل الحوالات البنكية، الدفع عند الوصول، والدفع عبر واتساب. وجاري تفعيل الدفع الإلكتروني قريباً.' },
      { q: 'هل تشملون فنادق خارج اليمن؟', a: 'نعم، لدينا قسم مخصص للفنادق العالمية يمكنك تصفحه والتواصل معنا للحجز المباشر.' },
    ],
    seo: {
      defaultSiteTitle: 'مساري | المنصة الأولى لحجز الفنادق ورحلات السفر في اليمن',
      defaultSiteDescription: 'احجز أفضل الفنادق ورحلات الطيران وتأجير السيارات في اليمن مع مساري بأسعار حصرية وتأكيد فوري.',
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_settings/general updated.');

  // 2. website_homepage/main
  await db.collection('website_homepage').doc('main').set({
    hero: {
      badgeAr: 'المنصة الأولى لحجز الفنادق في اليمن',
      badgeEn: "Yemen's #1 Travel Platform",
      titleAr: 'اكتشف أجمل وجهات اليمن\nمع مساري',
      titleEn: 'Discover Yemen With Msari',
      subtitleAr: 'منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران وتأجير السيارات بسهولة وأمان',
      subtitleEn: 'Seamless hotel bookings and travel services across Yemen',
      backgroundImageUrl: '/images/hero-bg.jpg',
      stats: [
        { value: '5000+', labelAr: 'مستخدم سعيد', color: '#23096E' },
        { value: '50+', labelAr: 'فندق شريك', color: '#23096E' },
        { value: '10', labelAr: 'مدن ومحافظات', color: '#FF3B30' },
      ],
    },
    whyMsari: {
      sectionTitleAr: 'المنصة التي تثق بها',
      badgeAr: 'لماذا مساري',
      features: [
        { title: 'دفع آمن', desc: 'حجز موثوق بلا مفاجآت، مع خيارات دفع مرنة تناسبك', color: 'from-[#23096E] to-[#3A1C8F]' },
        { title: 'دعم على مدار الساعة', desc: 'فريقنا معك عبر واتساب في أي وقت تحتاجه', color: 'from-[#3A1C8F] to-[#23096E]' },
        { title: 'أفضل الأسعار', desc: 'عروض حصرية وأسعار تنافسية مضمونة دائماً', color: 'from-[#FF3B30] to-[#23096E]' },
        { title: 'تغطية واسعة', desc: '10 مدن يمنية وشراكات فنادق عالمية', color: 'from-[#FF3B30] to-[#3A1C8F]' },
        { title: 'محلي وعالمي', desc: 'فنادق يمنية بخبرة محلية، وفنادق عالمية عبر أهم الشراكات', color: 'from-[#23096E] to-[#FF3B30]' },
        { title: 'API للشركاء', desc: 'نوفر API متكامل لبيانات الفنادق اليمنية لأي شريك تقني', color: 'from-[#3A1C8F] to-[#23096E]' },
      ],
      partnerCta: {
        badgeAr: 'للشركاء والفنادق',
        titleAr: 'هل أنت مزود فندق أو شريك تقني؟ انضم لشبكة مساري وضاعف حجوزاتك',
        descriptionAr: 'انضم لشبكة مساري وضاعف حجوزاتك مع نظام إدارة متكامل وربط برمجي مباشر',
        buttonTextAr: 'سجل فندقك معنا',
        href: '/add-hotel',
      },
    },
    appDownload: {
      badgeAr: 'تطبيق مساري للهواتف الذكية',
      titleAr: 'حمّل تطبيق مساري الآن',
      subtitleAr: 'احجز فنادقك ورحلاتك وسياراتك من أي مكان وفي أي وقت بسهولة وأمان',
      mockupImageUrl: '/images/app-screen.png',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=net.msari.app',
      appStoreUrl: 'https://apps.apple.com',
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_homepage/main updated.');

  // 3. website_pages/about
  await db.collection('website_pages').doc('about').set({
    slug: 'about',
    title: 'من نحن',
    titleEn: 'About Us',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      hero: {
        badge: 'قصتنا ورؤيتنا',
        title: 'نعيد ابتكار تجربة السفر في اليمن',
        subtitle: 'منصة يمنية حديثة تجمع بين التكنولوجيا المتقدمة والضيافة اليمنية الأصيلة لتسهيل حجز الفنادق والتنقلات.',
      },
      stats: [
        { value: '+50', label: 'فندق شريك' },
        { value: '+10', label: 'مدن ومحافظات' },
        { value: '+5000', label: 'حجز مؤكد' },
        { value: '24/7', label: 'دعم العملاء' },
      ],
      story: {
        badge: 'عن مساري',
        title: 'بوابتك الرقمية الموثوقة لاستكشاف اليمن',
        paragraphs: [
          'انطلقت مساري برؤية واضحة: جعل السفر وحجز الإقامة في اليمن تجربة سلسة وآمنة وموثوقة بنقرة زر.',
          'نحن نربط المسافرين بأفضل الفنادق وخدمات النقل بأسعار شفافة ودون أي تعقيدات، مع توفير خيارات دفع مرنة ودعم محلي مستمر.',
        ],
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
        locationText: 'صنعاء وعدن — نخدم كافة المحافظات',
        satisfiedClientsCount: '+5000 عميل راضٍ',
      },
      values: [
        { icon: 'Shield', title: 'الأمان والموثوقية', desc: 'حجوزات مؤكدة بنسبة 100% مع ضمان أفضل الأسعار دون رسوم خفية.' },
        { icon: 'Zap', title: 'السرعة والسهولة', desc: 'إتمام الحجز واستلام القسيمة فورياً عبر الموقع أو تطبيق الجوال.' },
        { icon: 'HeartHandshake', title: 'الضيافة الأصيلة', desc: 'خدمة عملاء يمنية تفهم احتياجاتك وترافقك خطوة بخطوة.' },
        { icon: 'Star', title: 'أعلى معايير الجودة', desc: 'اختيار وتدقيق الفنادق ووسائل النقل لضمان إقامة مريحة وآمنة.' },
      ],
      team: [
        { name: 'فريق العمليات والشركاء', role: 'إدارة شبكة الفنادق والنقل', emoji: '🤝' },
        { name: 'فريق خدمة العملاء', role: 'دعم ومساندة على مدار 24/7', emoji: '🎧' },
        { name: 'فريق التطوير والتقنية', role: 'هندسة المنصة والتطبيق', emoji: '💻' },
      ],
      cta: {
        title: 'مستعد لسفرتك القادمة؟',
        subtitle: 'احجز الآن واستمتع بأفضل تجربة سفر في اليمن',
        buttonText: 'تصفح الفنادق',
        link: '/hotels',
      },
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/about updated.');

  // 4. website_pages/privacy
  await db.collection('website_pages').doc('privacy').set({
    slug: 'privacy',
    title: 'سياسة الخصوصية',
    titleEn: 'Privacy Policy',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      intro: 'نحن في منصة مساري نلتزم بحماية خصوصيتك وبياناتك الشخصية بأعلى معايير الأمان والشفافية.',
      sections: [
        {
          id: 'collection',
          title: '١. البيانات التي نجمعها',
          content: [
            'البيانات الشخصية كالحساب والاسم ورقم الهاتف والبريد لتأكيد الحجز وتوثيق الهوية.',
            'بيانات تفضيلات السفر وتواريخ الإقامة لتخصيص أفضل العروض الملائمة لك.',
          ],
        },
        {
          id: 'usage',
          title: '٢. كيفية استخدام البيانات',
          content: [
            'تأكيد حجوزات الفنادق والتذاكر وإصدار قسائم السفر الرسمية وتقديم الدعم الفني.',
            'تحسين كفاءة المنصة وتأمين المعاملات والمدفوعات ومنع الاحتيال.',
          ],
        },
      ],
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/privacy updated.');

  // 5. website_pages/terms
  await db.collection('website_pages').doc('terms').set({
    slug: 'terms',
    title: 'شروط الاستخدام',
    titleEn: 'Terms of Service',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      intro: 'تحدد هذه الاتفاقية شروط استخدامك لمنصة وتطبيق مساري لخدمات السفر والسياحة.',
      sections: [
        {
          id: 'acceptance',
          title: '١. قبول الشروط',
          content: [
            'استخدامك للمنصة أو التطبيق يعتبر موافقة صريحة على كافة البنود والسياسات المعلنة.',
          ],
        },
        {
          id: 'booking-policy',
          title: '٢. سياسة الحجز والإلغاء',
          content: [
            'يتم تأكيد الحجز فورياً، وتخضع شروط الإلغاء لسياسة الفندق ومزود الخدمة المحدد.',
          ],
        },
      ],
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/terms updated.');

  // 6. website_pages/developers
  await db.collection('website_pages').doc('developers').set({
    slug: 'developers',
    title: 'بوابة المطورين والـ API',
    titleEn: 'Developers & API Portal',
    isPublished: true,
    content: {
      hero: {
        badge: 'API & Integration',
        title: 'اربط تطبيقك مع شبكة مساري',
        subtitle: 'واجهة برمجية سريعة وموثوقة تتيح لك البحث عن الفنادق، جلب الأسعار اللحظية، وتأكيد الحجوزات برمجياً.',
      },
      features: [
        { icon: 'Zap', title: 'استجابة فائقة السرعة', desc: 'واجهة RESTful مبنية بتقنيات حديثة بوقت استجابة يقل عن 100ms.' },
        { icon: 'ShieldCheck', title: 'توثيق وأمان مشدد', desc: 'مفاتيح API مشفرة مع صلاحيات دقيقة ومعدل طلبات آمن.' },
        { icon: 'Code', title: 'بيانات JSON قياسية', desc: 'بنية بيانات نظيفة وموثقة بالكامل مع أمثلة بلغات متعددة.' },
        { icon: 'CheckCircle2', title: 'بيئة تجريبية Sandbox', desc: 'اختبر كافة عمليات البحث وتأكيد الحجز قبل إطلاق الإنتاج.' },
      ],
      plans: [
        {
          id: 'starter',
          name: 'خطة المطورين (Starter)',
          price: 'مجاناً',
          description: 'مثالية للاختبار والمشاريع الفردية والتطبيقات الناشئة.',
          features: ['1,000 طلب شهرياً', 'بيئة Sandbox تجريبية', 'دعم فني عبر البريد', 'توثيق API كامل'],
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
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/developers updated.');

  // 7. website_pages/app
  await db.collection('website_pages').doc('app').set({
    slug: 'app',
    title: 'حمّل تطبيق مساري للجوال',
    titleEn: 'Download Msari Mobile App',
    isPublished: true,
    content: {
      hero: {
        badge: 'تطبيق مساري الذكي للجوال',
        title: 'سفرك بأكمله في مكان واحد — حمّل تطبيق مساري',
        subtitle: 'احجز أفضل فنادق اليمن وقارن أسعار الفنادق حول العالم وحجز رحلات الطيران والسيارات بسهولة بضغطة زر واحدة.',
        downloads: '+50,000',
        rating: '4.9★',
        mockupImage1: '/images/app-screen.png',
        mockupImage2: '/images/app-screen.png',
      },
      stats: [
        { value: '+50,000', label: 'عملية تحميل' },
        { value: '4.9★', label: 'تقييم المستخدمين' },
        { value: '+500', label: 'فندق ومكان إقامة' },
        { value: '24/7', label: 'دعم فني يمني مباشر' },
      ],
      features: [
        { icon: 'Zap', title: 'تجربة حجز سهلة وسريعة', desc: 'واجهة مستخدم مرنة وبسيطة تتيح لك إتمام حجوزاتك في دقيقة واحدة دون أي تعقيدات.', badge: 'سرعة ودقة', color: 'from-[#23096E] to-[#3A1C8F]' },
        { icon: 'Headphones', title: 'دعم فني على مدار الساعة', desc: 'فريق محلي متخصص جاهز لمساعدتك عبر الواتساب والاتصال لضمان إقامة مريحة.', badge: 'دعم يمني 24/7', color: 'from-[#3A1C8F] to-[#23096E]' },
        { icon: 'Layers', title: 'تطبيق شامل ومبتكر', desc: 'حجز فنادق، تذاكر طيران، وتأجير سيارات ونقل في جميع المحافظات من مكان واحد.', badge: 'فنادق وطيران وسيارات', color: 'from-[#FF3B30] to-[#e02d23]' },
        { icon: 'ShieldCheck', title: 'أمان وضمان أفضل سعر', desc: 'أسعار مباشرة وتنافسية مع تأكيد حجز فوري ودون أي رسوم خفية.', badge: 'أمان وضمان', color: 'from-emerald-600 to-teal-700' },
      ],
      screensShowcase: [
        { id: 0, title: 'الرئيسية والبحث', headline: 'بحث ذكي وفلترة فائقة السرعة', subtitle: 'تصفح أكثر من 500 فندق في عدن، صنعاء، تعز، والمكلا بسهولة فائقة مع أسعار فورية بالريال اليمني والدولار والريال السعودي.', image: '/images/app-screen.png' },
        { id: 1, title: 'تفاصيل الفندق', headline: 'تفاصيل كاملة وصور عالية الدقة', subtitle: 'عرض شاملاً لصور الغرف، المرافق، الإطلالات، والموقع الخريطي للفندق قبل اتخاذ قرار الحجز.', image: '/images/app-screen.png' },
        { id: 2, title: 'تأكيد الحجز', headline: 'تأكيد حجز فوري وقسيمة الكترونية', subtitle: 'احصل على قسيمة الحجز الرسمية مباشرة على هاتفك مع إمكانية التنسيق المباشر مع موظفي الخدمة.', image: '/images/app-screen.png' },
        { id: 3, title: 'إدارة الحجوزات', headline: 'إدارة جميع رحلاتك في مكان واحد', subtitle: 'تابع حجوزات الفنادق والتذاكر السابقة والقادمة بكل يسر وسهولة في أي وقت.', image: '/images/app-screen.png' },
      ],
      howItWorks: [
        { step: '01', title: '1. حمّل التطبيق', desc: 'اختر متجرك المفضل Google Play أو App Store لتثبيت التطبيق مجاناً على جوالك.' },
        { step: '02', title: '2. اختر وجهتك وفندقك', desc: 'تصفح مئات الفنادق والخيارات وقارن الأسعار والصور المناسبة لك في جميع المدن.' },
        { step: '03', title: '3. احجز واستلم القسيمة', desc: 'أكد حجزك فوريًا واستلم قسيمة إقامتك المعتمدة مباشرة مع دعم فني متواصل على مدار 24/7.' },
      ],
      cta: {
        title: 'جاهز لتجربة حجز فريدة وسريعة؟',
        subtitle: 'حمل تطبيق مساري الآن وانطلق في رحلتك القادمة بكل راحة وأمان.',
      },
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/app updated.');

  // 8. website_pages/cars
  await db.collection('website_pages').doc('cars').set({
    slug: 'cars',
    title: 'خدمات النقل والسيارات — مساري',
    titleEn: 'Car & Transportation Services',
    isPublished: true,
    content: {
      hero: {
        badge: 'خدمات سيارات مساري',
        title: 'سافر وتنقل في اليمن بكل راحة وأمان',
        subtitle: 'أسطول سيارات حديث وسائقون محترفون لخدمات المطار والتنقل بين المدن اليمنية بأفضل الأسعار.',
        bgImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop',
      },
      fleet: [
        { tag: 'سيدان اقتصادي', desc: 'تويوتا كورولا أو ما يماثلها — مثالية للتنقلات اليومية السريعة داخل المدينة.', cap: 4, bags: 2, price: 15, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop' },
        { tag: 'عائلي SUV', desc: 'تويوتا برادو أو هيونداي سنتافي — مريحة جداً ومثالية للرحلات العائلية والطرق الجبلية.', cap: 6, bags: 4, price: 30, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=600&auto=format&fit=crop' },
        { tag: 'رجال أعمال VIP', desc: 'لكزس أو لاندكروزر حديث — خدمة فاخرة وسائق خاص لاستقبال كبار الشخصيات والوفود.', cap: 4, bags: 3, price: 50, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop' },
        { tag: 'باص نقل مجموعات', desc: 'تويوتا هايس 14 راكب — مخصص للمجموعات السياحية والرحلات الجماعية بين المحافظات.', cap: 12, bags: 8, price: 45, img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop' },
      ],
      features: [
        { icon: 'ShieldCheck', title: 'سائقون معتمدون', desc: 'جميع السائقين مرخصون رسمياً ولديهم خبرة واسعة في جميع الطرق اليمنية.' },
        { icon: 'Clock', title: 'التزام تام بالمواعيد', desc: 'السائق يكون بانتظارك في الموعد المحدد مسبقاً دون أي تأخير.' },
        { icon: 'Tag', title: 'أسعار واضحة وثابتة', desc: 'أسعار محددة سلفاً بلا أي تكاليف مخفية أو مساومات.' },
      ],
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/cars updated.');

  // 9. website_pages/cars_airport
  await db.collection('website_pages').doc('cars_airport').set({
    slug: 'cars_airport',
    title: 'تاكسي المطار — مساري',
    titleEn: 'Airport Taxi Service',
    isPublished: true,
    content: {
      hero: {
        badge: 'خدمة تاكسي المطار',
        title: 'استقبال من المطار\nبكل راحة وأمان',
        subtitle: 'احجز سيارتك من وإلى المطار مسبقاً وتجنب عناء البحث عن وسيلة نقل عند الوصول.',
        bgImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop',
      },
      packages: [
        { name: 'اقتصادي', desc: 'سيارة خصوصية مريحة ونظيفة', passengers: 4, price: 15, emoji: '🚗' },
        { name: 'VIP', desc: 'سيارة فاخرة لرجال الأعمال والوفود', passengers: 4, price: 30, emoji: '🚙' },
        { name: 'ميني باص', desc: 'للعائلات الكبيرة والمجموعات والحقائب', passengers: 12, price: 45, emoji: '🚌' },
      ],
      airports: [
        { name: 'مطار صنعاء الدولي', city: 'صنعاء', code: 'SAH', emoji: '✈️' },
        { name: 'مطار عدن الدولي', city: 'عدن', code: 'ADE', emoji: '✈️' },
        { name: 'مطار سيئون الدولي', city: 'حضرموت', code: 'GXF', emoji: '✈️' },
      ],
      features: [
        { icon: 'Clock', title: 'تتبع رحلتك', desc: 'السائق يتابع رحلتك ويكون في انتظارك عند صالة الوصول.' },
        { icon: 'Shield', title: 'سائقون معتمدون', desc: 'جميع سائقينا مدربون ومرخصون رسمياً وموثوقون.' },
        { icon: 'Star', title: 'سيارات مريحة ومكيفة', desc: 'أسطول متنوع يتم فحصه وتنظيفه بانتظام لراحتك.' },
        { icon: 'Phone', title: 'دعم فوري ومتابعة', desc: 'تواصل معنا في أي وقت قبل وأثناء رحلتك عبر واتساب.' },
      ],
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/cars_airport updated.');

  // 10. website_pages/cars_transport
  await db.collection('website_pages').doc('cars_transport').set({
    slug: 'cars_transport',
    title: 'النقل بين المدن اليمنية — مساري',
    titleEn: 'Intercity Transport Service',
    isPublished: true,
    content: {
      hero: {
        badge: 'النقل بين المدن اليمنية',
        title: 'سافر بين المدن\nبكل راحة وأمان',
        subtitle: 'خدمة نقل مريحة وموثوقة بين جميع مدن ومحافظات اليمن مع سائقين محترفين وأسعار تنافسية.',
        bgImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2000&auto=format&fit=crop',
      },
      routes: [
        { from: 'صنعاء', to: 'عدن', duration: '٦-٧ ساعات', price: 40, popular: true },
        { from: 'صنعاء', to: 'مأرب', duration: '٣-٤ ساعات', price: 25, popular: false },
        { from: 'صنعاء', to: 'تعز', duration: '٥-٦ ساعات', price: 35, popular: true },
        { from: 'عدن', to: 'المكلا', duration: '٦-٧ ساعات', price: 45, popular: false },
        { from: 'صنعاء', to: 'الحديدة', duration: '٤-٥ ساعات', price: 30, popular: false },
        { from: 'عدن', to: 'تعز', duration: '٣-٤ ساعات', price: 25, popular: true },
      ],
      features: [
        { icon: 'Shield', title: 'سائقون محترفون', desc: 'مرخصون ومتمرسون على جميع الطرق الجبلية والصحراوية.' },
        { icon: 'Car', title: 'سيارات مريحة ومكيفة', desc: 'أسطول متنوع بين خصوصي وعائلي وميني باص.' },
        { icon: 'Clock', title: 'في الوقت المحدد', desc: 'نلتزم بمواعيد الانطلاق والوصول المحددة بدقة.' },
        { icon: 'Users', title: 'للأفراد والعائلات', desc: 'خيارات سفر تناسب المسافرين الفرديين والعائلات الكبيرة.' },
      ],
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/cars_transport updated.');

  // 11. website_pages/flights
  await db.collection('website_pages').doc('flights').set({
    slug: 'flights',
    title: 'حجز رحلات طيران — مساري',
    titleEn: 'Flight Booking Services',
    isPublished: true,
    content: {
      hero: {
        title: 'حلّق نحو وجهتك القادمة',
        subtitle: 'اكتشف أرخص رحلات الطيران وأفضل العروض لأكثر من 1000 وجهة داخل اليمن وحول العالم.',
        bgImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop',
      },
      features: [
        { icon: 'Tag', title: 'أفضل أسعار التذاكر', desc: 'مقارنة شاملة لجميع خطوط الطيران لضمان أوفر سعر.' },
        { icon: 'Clock', title: 'حجز ومتابعة فورية', desc: 'إصدار التذاكر ومتابعة التغييرات والتحديثات مباشرة عبر واتساب.' },
        { icon: 'CreditCard', title: 'خيارات دفع متعددة', desc: 'سدد قيمة التذكرة بالريال اليمني، الريال السعودي، أو الدولار.' },
        { icon: 'ShieldCheck', title: 'دعم سفر متواصل', desc: 'إرشادات وزن الأمتعة والمساعدة في التعديل والاسترجاع.' },
      ],
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/flights updated.');

  // 12. website_pages/international_hotels
  await db.collection('website_pages').doc('international_hotels').set({
    slug: 'international_hotels',
    title: 'فنادق عالمية — مساري',
    titleEn: 'International Hotels',
    isPublished: true,
    content: {
      hero: {
        badge: '+١٠٠٠ وجهة عالمية',
        title: 'فنادق عالمية بأسعار لا تُنافَس',
        subtitle: 'احجز إقامتك في أفضل الفنادق حول العالم بأسعار تنافسية وخدمة عملاء عربية متميزة.',
        bgImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000&auto=format&fit=crop',
      },
      topDestinations: [
        { city: 'دبي', country: 'الإمارات', emoji: '🏙️', hotels: 240, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop' },
        { city: 'إسطنبول', country: 'تركيا', emoji: '🕌', hotels: 380, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop' },
        { city: 'القاهرة', country: 'مصر', emoji: '🏛️', hotels: 195, img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=800&auto=format&fit=crop' },
        { city: 'الرياض', country: 'السعودية', emoji: '🌴', hotels: 210, img: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=800&auto=format&fit=crop' },
        { city: 'عمّان', country: 'الأردن', emoji: '🏰', hotels: 120, img: 'https://images.unsplash.com/photo-1570651788016-29231e21a1ad?q=80&w=800&auto=format&fit=crop' },
        { city: 'بيروت', country: 'لبنان', emoji: '⛵', hotels: 90, img: 'https://images.unsplash.com/photo-1550699026-4302f8e58dd9?q=80&w=800&auto=format&fit=crop' },
      ],
      features: [
        { icon: 'Globe', title: '+١٠٠٠ وجهة عالمية', desc: 'فنادق في أكثر من ١٠٠٠ مدينة حول العالم بأفضل تقييم.' },
        { icon: 'Shield', title: 'حجز آمن ومضمون', desc: 'دفع آمن وتأكيد فوري لجميع الحجوزات مع قسيمة رسمية.' },
        { icon: 'CreditCard', title: 'أفضل الأسعار', desc: 'نضمن لك أقل سعر أو نسترد الفرق مع عروض حصرية.' },
        { icon: 'HeartHandshake', title: 'دعم ٢٤/٧', desc: 'فريقنا متاح على مدار الساعة لمساعدتك والتنسيق معك.' },
      ],
      cta: {
        title: 'هل لم تجد وجهتك المفضلة؟',
        subtitle: 'تواصل معنا مباشرة عبر واتساب وسنساعدك في إيجاد وحجز أفضل فندق لأي وجهة في العالم.',
      },
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/international_hotels updated.');

  // 13. website_pages/add_hotel
  await db.collection('website_pages').doc('add_hotel').set({
    slug: 'add_hotel',
    title: 'أضف فندقك — انضم كشريك في مساري',
    titleEn: 'Add Your Hotel - Join Msari Partners',
    isPublished: true,
    content: {
      hero: {
        badge: 'انضم كشريك في مساري',
        title: 'أضف فندقك إلى مساري',
        subtitle: 'اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر مع نظام إدارة متكامل.',
      },
      benefits: [
        { emoji: '📈', title: 'أكثر حجوزات', desc: 'وصول لآلاف المسافرين شهرياً وزيادة نسبة الإشغال على مدار العام.' },
        { emoji: '💰', title: 'عمولة منخفضة', desc: 'أفضل شروط عمولة تنافسية في السوق اليمني مع تسويات مالية سريعة.' },
      ],
      formHeader: {
        title: 'نموذج تقديم الطلب',
        subtitle: 'أملأ البيانات وسيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب وإتمام الربط.',
      },
      successState: {
        title: 'تم إرسال الطلب بنجاح!',
        desc: 'تم استلام طلبك بنجاح. سيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة البيانات وإتمام الشراكة.',
        buttonText: 'إرسال طلب آخر',
      },
    },
    updatedAt: new Date(),
  }, { merge: true });
  console.log('✅ website_pages/add_hotel updated.');

  console.log('🎉 Full CMS Synchronization Complete!');
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
