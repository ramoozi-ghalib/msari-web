/**
 * src/services/cms/pages.cms.ts
 *
 * CMS Service for standard & polymorphic marketing pages (website_pages/{slug}).
 * Normalizes both nested `content` (written by Flutter WebsitePageModel) and flat top-level fields.
 */

import { unstable_cache } from 'next/cache';
import { CmsClient } from './cms.client';
import type {
  AboutPageData,
  LegalPageData,
  DevelopersPageData,
  AppPageData,
  CarsPageData,
  CarsAirportPageData,
  CarsTransportPageData,
  AddHotelPageData,
  InternationalHotelsPageData,
  FlightsPageData,
} from './types';

// ── Fallbacks ──────────────────────────────────────────────────────────────

export const FALLBACK_ABOUT: AboutPageData = {
  type: 'content_page',
  slug: 'about',
  title: 'من نحن',
  titleEn: 'About Us',
  lastUpdatedText: 'مارس ٢٠٢٦',
  status: 'published',
  isPublished: true,
  hero: {
    badge: 'قصتنا ورؤيتنا',
    title: 'نعيد ابتكار تجربة السفر في اليمن',
    subtitle: 'منصة يمنية حديثة تجمع بين التكنولوجيا المتقدمة والضيافة اليمنية الأصيلة لتسهيل حجز الفنادق والتنقلات.',
  },
  stats: [
    { value: '+100', label: 'فندق شريك' },
    { value: '+10', label: 'مدن ومحافظات' },
    { value: '+5000', label: 'تحميل' },
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
    { name: 'فريق خدمة العملاء', role: 'دعم على مدار 24/7', emoji: '🎧' },
    { name: 'فريق التطوير والتقنية', role: 'هندسة المنصة والتطبيق', emoji: '💻' },
  ],
  cta: {
    title: 'مستعد لسفرتك القادمة؟',
    subtitle: 'احجز الآن واستمتع بأفضل تجربة سفر في اليمن',
    buttonText: 'تصفح الفنادق',
    link: '/hotels',
  },
};

export const FALLBACK_PRIVACY: LegalPageData = {
  type: 'legal_page',
  slug: 'privacy',
  title: 'سياسة الخصوصية',
  titleEn: 'Privacy Policy',
  lastUpdatedText: 'مارس ٢٠٢٦',
  status: 'published',
  isPublished: true,
  intro: 'نحن في منصة مساري نلتزم بحماية خصوصيتك وبياناتك الشخصية بأعلى معايير الأمان والشفافية.',
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
        'نستخدم cookies ضرورية لتشغيل الموقع بشكل صحيح',
        'cookies تحليلية لفهم كيفية استخدامك للموقع (مجهولة الهوية)',
        'يمكنك تعطيل cookies من إعدادات متصفحك، لكن قد يؤثر ذلك على بعض وظائف الموقع',
      ],
    },
    {
      id: 'updates',
      title: '٦. التعديلات على هذه السياسة',
      content: [
        'قد نحدث هذه السياسة من وقت لآخر لتعكس التغييرات في خدماتنا أو القوانين',
        'سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار بارز على الموقع',
        'استمرارك في استخدام المنصة بعد التحديثات يعني موافقتك على السياسة الجديدة',
      ],
    },
    {
      id: 'contact',
      title: '٧. تواصل معنا',
      content: [
        'إذا كانت لديك أي استفسارات أو ملاحظات بخصوص سياسة الخصوصية، يرجى التواصل عبر privacy@msari.net أو الدعم الفني.',
      ],
    },
  ],
};

export const FALLBACK_TERMS: LegalPageData = {
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
};

export const FALLBACK_DEVELOPERS: DevelopersPageData = {
  type: 'developers_page',
  slug: 'developers',
  title: 'بوابة المطورين والـ API',
  titleEn: 'Developers & API Portal',
  status: 'published',
  isPublished: true,
  hero: {
    badge: 'بوابة المطورين والربط البرمجي B2B',
    title: 'اربط نظامك مع مخزون أكبر شبكة سفر وفنادق في اليمن',
    subtitle: 'واجهة برمجية سريعة وموثوقة تتيح لك البحث عن الفنادق، جلب الأسعار اللحظية، وتأكيد الحجوزات برمجياً.',
  },
  features: [
    { icon: 'Zap', title: 'استجابة فائقة السرعة', desc: 'واجهة RESTful مبنية بتقنيات حديثة بوقت استجابة يقل عن 150ms مع استقرار عالي.' },
    { icon: 'ShieldCheck', title: 'توثيق وأمان مشدد', desc: 'مفاتيح API مشفرة مع صلاحيات دقيقة ومعدل طلبات آمن ومتوافق مع أعلى المعايير.' },
    { icon: 'Code', title: 'بيانات JSON قياسية', desc: 'بنية بيانات نظيفة وموثقة بالكامل مع توفير Webhooks للتحديثات الفورية.' },
  ],
  plans: [
    {
      id: 'b2b_integration',
      name: 'خطة الشراكة والربط البرمجي (Msari B2B API)',
      price: '',
      description: 'خطة شاملة ومتكاملة تمنح وكالات السفر والتطبيقات ومنصات السفر وصولاً مباشراً لآلاف الغرف الفندقية وتأكيد الحجوزات لحظياً.',
      features: [
        'ربط فوري وتأكيد مباشر لجميع حجوزات الفنادق',
        'معدل طلبات غير محدود وسرعة استجابة فائقة',
        'تحديث لحظي لأسعار الغرف والتوفر بعدة عملات',
        'نظام Webhooks للإشعارات والتحديثات اللحظية',
        'دعم فني وهندسي مخصص 24/7 عبر واتساب',
      ],
      popular: true,
    },
  ],
  faq: [
    { q: 'كيف أحصل على مفتاح API؟', a: 'تواصل معنا عبر واتساب الشركاء وسيتم تزويدك بمفتاح الربط البرمجي بعد مراجعة طلب الشراكة وتوثيق الحساب.' },
    { q: 'هل الـ API يدعم تأكيد الحجز الفوري؟', a: 'نعم، يتيح الـ API إتمام وتأكيد الحجز الفوري مع خصم التوفر لحظياً وإصدار رقم مرجعي معتمد.' },
    { q: 'ما هي صيغة البيانات المعتمدة؟', a: 'البيانات تُرسل وتُستقبل بصيغة JSON القياسية عبر بروتوكول HTTPS المشفر.' },
    { q: 'هل يتوفر دعم فني أثناء الربط؟', a: 'نعم، فريقنا الهندسي متواجد لتقديم الدعم الفني والمساعدة في عملية التكامل خطوة بخطوة.' },
  ],
};

export const FALLBACK_APP_PAGE: AppPageData = {
  slug: 'app',
  title: 'حمّل تطبيق مساري للجوال',
  titleEn: 'Download Msari Mobile App',
  isPublished: true,
  hero: {
    badge: 'تطبيق مساري الذكي للجوال',
    title: 'سفرك وفنادقك في جيبك — حمّل تطبيق مساري الآن',
    subtitle: 'احجز أفضل فنادق اليمن بتأكيد فوري ودفع محلي ميسر (المحافظ الإلكترونية، تحويل بنكي، كاش عند الوصول)، وقارن أسعار الفنادق وتذاكر الطيران والسيارات بضغطة زر.',
    downloads: '5000+',
    rating: '4.8★',
    mockupImage1: '/images/app-screen.png',
    mockupImage2: '/images/app-screen.png',
  },
  stats: [
    { value: '5000+', label: 'تحميل' },
    { value: '4.8★', label: 'تقييم المسافرين' },
    { value: '100+', label: 'فندق' },
    { value: '24/7', label: 'خدمة عملاء' },
  ],
  features: [
    { icon: 'Zap', title: 'خيارات دفع متعددة', desc: 'ادفع بسهولة عبر المحافظ الإلكترونية المتوفرة، أو تحويل بنكي، أو الدفع كاش عند الوصول.', badge: 'دفع محلي مرن', color: 'from-[#23096E] to-[#3A1C8F]' },
    { icon: 'Coins', title: 'شفافية الأسعار وتعدد العملات', desc: 'احصل على أسعار مباشرة ومحدثة بالريال اليمني، الدولار، والريال السعودي بدون أي عمولات خفية.', badge: 'متعدد العملات', color: 'from-[#FF3B30] to-[#e02d23]' },
    { icon: 'ShieldCheck', title: 'تأكيد حجز فوري برقم مرجعي رسمي', desc: 'استلم تفاصيل حجزك المؤكد فورياً على هاتفك مع إمكانية مراجعة الحجز بدون إنترنت.', badge: 'تأكيد فوري', color: 'from-emerald-600 to-teal-700' },
    { icon: 'Headphones', title: '24/7 خدمة عملاء', desc: 'فريق دعم محلي متخصص معك في كل خطوة عبر الواتساب والاتصال.', badge: 'دعم يمني 24/7', color: 'from-[#3A1C8F] to-[#23096E]' },
  ],
  screensShowcase: [
    { id: 0, title: 'الرئيسية والبحث', headline: 'بحث ذكي وفلترة فائقة السرعة', subtitle: 'استعرض الفنادق المتاحة فورياً، وقارن الأسعار الحية بالريال اليمني والدولار والريال السعودي.', image: '/images/app-screen.png' },
    { id: 1, title: 'تفاصيل الفندق', headline: 'تفاصيل كاملة وصور عالية الدقة', subtitle: 'عرض شامل لصور الغرف، المرافق، الإطلالات، والكهرباء والخدمات.', image: '/images/app-screen.png' },
    { id: 2, title: 'خيارات دفع متعددة', headline: 'ادفع بسهولة عبر المحافظ أو التحويل أو كاش', subtitle: 'خيارات دفع محلية ميسرة تناسب جميع المواطنين والزوار.', image: '/images/app-screen.png' },
    { id: 3, title: 'تأكيد الحجز', headline: 'تأكيد حجز رسمي وتفاصيل كاملة', subtitle: 'استلم تفاصيل حجزك المؤكد فوراً مع رقم مرجعي معتمد وتواصل مباشر مع الفندق.', image: '/images/app-screen.png' },
  ],
  howItWorks: [
    { step: '01', title: '١. حمّل التطبيق مجاناً', desc: 'قم بتحميل تطبيق مساري مباشرة من متجر Google Play أو App Store وابدأ التصفح فوراً دون أي اشتراكات.', subtitle: 'تثبيت سريع في ثوانٍ', badge: 'خطوة أولى' },
    { step: '02', title: '٢. اختر وجهتك وغرفتك', desc: 'ابحث في المدينة المطلوبة (عدن، صنعاء، المكلا، سيئون...) وقارن صور الغرف والأسعار الحية والمرافق المتوفرة.', subtitle: 'مقارنة الأسعار والصور', badge: 'خطوة ثانية' },
    { step: '03', title: '٣. أكد حجزك وسدد بسهولة', desc: 'ادفع عبر المحافظ الإلكترونية، تحويل بنكي، أو كاش عند الوصول، واستلم تأكيد حجزك الرسمي فوراً مع رقم مرجعي معتمد.', subtitle: 'دفع محلي وتأكيد فوري', badge: 'تأكيد مباشر' },
  ],
  faqs: [
    {
      q: 'هل تطبيق مساري مجاني للتحميل والاستخدام؟',
      a: 'نعم، تطبيق مساري مجاني 100% للتحميل على هواتف آيفون وسامسونج وأندرويد، ولا توجد أي رسوم اشتراك أو رسوم حجز إضافية. الأسعار المعروضة في التطبيق هي الأسعار الفعلية المباشرة للفنادق.',
    },
    {
      q: 'ما هي طرق الدفع المتاحة في تطبيق مساري؟',
      a: 'يوفر التطبيق خيارات دفع متعددة ومرنة؛ حيث يمكنك الدفع بسهولة عبر المحافظ الإلكترونية المتوفرة، أو تحويل بنكي، أو الدفع كاش عند الوصول للفندق.',
    },
    {
      q: 'كيف يتم تأكيد حجز الغرفة وتوثيقه لدى الفندق؟',
      a: 'فور إتمام الحجز، يصدر التطبيق تأكيد حجز رسمي برقم مرجعي معتمد وتفاصيل الوصول الكاملة. يتم إشعار إدارة الفندق مباشرة بحجزك، وتظل تفاصيل الحجز محفوظة على هاتفك ويمكنك فتحها بدون إنترنت (Offline) أو تنزيلها كـ PDF لإبرازها للاستقبال.',
    },
    {
      q: 'هل الفنادق المعروضة في التطبيق توفر كهرباء وتكييف مستمر؟',
      a: 'نعم، توضح بطاقة كل فندق في التطبيق تفاصيل توفر الكهرباء 24/7، خدمات التكييف، الإنترنت المجاني، والموقع الجغرافي لضمان إقامة مريحة ومطابقة لتوقعاتك.',
    },
    {
      q: 'هل يمكنني إلغاء أو تعديل الحجز بعد تأكيده؟',
      a: 'نعم، يتيح التطبيق سياسات إلغاء وتعديل مرنة وواضحة لكل فندق، كما يتوفر فريق دعم فني عبر الواتساب والاتصال لمساعدتك في أي تعديل على تواريخ أو تفاصيل حجزك في أي وقت.',
    },
    {
      q: 'هل يشمل تطبيق مساري حجز الطيران والسيارات بالإضافة للفنادق؟',
      a: 'نعم، يوفر تطبيق مساري منصة سفر شاملة تمكّنك من مقارنة أسعار الفنادق العالمية، حجز تذاكر الطيران، وطلب تأجير السيارات والتنقل بين المدن اليمنية من مكان واحد.',
    },
  ],
  cta: {
    title: 'جاهز لتجربة حجز فندقي أسهل وأسرع؟',
    subtitle: 'حمّل تطبيق مساري مجاناً الآن واستمتع بحجز فوري ومؤكد لأفضل فنادق اليمن مع دعم فني متواصل.',
  },
};

export const FALLBACK_CARS_PAGE: CarsPageData = {
  slug: 'cars',
  title: 'خدمات النقل والسيارات — مساري',
  titleEn: 'Car & Transportation Services',
  isPublished: true,
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
};

export const FALLBACK_CARS_AIRPORT: CarsAirportPageData = {
  slug: 'cars_airport',
  title: 'تاكسي المطار — مساري',
  titleEn: 'Airport Taxi Service',
  isPublished: true,
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
};

export const FALLBACK_CARS_TRANSPORT: CarsTransportPageData = {
  slug: 'cars_transport',
  title: 'النقل بين المدن اليمنية — مساري',
  titleEn: 'Intercity Transport Service',
  isPublished: true,
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
};

export const FALLBACK_ADD_HOTEL: AddHotelPageData = {
  slug: 'add_hotel',
  title: 'أضف فندقك — انضم كشريك في مساري',
  titleEn: 'Add Your Hotel - Join Msari Partners',
  isPublished: true,
  hero: {
    badge: 'انضم كشريك في مساري',
    title: 'أضف فندقك إلى مساري',
    subtitle: 'اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر',
  },
  benefits: [
    { emoji: '📈', title: 'أكثر حجوزات', desc: 'وصول لآلاف المسافرين شهرياً' },
    { emoji: '💰', title: 'عمولة منخفضة', desc: 'أفضل شروط إذا قارنت بالمنافسين' },
  ],
  formHeader: {
    title: 'نموذج تقديم الطلب',
    subtitle: 'أملأ البيانات وسيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب',
  },
  successState: {
    title: 'تم إرسال الطلب بنجاح!',
    desc: 'تم استلام طلبك بنجاح. سيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب وإتمام الإجراءات.',
    buttonText: 'إرسال طلب آخر',
  },
};

export const FALLBACK_INTERNATIONAL_HOTELS: InternationalHotelsPageData = {
  slug: 'international_hotels',
  title: 'فنادق عالمية — مساري',
  titleEn: 'International Hotels',
  isPublished: true,
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
};

export const FALLBACK_FLIGHTS_PAGE: FlightsPageData = {
  slug: 'flights',
  title: 'حجز رحلات طيران — مساري',
  titleEn: 'Flight Booking Services',
  isPublished: true,
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
};

// ── Helper to resolve content map ──────────────────────────────────────────

function resolveContent(data: Record<string, any>): Record<string, any> {
  if (data.content && typeof data.content === 'object' && !Array.isArray(data.content)) {
    return { ...data, ...data.content };
  }
  return data;
}

// ── Internal Fetch Handlers ────────────────────────────────────────────────

async function fetchAboutInternal(): Promise<AboutPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'about');
  if (!raw) return FALLBACK_ABOUT;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_ABOUT;

  const data = resolveContent(raw);

  return {
    type: 'content_page',
    slug: 'about',
    title: raw.title || FALLBACK_ABOUT.title,
    titleEn: raw.titleEn || FALLBACK_ABOUT.titleEn,
    lastUpdatedText: raw.lastUpdatedText || FALLBACK_ABOUT.lastUpdatedText,
    status: 'published',
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_ABOUT.hero.badge,
      title: data.hero?.title || FALLBACK_ABOUT.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_ABOUT.hero.subtitle,
    },
    stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : FALLBACK_ABOUT.stats,
    story: {
      badge: data.story?.badge || FALLBACK_ABOUT.story.badge,
      title: data.story?.title || FALLBACK_ABOUT.story.title,
      paragraphs: Array.isArray(data.story?.paragraphs) && data.story.paragraphs.length > 0 ? data.story.paragraphs : FALLBACK_ABOUT.story.paragraphs,
      image: data.story?.image || FALLBACK_ABOUT.story.image,
      locationText: data.story?.locationText || FALLBACK_ABOUT.story.locationText,
      satisfiedClientsCount: data.story?.satisfiedClientsCount || FALLBACK_ABOUT.story.satisfiedClientsCount,
    },
    values: Array.isArray(data.values) && data.values.length > 0 ? data.values : FALLBACK_ABOUT.values,
    team: Array.isArray(data.team) && data.team.length > 0 ? data.team : FALLBACK_ABOUT.team,
    cta: data.cta || FALLBACK_ABOUT.cta,
  };
}

async function fetchLegalInternal(slug: 'privacy' | 'terms'): Promise<LegalPageData> {
  const fallback = slug === 'privacy' ? FALLBACK_PRIVACY : FALLBACK_TERMS;
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', slug);
  if (!raw) return fallback;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return fallback;

  const data = resolveContent(raw);

  // [FIX — legal pages body ownership]
  // The page body is the TOP-LEVEL `sections` array (the full document model).
  // The dashboard editor's `content` map may carry its own partial `sections`
  // copy (e.g. 2 items vs 7/8) — a content-map spread must never override the
  // canonical body. `data.intro`/`data.contactInfo` (editorial values) are
  // still honored via the resolveContent merge below.
  const sectionsSource = (Array.isArray(raw.sections) && raw.sections.length > 0)
    ? raw.sections
    : data.sections;

  let sections = sectionsSource;
  if (!Array.isArray(sections) && data.rawContent) {
    sections = [
      {
        id: 'main',
        title: raw.title || fallback.title,
        content: [String(data.rawContent)],
      },
    ];
  }

  const sanitizedSections = Array.isArray(sections) && sections.length > 0
    ? sections.map((s: any, idx: number) => {
        let contentArr: string[] = [];
        if (Array.isArray(s?.content)) {
          contentArr = s.content.map((item: any) => String(item || '')).filter(Boolean);
        } else if (typeof s?.content === 'string') {
          let str = s.content.trim();
          if (str.startsWith('[') && str.endsWith(']')) {
            str = str.slice(1, -1).trim();
          }
          contentArr = str ? [str] : [];
        }
        return {
          id: String(s?.id || `sec-${idx}`),
          title: String(s?.title || ''),
          content: contentArr.length > 0 ? contentArr : (fallback.sections[idx]?.content || []),
        };
      })
    : fallback.sections;

  return {
    type: 'legal_page',
    slug,
    title: raw.title || fallback.title,
    titleEn: raw.titleEn || fallback.titleEn,
    lastUpdatedText: raw.lastUpdatedText || fallback.lastUpdatedText,
    status: 'published',
    isPublished: true,
    intro: data.intro || fallback.intro,
    sections: sanitizedSections.length > 0 ? sanitizedSections : fallback.sections,
  };
}

async function fetchPrivacyInternal(): Promise<LegalPageData> {
  return fetchLegalInternal('privacy');
}

async function fetchTermsInternal(): Promise<LegalPageData> {
  return fetchLegalInternal('terms');
}

async function fetchDevelopersInternal(): Promise<DevelopersPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'developers');
  if (!raw) return FALLBACK_DEVELOPERS;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_DEVELOPERS;

  const data = resolveContent(raw);

  return {
    type: 'developers_page',
    slug: 'developers',
    title: raw.title || FALLBACK_DEVELOPERS.title,
    titleEn: raw.titleEn || FALLBACK_DEVELOPERS.titleEn,
    status: 'published',
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_DEVELOPERS.hero.badge,
      title: data.hero?.title || FALLBACK_DEVELOPERS.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_DEVELOPERS.hero.subtitle,
    },
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_DEVELOPERS.features,
    plans: Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : FALLBACK_DEVELOPERS.plans,
    faq: Array.isArray(data.faq) && data.faq.length > 0 ? data.faq : FALLBACK_DEVELOPERS.faq,
  };
}

async function fetchAppPageInternal(): Promise<AppPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'app');
  if (!raw) return FALLBACK_APP_PAGE;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_APP_PAGE;

  const data = resolveContent(raw);

  return {
    slug: 'app',
    title: raw.title || FALLBACK_APP_PAGE.title,
    titleEn: raw.titleEn || FALLBACK_APP_PAGE.titleEn,
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_APP_PAGE.hero.badge,
      title: data.hero?.title || FALLBACK_APP_PAGE.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_APP_PAGE.hero.subtitle,
      downloads: data.hero?.downloads || FALLBACK_APP_PAGE.hero.downloads,
      rating: data.hero?.rating || FALLBACK_APP_PAGE.hero.rating,
      mockupImage1: data.hero?.mockupImage1 || FALLBACK_APP_PAGE.hero.mockupImage1,
      mockupImage2: data.hero?.mockupImage2 || FALLBACK_APP_PAGE.hero.mockupImage2,
    },
    stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : FALLBACK_APP_PAGE.stats,
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_APP_PAGE.features,
    screensShowcase: Array.isArray(data.screensShowcase) && data.screensShowcase.length > 0 ? data.screensShowcase : FALLBACK_APP_PAGE.screensShowcase,
    howItWorks: Array.isArray(data.howItWorks) && data.howItWorks.length > 0 ? data.howItWorks : FALLBACK_APP_PAGE.howItWorks,
    faqs: Array.isArray(data.faqs) && data.faqs.length > 0 ? data.faqs : FALLBACK_APP_PAGE.faqs,
    cta: data.cta || FALLBACK_APP_PAGE.cta,
  };
}

async function fetchCarsPageInternal(): Promise<CarsPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'cars');
  if (!raw) return FALLBACK_CARS_PAGE;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_CARS_PAGE;

  const data = resolveContent(raw);

  return {
    slug: 'cars',
    title: raw.title || FALLBACK_CARS_PAGE.title,
    titleEn: raw.titleEn || FALLBACK_CARS_PAGE.titleEn,
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_CARS_PAGE.hero.badge,
      title: data.hero?.title || FALLBACK_CARS_PAGE.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_CARS_PAGE.hero.subtitle,
      bgImage: data.hero?.bgImage || FALLBACK_CARS_PAGE.hero.bgImage,
    },
    fleet: Array.isArray(data.fleet) && data.fleet.length > 0 ? data.fleet : FALLBACK_CARS_PAGE.fleet,
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_CARS_PAGE.features,
  };
}

async function fetchCarsAirportPageInternal(): Promise<CarsAirportPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'cars_airport');
  if (!raw) return FALLBACK_CARS_AIRPORT;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_CARS_AIRPORT;

  const data = resolveContent(raw);

  return {
    slug: 'cars_airport',
    title: raw.title || FALLBACK_CARS_AIRPORT.title,
    titleEn: raw.titleEn || FALLBACK_CARS_AIRPORT.titleEn,
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_CARS_AIRPORT.hero.badge,
      title: data.hero?.title || FALLBACK_CARS_AIRPORT.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_CARS_AIRPORT.hero.subtitle,
      bgImage: data.hero?.bgImage || FALLBACK_CARS_AIRPORT.hero.bgImage,
    },
    packages: Array.isArray(data.packages) && data.packages.length > 0 ? data.packages : FALLBACK_CARS_AIRPORT.packages,
    airports: Array.isArray(data.airports) && data.airports.length > 0 ? data.airports : FALLBACK_CARS_AIRPORT.airports,
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_CARS_AIRPORT.features,
  };
}

async function fetchCarsTransportPageInternal(): Promise<CarsTransportPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'cars_transport');
  if (!raw) return FALLBACK_CARS_TRANSPORT;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_CARS_TRANSPORT;

  const data = resolveContent(raw);

  return {
    slug: 'cars_transport',
    title: raw.title || FALLBACK_CARS_TRANSPORT.title,
    titleEn: raw.titleEn || FALLBACK_CARS_TRANSPORT.titleEn,
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_CARS_TRANSPORT.hero.badge,
      title: data.hero?.title || FALLBACK_CARS_TRANSPORT.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_CARS_TRANSPORT.hero.subtitle,
      bgImage: data.hero?.bgImage || FALLBACK_CARS_TRANSPORT.hero.bgImage,
    },
    routes: Array.isArray(data.routes) && data.routes.length > 0 ? data.routes : FALLBACK_CARS_TRANSPORT.routes,
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_CARS_TRANSPORT.features,
  };
}

async function fetchAddHotelPageInternal(): Promise<AddHotelPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'add_hotel');
  if (!raw) return FALLBACK_ADD_HOTEL;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_ADD_HOTEL;

  const data = resolveContent(raw);

  return {
    slug: 'add_hotel',
    title: raw.title || FALLBACK_ADD_HOTEL.title,
    titleEn: raw.titleEn || FALLBACK_ADD_HOTEL.titleEn,
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_ADD_HOTEL.hero.badge,
      title: data.hero?.title || FALLBACK_ADD_HOTEL.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_ADD_HOTEL.hero.subtitle,
    },
    benefits: Array.isArray(data.benefits) && data.benefits.length > 0 ? data.benefits : FALLBACK_ADD_HOTEL.benefits,
    formHeader: data.formHeader || FALLBACK_ADD_HOTEL.formHeader,
    successState: data.successState || FALLBACK_ADD_HOTEL.successState,
  };
}

async function fetchInternationalHotelsPageInternal(): Promise<InternationalHotelsPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'international_hotels');
  if (!raw) return FALLBACK_INTERNATIONAL_HOTELS;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_INTERNATIONAL_HOTELS;

  const data = resolveContent(raw);

  return {
    slug: 'international_hotels',
    title: raw.title || FALLBACK_INTERNATIONAL_HOTELS.title,
    titleEn: raw.titleEn || FALLBACK_INTERNATIONAL_HOTELS.titleEn,
    isPublished: true,
    hero: {
      badge: data.hero?.badge || FALLBACK_INTERNATIONAL_HOTELS.hero.badge,
      title: data.hero?.title || FALLBACK_INTERNATIONAL_HOTELS.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_INTERNATIONAL_HOTELS.hero.subtitle,
      bgImage: data.hero?.bgImage || FALLBACK_INTERNATIONAL_HOTELS.hero.bgImage,
    },
    topDestinations: Array.isArray(data.topDestinations) && data.topDestinations.length > 0 ? data.topDestinations : FALLBACK_INTERNATIONAL_HOTELS.topDestinations,
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_INTERNATIONAL_HOTELS.features,
    cta: data.cta || FALLBACK_INTERNATIONAL_HOTELS.cta,
  };
}

async function fetchFlightsPageInternal(): Promise<FlightsPageData> {
  const raw = await CmsClient.getDoc<Record<string, any>>('website_pages', 'flights');
  if (!raw) return FALLBACK_FLIGHTS_PAGE;

  const isPub = raw.isPublished !== false && raw.status !== 'draft';
  if (!isPub) return FALLBACK_FLIGHTS_PAGE;

  const data = resolveContent(raw);

  return {
    slug: 'flights',
    title: raw.title || FALLBACK_FLIGHTS_PAGE.title,
    titleEn: raw.titleEn || FALLBACK_FLIGHTS_PAGE.titleEn,
    isPublished: true,
    hero: {
      title: data.hero?.title || FALLBACK_FLIGHTS_PAGE.hero.title,
      subtitle: data.hero?.subtitle || FALLBACK_FLIGHTS_PAGE.hero.subtitle,
      bgImage: data.hero?.bgImage || FALLBACK_FLIGHTS_PAGE.hero.bgImage,
    },
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_FLIGHTS_PAGE.features,
  };
}

const CMS_REVALIDATE = process.env.NODE_ENV === 'development' ? 1 : 10;

export class PagesCmsService {
  static getAboutPage = unstable_cache(
    fetchAboutInternal,
    ['website_page_about'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:about'] }
  );

  static getPrivacyPage = unstable_cache(
    fetchPrivacyInternal,
    ['website_page_privacy'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:privacy'] }
  );

  static getTermsPage = unstable_cache(
    fetchTermsInternal,
    ['website_page_terms'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:terms'] }
  );

  static getDevelopersPage = unstable_cache(
    fetchDevelopersInternal,
    ['website_page_developers'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:developers'] }
  );

  static getAppPage = unstable_cache(
    fetchAppPageInternal,
    ['website_page_app'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:app'] }
  );

  static getCarsPage = unstable_cache(
    fetchCarsPageInternal,
    ['website_page_cars'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:cars'] }
  );

  static getCarsAirportPage = unstable_cache(
    fetchCarsAirportPageInternal,
    ['website_page_cars_airport'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:cars_airport'] }
  );

  static getCarsTransportPage = unstable_cache(
    fetchCarsTransportPageInternal,
    ['website_page_cars_transport'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:cars_transport'] }
  );

  static getAddHotelPage = unstable_cache(
    fetchAddHotelPageInternal,
    ['website_page_add_hotel'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:add_hotel'] }
  );

  static getInternationalHotelsPage = unstable_cache(
    fetchInternationalHotelsPageInternal,
    ['website_page_international_hotels'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:international_hotels'] }
  );

  static getFlightsPage = unstable_cache(
    fetchFlightsPageInternal,
    ['website_page_flights'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:pages', 'cms:page:flights'] }
  );
}
