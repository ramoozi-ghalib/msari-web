import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, Zap, HeartHandshake, Star, 
  MapPin, CheckCircle2, ArrowRight
} from 'lucide-react';
import { PagesCmsService } from '@/services/cms';

export const metadata: Metadata = {
  title: 'من نحن — مساري لخدمات السفر والسياحة',
  description: 'مساري هي منصة السفر الأولى والرائدة في اليمن، نربطك بأفضل الفنادق والرحلات الجوية وخدمات السيارات بأعلى معايير الأمان والشفافية.',
  alternates: { canonical: 'https://msari.net/ar/about' },
  openGraph: {
    title: 'من نحن — مساري لخدمات السفر والسياحة',
    description: 'مساري هي منصة السفر الأولى في اليمن، نربطك بأفضل الفنادق والرحلات الجوية وخدمات السيارات بأسعار تنافسية.',
    url: 'https://msari.net/ar/about',
  },
};

const VALUE_ICONS: Record<string, any> = {
  Shield: ShieldCheck,
  Zap: Zap,
  HeartHandshake: HeartHandshake,
  Star: Star,
};

export default async function AboutPage() {
  const data = await PagesCmsService.getAboutPage();

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
      
      {/* ─── 1. Spacious Clean Header ─── */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 border-b border-neutral-100 bg-[#fafafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold mb-6">
            <span>قصتنا ورؤيتنا</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 mb-6 tracking-tight leading-tight">
            {heroTitle}
          </h1>

          <p className="text-neutral-500 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* ─── 2. Integrated Clean Metrics Bar (No Overlapping Margin) ─── */}
      <section className="py-16 sm:py-20 border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {statsList.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-5xl font-black text-[var(--brand-primary)] tracking-tight">
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
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
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
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 leading-tight tracking-tight">
                {data?.story?.title || 'بوابتك الرقمية الموثوقة لاستكشاف اليمن'}
              </h2>

              <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed">
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
      <section className="py-20 sm:py-28 bg-[#fafafc] border-y border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 mb-4 tracking-tight">
              القيم التي تقود مسيرتنا
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
              نلتزم بأعلى معايير الخدمة والاحترافية لضمان راحة وطمأنينة كل مسافر يضع ثقته في مساري.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuesList.map((v, idx) => {
              const IconComponent = VALUE_ICONS[v.icon] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 border border-neutral-200/70 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-[var(--brand-primary)] flex items-center justify-center mb-5">
                    <IconComponent size={22} />
                  </div>
                  <h3 className="text-base font-black text-neutral-900 mb-2">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. Minimalist CTA Section ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl bg-[var(--brand-primary)] text-white p-10 sm:p-16 shadow-xl space-y-6">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              {data?.cta?.title || 'مستعد لسفرتك القادمة؟'}
            </h2>

            <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
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
