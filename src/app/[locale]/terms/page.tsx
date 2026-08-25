import type { Metadata } from 'next';
import { PagesCmsService } from '@/services/cms';

export const metadata: Metadata = {
  title: 'شروط الاستخدام — مساري',
  description: 'شروط وأحكام استخدام منصة مساري لخدمات السفر والحجز في اليمن.',
  alternates: { canonical: 'https://msari.net/ar/terms' },
  openGraph: {
    title: 'شروط الاستخدام — مساري',
    description: 'شروط وأحكام استخدام منصة مساري لخدمات السفر والحجز في اليمن.',
    url: 'https://msari.net/ar/terms',
  },
};

export default async function TermsPage() {
  const data = await PagesCmsService.getTermsPage();

  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[#1a0654] to-[#23096e]">
        <div className="container-msari text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2.5">{data.title}</h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto">
            يرجى قراءة هذه الشروط بعناية قبل استخدام منصة مساري.
          </p>
          <div className="mt-6 inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/70 text-sm">
            آخر تحديث: {data.lastUpdatedText}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-msari py-16">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Intro box */}
          {data.intro && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>ملاحظة مهمة:</strong> {data.intro}
              </p>
            </div>
          )}

          {/* Sections */}
          {data.sections.map((section) => (
            <div key={section.id || section.title} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900 mb-4">{section.title}</h2>
              {section.content.map((p, idx) => (
                <p key={idx} className="text-neutral-600 text-sm leading-relaxed mb-2">
                  {p}
                </p>
              ))}
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
