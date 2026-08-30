import type { Metadata } from 'next';
import { PagesCmsService } from '@/services/cms';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn ? 'Privacy Policy | Msari' : 'سياسة الخصوصية | مساري';
  const description = isEn
    ? 'Learn how Msari collects, uses, and protects your personal data when booking hotels and travel services in Yemen.'
    : 'تعرف على كيفية جمع واستخدام وحماية بياناتك الشخصية على منصة مساري لخدمات السفر وحجز الفنادق في اليمن.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/privacy', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/privacy`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PrivacyPage() {
  const data = await PagesCmsService.getPrivacyPage();

  return (
    <div className="min-h-screen bg-[var(--surface-page)] surface-page">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)]">
        <div className="container-msari text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2.5">{data.title}</h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto">
            نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية بأعلى المعايير.
          </p>
          <div className="mt-6 inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/70 text-sm">
            آخر تحديث: {data.lastUpdatedText}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-msari py-16">
        <div className="max-w-3xl mx-auto">

          {/* Intro */}
          {data.intro && (
            <div className="bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/20 rounded-2xl p-6 mb-10">
              <p className="text-neutral-800 text-sm leading-relaxed">
                <strong>ملخص مختصر:</strong> {data.intro}
              </p>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-10">
            {(data.sections || []).map((section) => (
              <div key={section.id || section.title} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-5">{section.title}</h2>
                <ul className="space-y-3">
                  {(section.content || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-600 text-sm leading-relaxed">
                      <span className="w-5 h-5 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-10 bg-[var(--brand-primary)] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-black text-white mb-3">هل لديك استفسار حول خصوصيتك؟</h3>
            <p className="text-white/70 text-sm mb-6">تواصل مع فريق حماية البيانات لدينا</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {data.contactInfo?.email && (
                <a
                  href={`mailto:${data.contactInfo.email}`}
                  className="inline-block bg-white text-[var(--brand-primary)] font-black px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300"
                >
                  {data.contactInfo.email}
                </a>
              )}
              {data.contactInfo?.phone && (
                <a
                  href={`tel:${data.contactInfo.phone}`}
                  className="inline-block bg-white/10 border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
                  dir="ltr"
                >
                  {data.contactInfo.phone}
                </a>
              )}
            </div>
            {data.contactInfo?.address && (
              <p className="text-white/60 text-xs mt-4">
                {data.contactInfo.address}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
