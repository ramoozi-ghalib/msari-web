import { db } from '../src/lib/firebase-admin';

const marketingPages = [
  {
    slug: 'app',
    title: 'تطبيق مساري الذكي',
    titleEn: 'Msari Mobile App',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      hero: {
        badge: 'تطبيق مساري الذكي للجوال',
        title: 'سفرك بأكمله في جيبك — حمّل تطبيق مساري الآن',
        subtitle: 'احجز أفضل فنادق اليمن وقارن أسعار الفنادق العالمية ورحلات الطيران والسيارات بسهولة بضغطة زر واحدة.',
        downloads: '5000+',
        rating: '4.8',
      },
      stats: [
        { value: '+10,000', label: 'مستخدم نشط' },
        { value: '+500', label: 'فندق وخيار إقامة' },
        { value: '4.8★', label: 'تقييم رضا العملاء' },
        { value: '24/7', label: 'دعم فني وحجز مباشر' },
      ],
      features: [
        { title: 'تأكيد حجز فوري وموثوق', desc: 'استلم تأكيد حجزك في ثوانٍ مع قسيمة رسمية معتمدة لدى الفنادق.', icon: 'CheckCircle2' },
        { title: 'أفضل أسعار الإقامة والسفر', desc: 'نضمن لك أسعاراً شفافة وتنافسية بدون أي رسوم خفية.', icon: 'Tag' },
        { title: 'طرق دفع محلية وعالمية', desc: 'ادفع عبر الكريمي، جوالي، ون كاش، أو البطاقات البنكية الدولية بكل أمان.', icon: 'CreditCard' },
        { title: 'دعم فني على مدار الساعة', desc: 'فريق متخصص لمساعدتك في كل تفاصيل رحلتك عبر واتساب والاتصال.', icon: 'Headphones' },
        { title: 'تتبع الحجوزات وإدارتها', desc: 'عدّل أو ألغِ حجوزاتك بسهولة واطلع على سجل سفرك الكامل من مكان واحد.', icon: 'Smartphone' },
        { title: 'عروض وخصومات موسمية', desc: 'استفد من حسومات خاصة وحصرية لمستخدمي التطبيق على مدار العام.', icon: 'Sparkles' },
      ],
      howItWorks: [
        { step: '01', title: 'ابحث عن وجهتك', desc: 'حدد مدينتك وتواريخ الإقامة أو مسار رحلتك بسهولة.' },
        { step: '02', title: 'قارن واختر الأنسب', desc: 'تصفح صور الفنادق والخدمات والأسعار بدقة وشفافية.' },
        { step: '03', title: 'أكد حجزك فوراً', desc: 'اختر طريقة الدفع المناسبة واستلم تأكيدك مباشرة.' },
      ],
      cta: {
        title: 'جاهز لتجربة حجز فريدة وسريعة؟',
        subtitle: 'حمل تطبيق مساري الآن وانطلق في رحلتك القادمة بكل راحة وأمان.',
      },
    },
  },
  {
    slug: 'cars',
    title: 'خدمات السيارات والنقل',
    titleEn: 'Car Rental & Transfers',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      hero: {
        title: 'رحلتك تبدأ بكل راحة وأمان',
        subtitle: 'احجز سيارة خاصة لتوصيلات المطار، أو التنقل بين المدن في رحلتك عبر اليمن.',
        bgImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop',
      },
      fleet: [
        { tag: 'اقتصادية', desc: 'تويوتا يارس، هيونداي أكسنت أو ما شابه', cap: 4, bags: 2, price: 35, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600' },
        { tag: 'عائلية SUV', desc: 'تويوتا برادو، فورد إكسبلورر أو ما شابه', cap: 7, bags: 4, price: 80, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600' },
        { tag: 'أعمال', desc: 'تويوتا كامري، هوندا أكورد أو ما شابه', cap: 4, bags: 3, price: 55, img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600' },
        { tag: 'فان نقل', desc: 'تويوتا هايس 14 راكب أو ما شابه', cap: 14, bags: 10, price: 120, img: 'https://images.unsplash.com/photo-1619682817481-e994891bf1e5?auto=format&fit=crop&q=80&w=600' },
      ],
      features: [
        { title: 'سائقون محترفون وموثوقون', desc: 'سائقون ذوو خبرة عالية بالطرق اليمنية لضمان سلامتك وراحتك.', icon: 'ShieldCheck' },
        { title: 'توصيل دقيق للمطار', desc: 'استقبال في المطار مع تتبع مواعيد الرحلات بدقة متناهية.', icon: 'Clock' },
        { title: 'أسعار ثابتة ومناسبة', desc: 'لا مفاجآت في الأسعار، قيمة واضحة ومحددة قبل انطلاق الرحلة.', icon: 'Tag' },
      ],
    },
  },
  {
    slug: 'add_hotel',
    title: 'أضف فندقك إلى مساري',
    titleEn: 'Add Your Hotel Partner',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      hero: {
        badge: 'انضم كشريك في مساري',
        title: 'أضف فندقك إلى مساري',
        subtitle: 'اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر',
      },
      benefits: [
        { emoji: '📈', title: 'أكثر حجوزات', desc: 'وصول لآلاف المسافرين شهرياً عبر منصة وتطبيق مساري.' },
        { emoji: '💰', title: 'عمولة منخفضة', desc: 'أفضل شروط وعمولات تنافسية مقارنة بأي منصة أخرى.' },
        { emoji: '⚡', title: 'لوحة إدارة سهلة', desc: 'تحكم بغرفك وأسعارك واستقبل الحجوزات بكل سهولة.' },
        { emoji: '🤝', title: 'دعم شريك مخصص', desc: 'فريق عمليات يمني لمساعدتك في كل خطوة.' },
      ],
    },
  },
  {
    slug: 'international_hotels',
    title: 'فنادق عالمية',
    titleEn: 'International Hotels',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      hero: {
        badge: '+١٠٠٠ وجهة عالمية',
        title: 'فنادق عالمية بأسعار لا تُنافَس',
        subtitle: 'احجز إقامتك في أفضل الفنادق حول العالم بأسعار تنافسية وخدمة عربية متميزة',
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
        { title: '+١٠٠٠ وجهة عالمية', desc: 'فنادق في أكثر من ١٠٠٠ مدينة حول العالم', icon: 'Globe' },
        { title: 'حجز آمن ومضمون', desc: 'دفع آمن وتأكيد فوري لجميع الحجوزات', icon: 'Shield' },
        { title: 'أفضل الأسعار', desc: 'نضمن لك أقل سعر أو نسترد الفرق', icon: 'CreditCard' },
        { title: 'دعم ٢٤/٧', desc: 'فريقنا متاح على مدار الساعة لمساعدتك', icon: 'HeartHandshake' },
      ],
    },
  },
  {
    slug: 'flights',
    title: 'رحلات الطيران',
    titleEn: 'Flight Bookings',
    lastUpdatedText: 'مارس ٢٠٢٦',
    isPublished: true,
    content: {
      hero: {
        title: 'حلّق نحو وجهتك القادمة',
        subtitle: 'اكتشف أرخص رحلات الطيران وأفضل العروض لأكثر من 1000 وجهة حول العالم.',
        bgImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop',
      },
      features: [
        { title: 'أفضل أسعار التذاكر', desc: 'مقارنة شاملة لجميع خطوط الطيران لضمان أوفر سعر.', icon: 'Tag' },
        { title: 'حجز ومتابعة فورية', desc: 'إصدار التذاكر ومتابعة التغييرات والتحديثات مباشرة عبر واتساب.', icon: 'Clock' },
        { title: 'خيارات دفع متعددة', desc: 'سدد قيمة التذكرة بالريال اليمني، الريال السعودي، أو الدولار.', icon: 'CreditCard' },
        { title: 'دعم سفر متواصل', desc: 'إرشادات وزن الأمتعة والمساعدة في التعديل والاسترجاع.', icon: 'ShieldCheck' },
      ],
    },
  },
];

async function seedMarketingPages() {
  console.log('Seeding marketing pages into website_pages collection...');
  const batch = db.batch();

  for (const page of marketingPages) {
    const docRef = db.collection('website_pages').doc(page.slug);
    batch.set(docRef, {
      ...page,
      updatedAt: new Date(),
      updatedBy: 'system_seed',
    }, { merge: true });
  }

  await batch.commit();
  console.log(`Successfully seeded ${marketingPages.length} marketing pages into website_pages!`);

  // Verify
  const snap = await db.collection('website_pages').get();
  console.log(`Verification: website_pages now has ${snap.docs.length} total pages:`);
  snap.docs.forEach(doc => {
    const d = doc.data();
    console.log(` - [${doc.id}] "${d.title}"`);
  });
}

seedMarketingPages().catch(console.error);
