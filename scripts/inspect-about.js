const admin = require('firebase-admin');
const fs = require('fs');

const keyPath = 'D:\\projects\\msari_dashboard\\functions\\serviceAccountKey.json';
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function updateDevelopersDoc() {
  const docRef = db.collection('website_pages').doc('developers');
  const snapshot = await docRef.get();
  console.log('Doc exists:', snapshot.exists);
  if (snapshot.exists) {
    console.log('Previous content:', JSON.stringify(snapshot.data(), null, 2));
  }

  const updatedData = {
    slug: 'developers',
    title: 'بوابة المطورين والـ API',
    titleEn: 'Developers & B2B API Portal',
    type: 'developers_page',
    status: 'published',
    isPublished: true,
    lastUpdatedText: 'مارس ٢٠٢٦',
    hero: {
      badge: 'B2B API Portal',
      title: 'اربط نظامك مع مخزون أكبر شبكة سفر في اليمن',
      subtitle: 'واجهة برمجية سريعة وموثوقة تتيح لك الوصول المباشر لآلاف الغرف الفندقية وتأكيد الحجوزات لحظياً',
    },
    features: [
      {
        icon: 'Zap',
        title: 'استجابة فائقة السرعة',
        desc: 'واجهة RESTful مبنية بتقنيات حديثة بوقت استجابة يقل عن 150ms مع استقرار عالي.',
      },
      {
        icon: 'ShieldCheck',
        title: 'توثيق وأمان مشدد',
        desc: 'مفاتيح API مشفرة مع صلاحيات دقيقة ومعدل طلبات آمن ومتوافق مع أعلى المعايير.',
      },
      {
        icon: 'Code',
        title: 'بيانات JSON قياسية',
        desc: 'بنية بيانات نظيفة وموثقة بالكامل مع توفير Webhooks للتحديثات الفورية.',
      },
      {
        icon: 'CheckCircle2',
        title: 'بيئة تجريبية Sandbox',
        desc: 'اختبر كافة عمليات البحث وتأكيد الحجز قبل إطلاق الربط المباشر في بيئة الإنتاج.',
      },
    ],
    plans: [
      {
        id: 'b2b_integration',
        name: 'خطة الشراكة والربط البرمجي (Msari B2B API)',
        price: 'حسب الاستخدام / عمولات مخصصة',
        description: 'خطة شاملة ومتكاملة لوكالات السفر، التطبيقات، ومنصات السفر للربط المباشر مع شبكة فنادق وخدمات مساري.',
        features: [
          'ربط فوري وتأكيد مباشر لجميع حجوزات الفنادق',
          'معدل طلبات غير محدود بوقت استجابة فائق < 150ms',
          'بيئة اختبار تجريبية كاملة (Sandbox Environment)',
          'تحديث لحظي لأسعار الغرف والتوفر بعدة عملات',
          'نظام Webhooks للإشعارات والتحديثات اللحظية',
          'دعم فني وهندسي مخصص 24/7 عبر واتساب',
          'عقد مستوى الخدمة المضمون (SLA 99.9%)',
        ],
        popular: true,
      },
    ],
    faq: [
      {
        q: 'كيف أحصل على مفتاح API؟',
        a: 'تواصل معنا عبر واتساب وسيتم تزويدك بمفتاح تجريبي وبيئة Sandbox خلال دقائق بعد مراجعة طلب الشراكة.',
      },
      {
        q: 'هل الـ API يدعم تأكيد الحجز الفوري؟',
        a: 'نعم، يتيح الـ API إتمام وتأكيد الحجز الفوري مع خصم التوفر لحظياً وإصدار رقم مرجعي معتمد ومباشر لدى إدارة الفندق.',
      },
      {
        q: 'ما هي صيغة البيانات المعتمدة؟',
        a: 'البيانات تُرسل وتُستقبل بصيغة JSON القياسية عبر بروتوكول HTTPS المشفر مع توفير Webhooks للإشعارات والتحديثات المباشرة.',
      },
    ],
    content: {
      hero: {
        badge: 'B2B API Portal',
        title: 'اربط نظامك مع مخزون أكبر شبكة سفر في اليمن',
        subtitle: 'واجهة برمجية سريعة وموثوقة تتيح لك الوصول المباشر لآلاف الغرف الفندقية وتأكيد الحجوزات لحظياً',
      },
      features: [
        {
          icon: 'Zap',
          title: 'استجابة فائقة السرعة',
          desc: 'واجهة RESTful مبنية بتقنيات حديثة بوقت استجابة يقل عن 150ms مع استقرار عالي.',
        },
        {
          icon: 'ShieldCheck',
          title: 'توثيق وأمان مشدد',
          desc: 'مفاتيح API مشفرة مع صلاحيات دقيقة ومعدل طلبات آمن ومتوافق مع أعلى المعايير.',
        },
        {
          icon: 'Code',
          title: 'بيانات JSON قياسية',
          desc: 'بنية بيانات نظيفة وموثقة بالكامل مع توفير Webhooks للتحديثات الفورية.',
        },
        {
          icon: 'CheckCircle2',
          title: 'بيئة تجريبية Sandbox',
          desc: 'اختبر كافة عمليات البحث وتأكيد الحجز قبل إطلاق الربط المباشر في بيئة الإنتاج.',
        },
      ],
      plans: [
        {
          id: 'b2b_integration',
          name: 'خطة الشراكة والربط البرمجي (Msari B2B API)',
          price: 'حسب الاستخدام / عمولات مخصصة',
          description: 'خطة شاملة ومتكاملة لوكالات السفر، التطبيقات، ومنصات السفر للربط المباشر مع شبكة فنادق وخدمات مساري.',
          features: [
            'ربط فوري وتأكيد مباشر لجميع حجوزات الفنادق',
            'معدل طلبات غير محدود بوقت استجابة فائق < 150ms',
            'بيئة اختبار تجريبية كاملة (Sandbox Environment)',
            'تحديث لحظي لأسعار الغرف والتوفر بعدة عملات',
            'نظام Webhooks للإشعارات والتحديثات اللحظية',
            'دعم فني وهندسي مخصص 24/7 عبر واتساب',
            'عقد مستوى الخدمة المضمون (SLA 99.9%)',
          ],
          popular: true,
        },
      ],
      faq: [
        {
          q: 'كيف أحصل على مفتاح API؟',
          a: 'تواصل معنا عبر واتساب وسيتم تزويدك بمفتاح تجريبي وبيئة Sandbox خلال دقائق بعد مراجعة طلب الشراكة.',
        },
        {
          q: 'هل الـ API يدعم تأكيد الحجز الفوري؟',
          a: 'نعم، يتيح الـ API إتمام وتأكيد الحجز الفوري مع خصم التوفر لحظياً وإصدار رقم مرجعي معتمد ومباشر لدى إدارة الفندق.',
        },
        {
          q: 'ما هي صيغة البيانات المعتمدة؟',
          a: 'البيانات تُرسل وتُستقبل بصيغة JSON القياسية عبر بروتوكول HTTPS المشفر مع توفير Webhooks للإشعارات والتحديثات المباشرة.',
        },
      ],
    },
    seo: {
      metaTitleAr: 'بوابة المطورين — مساري لخدمات السفر B2B API',
      metaDescriptionAr: 'اربط نظامك مع مخزون أكبر شبكة سفر وفنادق في اليمن عبر واجهة مساري البرمجية (API).',
    },
    updatedAt: new Date(),
  };

  await docRef.set(updatedData, { merge: true });
  console.log('✅ Successfully updated website_pages/developers in Firestore to 1 unified B2B plan!');
  process.exit(0);
}

updateDevelopersDoc().catch(err => {
  console.error(err);
  process.exit(1);
});

