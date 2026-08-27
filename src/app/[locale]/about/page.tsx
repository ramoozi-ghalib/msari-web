import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, Zap, HeartHandshake, Star, 
  MapPin, CheckCircle2, Sparkles
} from 'lucide-react';
import { PagesCmsService } from '@/services/cms';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'About Us — Msari Travel & Tourism Services'
    : 'من نحن — مساري لخدمات السفر والسياحة';

  const description = isEn
    ? 'Msari is the leading travel platform in Yemen, connecting you with top hotels, flights, and car transportation with highest safety standards.'
    : 'مساري هي منصة السفر الأولى والرائدة في اليمن، نربطك بأفضل الفنادق والرحلات الجوية وخدمات السيارات بأعلى معايير الأمان والشفافية.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/about', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/about`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const VALUE_ICONS: Record<string, any> = {
  Shield: ShieldCheck,
  Zap: Zap,
  HeartHandshake: HeartHandshake,
  Star: Star,
};

export default async function AboutPage() {
  const data = await PagesCmsService.getAboutPage();

  const heroBadge = data?.hero?.badge || 'منصة السفر الأولى في اليمن';
  const heroTitle = data?.hero?.title || 'نعيد ابتكار تجربة السفر في اليمن';
  const heroSubtitle = data?.hero?.subtitle || 'منصة يمنية حديثة تجمع بين التكنولوجيا المتقدمة والضيافة اليمنية الأصيلة لتسهيل حجز الفنادق والتنقلات بأعلى معايير الراحة والأمان.';

  const statsList = (data?.stats && data.stats.length > 0) ? data.stats : [
    { value: '+500', label: 'فندق وشاليه شريك' },
    { value: '10+', label: 'مدن ومحافظات مغطاة' },
    { value: '+5000', label: 'حجز فندقي مؤكد' },
    { value: '24/7', label: 'دعم محلي متواصل' },
  ];

  const valuesList = (data?.values && data.values.length > 0) ? data.values : [
    { icon: 'Shield', title: 'الأمان والموثوقية', desc: 'حجوزات مؤكدة بنسبة 100% مع ضمان أفضل الأسعار وتأمين المعاملات بالكامل.' },
    { icon: 'Zap', title: 'السرعة والسهولة', desc: 'إتمام الحجز واستلام القسيمة فورياً عبر الموقع أو تطبيق الجوال.' },
    { icon: 'HeartHandshake', title: 'الضيافة الأصيلة', desc: 'خدمة عملاء تهتم بجميع احتياجاتك وترافقك خطوة بخطوة.' },
    { icon: 'Star', title: 'أعلى معايير الجودة', desc: 'اختيار وتدقيق الفنادق ووسائل النقل لضمان إقامة مريحة وآمنة.' },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      
      {/* ─── 1. Elegant Brand Hero Header ─── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white overflow-hidden">
        {/* Subtle Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-20 -start-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm font-bold mb-6 border border-white/15 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-300" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            {heroTitle}
          </h1>

          <p className="text-white/80 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* ─── 2. Integrated Clean Metrics Bar (Spacious & Separated) ─── */}
      <section className="py-12 sm:py-16 border-b border-neutral-100 bg-[#fafafc]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {statsList.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--brand-primary)] tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-neutral-500 font-bold">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Editorial Story Section (Spacious 2-Columns) ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Image Column */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-neutral-100">
              <Image
                src={data?.story?.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop'}
                alt="مساري لخدمات السفر"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Narrative Text Column */}
            <div className="space-y-5">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 leading-tight tracking-tight">
                {data?.story?.title || 'بوابتك الرقمية الموثوقة لاستكشاف اليمن'}
              </h2>

              <div className="space-y-3.5 text-neutral-600 text-xs sm:text-sm leading-relaxed">
                {(data?.story?.paragraphs && data.story.paragraphs.length > 0) ? (
                  data.story.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))
                ) : (
                  <>
                    <p>
                      انطلقت <strong className="text-neutral-900 font-black">مساري</strong> برؤية واضحة تجعل السفر وحجز الإقامة في اليمن تجربة سهلة، آمنة وموثوقة بنقرة زر واحدة.
                    </p>
                    <p>
                      نحن نربط المسافرين بأفضل الفنادق وخدمات النقل بأسعار شفافة ودون أي تعقيدات، مع توفير خيارات دفع مرنة ودعم محلي مستمر.
                    </p>
                  </>
                )}
              </div>

              <div className="pt-2 flex items-center gap-6 text-xs sm:text-sm text-neutral-500 font-semibold">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--brand-primary)]" />
                  <span>{data?.story?.locationText || 'المقر الرئيسي: عدن، اليمن'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>ترخيص رسمي معتمد</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. Values Section (Clean Light Canvas) ─── */}
      <section className="py-16 sm:py-24 bg-[#fafafc] border-y border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 mb-2.5 tracking-tight">
              القيم التي تقود مسيرتنا
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
              نلتزم بأعلى معايير الخدمة والاحترافية لضمان راحة وطمأنينة كل مسافر يضع ثقته في مساري.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuesList.map((v, idx) => {
              const IconComponent = VALUE_ICONS[v.icon] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-neutral-200/70 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-[var(--brand-primary)] flex items-center justify-center mb-4">
                    <IconComponent size={20} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 mb-1.5">
                    {v.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. Minimalist CTA Section ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl bg-[var(--brand-primary)] text-white p-8 sm:p-14 shadow-xl space-y-5">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
              {data?.cta?.title || 'مستعد لسفرتك القادمة؟'}
            </h2>

            <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
              {data?.cta?.subtitle || 'احجز الآن واستمتع بأفضل تجربة حجز وإقامة في اليمن.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/hotels"
                className="px-8 py-3.5 rounded-xl bg-white text-[var(--brand-primary)] hover:bg-neutral-100 font-bold text-sm transition-all duration-200 shadow-md"
              >
                تصفح الفنادق المتاحة
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all duration-200"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
