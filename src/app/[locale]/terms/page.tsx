import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام — مساري',
  description: 'شروط وأحكام استخدام منصة مساري لخدمات السفر والحجز في اليمن.',
};

const sections = [
  {
    title: '١. قبول الشروط',
    content: 'باستخدامك لمنصة مساري (msari.net)، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.',
  },
  {
    title: '٢. الحجوزات والأسعار',
    content: 'جميع الأسعار المعروضة على المنصة بالدولار الأمريكي (USD) ما لم يُشر لغير ذلك. الأسعار قابلة للتغيير وتعتمد على التوفر. الحجز لا يُعتبر مؤكداً حتى تتلقى تأكيداً رسمياً من فريقنا.',
  },
  {
    title: '٣. الإلغاء والاسترداد',
    content: 'سياسة الإلغاء تختلف من فندق لآخر وستظهر بوضوح قبل إتمام الحجز. عموماً، الإلغاء قبل ٢٤ ساعة من موعد الوصول يستحق استرداداً كاملاً. الإلغاء المتأخر قد يخضع لرسوم جزئية أو عدم استرداد وفقاً لسياسة الفندق.',
  },
  {
    title: '٤. مسؤوليات المستخدم',
    content: 'أنت مسؤول عن التحقق من صحة بيانات الحجز قبل التأكيد. أنت مسؤول عن امتلاك الوثائق الرسمية المطلوبة للسفر. يجب عدم استخدام المنصة لأي أغراض غير مشروعة.',
  },
  {
    title: '٥. حدود المسؤولية',
    content: 'مساري وسيط بينك وبين مزودي الخدمات (الفنادق وشركات النقل). لا تتحمل مساري مسؤولية أي خلاف مباشر مع مزودي الخدمات، لكننا ملتزمون بمساعدتك في حل أي مشكلة قدر المستطاع.',
  },
  {
    title: '٦. الملكية الفكرية',
    content: 'جميع محتويات المنصة (التصميم، الشعار، النصوص، الصور) هي ملكية حصرية لمساري ومحمية بقوانين الملكية الفكرية. لا يُسمح بإعادة نشر أو نسخ أي محتوى دون إذن خطي مسبق.',
  },
  {
    title: '٧. القانون الواجب التطبيق',
    content: 'تخضع هذه الشروط لقوانين جمهورية اليمن. أي نزاع ينشأ عن استخدام المنصة يُحل أولاً بالتفاوض الودي، ثم بالتحكيم إذا لزم الأمر.',
  },
  {
    title: '٨. التعديلات على الشروط',
    content: 'نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إعلامك بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار على الموقع. استمرارك في استخدام المنصة بعد التعديل يمثل قبولك للشروط الجديدة.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[#1a0654] to-[#23096e]">
        <div className="container-msari text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">شروط الاستخدام</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            يرجى قراءة هذه الشروط بعناية قبل استخدام منصة مساري.
          </p>
          <div className="mt-6 inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/70 text-sm">
            آخر تحديث: مارس ٢٠٢٦
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-msari py-16">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Intro box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>ملاحظة مهمة:</strong> هذه الشروط تحكم استخدامك لمنصة مساري. باستخدام المنصة، تقرّ بأنك قرأت وفهمت ووافقت على هذه الشروط.
            </p>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900 mb-4">{section.title}</h2>
              <p className="text-neutral-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}

          {/* Contact */}
          <div className="bg-[#23096e] rounded-2xl p-8 text-center mt-10">
            <h3 className="text-xl font-black text-white mb-3">لديك سؤال حول الشروط؟</h3>
            <p className="text-white/70 text-sm mb-6">فريقنا القانوني جاهز للإجابة</p>
            <a
              href="mailto:legal@msari.net"
              className="inline-block bg-white text-[#23096e] font-black px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300"
            >
              legal@msari.net
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
