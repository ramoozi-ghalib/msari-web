import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية — مساري',
  description: 'تعرف على كيفية جمع واستخدام وحماية بياناتك الشخصية على منصة مساري لخدمات السفر.',
};

const sections = [
  {
    title: '١. المعلومات التي نجمعها',
    content: [
      'المعلومات الشخصية التي تقدمها عند الحجز (الاسم، رقم الهاتف، البريد الإلكتروني)',
      'بيانات الحجز والرحلات التي تجريها عبر المنصة',
      'معلومات تقنية مثل عنوان IP ونوع المتصفح لتحسين تجربتك',
      'ملفات تعريف الارتباط (Cookies) لتسريع وتحسين أداء الموقع',
    ],
  },
  {
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
    title: '٣. حماية بياناتك',
    content: [
      'نستخدم بروتوكول HTTPS لتشفير جميع البيانات المنقولة',
      'لا نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية دون إذنك',
      'نشارك بيانات الحجز الضرورية فقط مع الفنادق والمزودين المعتمدين',
      'يحق لنا الكشف عن معلوماتك إذا طلب ذلك قانونياً',
    ],
  },
  {
    title: '٤. حقوقك',
    content: [
      'حق الوصول: يمكنك طلب نسخة من بياناتك الشخصية المحفوظة لدينا',
      'حق التصحيح: يمكنك تصحيح أي بيانات غير دقيقة',
      'حق الحذف: يمكنك طلب حذف بياناتك مع عدم المساس بحجوزاتك الفعلية',
      'حق إلغاء الاشتراك: يمكنك إلغاء تلقي الرسائل التسويقية في أي وقت',
    ],
  },
  {
    title: '٥. ملفات تعريف الارتباط (Cookies)',
    content: [
      'نستخدم cookies ضرورية لتشغيل الموقع بشكل صحيح',
      'cookies تحليلية لفهم كيفية استخدامك للموقع (مجهولة الهوية)',
      'يمكنك تعطيل cookies من إعدادات متصفحك، لكن قد يؤثر ذلك على بعض وظائف الموقع',
    ],
  },
  {
    title: '٦. التحديثات على هذه السياسة',
    content: [
      'قد نحدث هذه السياسة من وقت لآخر لتعكس التغييرات في خدماتنا أو القوانين',
      'سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار بارز على الموقع',
      'استمرارك في استخدام المنصة بعد التحديثات يعني موافقتك على السياسة الجديدة',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[#23096e] to-[#3A1C8F]">
        <div className="container-msari text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">سياسة الخصوصية</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية بأعلى المعايير.
          </p>
          <div className="mt-6 inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/70 text-sm">
            آخر تحديث: مارس ٢٠٢٦
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-msari py-16">
        <div className="max-w-3xl mx-auto">

          {/* Intro */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10">
            <p className="text-blue-800 text-sm leading-relaxed">
              <strong>ملخص مختصر:</strong> نجمع فقط ما نحتاجه لإتمام حجوزاتك. لا نبيع بياناتك. يمكنك طلب حذف بياناتك في أي وقت. إذا كانت لديك أسئلة، تواصل معنا على <a href="mailto:info@msari.net" className="text-blue-600 underline">info@msari.net</a>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-5">{section.title}</h2>
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-600 text-sm leading-relaxed">
                      <span className="w-5 h-5 bg-[#23096e]/10 text-[#23096e] rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-10 bg-[#23096e] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-black text-white mb-3">هل لديك استفسار حول خصوصيتك؟</h3>
            <p className="text-white/70 text-sm mb-6">تواصل مع فريق حماية البيانات لدينا</p>
            <a
              href="mailto:privacy@msari.net"
              className="inline-block bg-white text-[#23096e] font-black px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300"
            >
              privacy@msari.net
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
