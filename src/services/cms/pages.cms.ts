/**
 * src/services/cms/pages.cms.ts
 *
 * CMS Service for Polymorphic Marketing & Legal Pages (website_pages/{slug}).
 */

import { unstable_cache } from 'next/cache';
import { CmsClient } from './cms.client';
import type { AboutPageData, LegalPageData, DevelopersPageData } from './types';

// ── Default Fallback Data ──────────────────────────────────────────────────

const FALLBACK_ABOUT: AboutPageData = {
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
};

const FALLBACK_PRIVACY: LegalPageData = {
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
  ],
};

const FALLBACK_TERMS: LegalPageData = {
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
  ],
};

const FALLBACK_DEVELOPERS: DevelopersPageData = {
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
};

// ── Internal Fetch Handlers ────────────────────────────────────────────────

async function fetchAboutInternal(): Promise<AboutPageData> {
  const data = await CmsClient.getDoc<Record<string, any>>('website_pages', 'about');
  if (!data) return FALLBACK_ABOUT;

  const status = data.status || (data.isPublished ? 'published' : 'draft');
  if (status !== 'published') return FALLBACK_ABOUT;

  return {
    type: 'content_page',
    slug: 'about',
    title: data.title || FALLBACK_ABOUT.title,
    titleEn: data.titleEn || FALLBACK_ABOUT.titleEn,
    lastUpdatedText: data.lastUpdatedText || FALLBACK_ABOUT.lastUpdatedText,
    status: 'published',
    isPublished: true,
    hero: data.hero || FALLBACK_ABOUT.hero,
    stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : FALLBACK_ABOUT.stats,
    story: data.story || FALLBACK_ABOUT.story,
    values: Array.isArray(data.values) && data.values.length > 0 ? data.values : FALLBACK_ABOUT.values,
    team: Array.isArray(data.team) && data.team.length > 0 ? data.team : FALLBACK_ABOUT.team,
  };
}

async function fetchLegalInternal(slug: 'privacy' | 'terms'): Promise<LegalPageData> {
  const fallback = slug === 'privacy' ? FALLBACK_PRIVACY : FALLBACK_TERMS;
  const data = await CmsClient.getDoc<Record<string, any>>('website_pages', slug);
  if (!data) return fallback;

  const status = data.status || (data.isPublished ? 'published' : 'draft');
  if (status !== 'published') return fallback;

  let sections = data.sections;
  // If legacy content map was stored, normalize it
  if (!Array.isArray(sections) && data.content?.rawContent) {
    sections = [
      {
        id: 'main',
        title: data.title || fallback.title,
        content: [String(data.content.rawContent)],
      },
    ];
  }

  return {
    type: 'legal_page',
    slug,
    title: data.title || fallback.title,
    titleEn: data.titleEn || fallback.titleEn,
    lastUpdatedText: data.lastUpdatedText || fallback.lastUpdatedText,
    status: 'published',
    isPublished: true,
    intro: data.intro || fallback.intro,
    sections: Array.isArray(sections) && sections.length > 0 ? sections : fallback.sections,
  };
}

async function fetchDevelopersInternal(): Promise<DevelopersPageData> {
  const data = await CmsClient.getDoc<Record<string, any>>('website_pages', 'developers');
  if (!data) return FALLBACK_DEVELOPERS;

  const status = data.status || (data.isPublished ? 'published' : 'draft');
  if (status !== 'published') return FALLBACK_DEVELOPERS;

  return {
    type: 'developers_page',
    slug: 'developers',
    title: data.title || FALLBACK_DEVELOPERS.title,
    titleEn: data.titleEn || FALLBACK_DEVELOPERS.titleEn,
    status: 'published',
    isPublished: true,
    hero: data.hero || FALLBACK_DEVELOPERS.hero,
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : FALLBACK_DEVELOPERS.features,
    plans: Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : FALLBACK_DEVELOPERS.plans,
    faq: Array.isArray(data.faq) && data.faq.length > 0 ? data.faq : FALLBACK_DEVELOPERS.faq,
  };
}

export class PagesCmsService {
  /**
   * Cached getter for About page (Tagged: 'cms:page:about').
   */
  static getAboutPage = unstable_cache(
    fetchAboutInternal,
    ['website_pages_about'],
    { revalidate: 86400, tags: ['cms:pages', 'cms:page:about'] }
  );

  /**
   * Cached getter for Privacy Policy (Tagged: 'cms:page:privacy').
   */
  static getPrivacyPage = unstable_cache(
    () => fetchLegalInternal('privacy'),
    ['website_pages_privacy'],
    { revalidate: 86400, tags: ['cms:pages', 'cms:page:privacy'] }
  );

  /**
   * Cached getter for Terms of Service (Tagged: 'cms:page:terms').
   */
  static getTermsPage = unstable_cache(
    () => fetchLegalInternal('terms'),
    ['website_pages_terms'],
    { revalidate: 86400, tags: ['cms:pages', 'cms:page:terms'] }
  );

  /**
   * Cached getter for Developers page (Tagged: 'cms:page:developers').
   */
  static getDevelopersPage = unstable_cache(
    fetchDevelopersInternal,
    ['website_pages_developers'],
    { revalidate: 86400, tags: ['cms:pages', 'cms:page:developers'] }
  );
}
