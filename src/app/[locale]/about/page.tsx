import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, Users, Star, Shield, Zap, HeartHandshake, 
  Sparkles, CheckCircle2, Award, Compass, Hotel, 
  CreditCard, Headphones, ArrowLeft, ArrowRight, ShieldCheck, Globe
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
  Award: Award,
  Compass: Compass,
};

export default async function AboutPage() {
  const data = await PagesCmsService.getAboutPage();

  const heroBadge = data?.hero?.badge || 'منصة السفر الأولى في اليمن';
  const heroTitle = data?.hero?.title || 'نعيد تعريف تجربة السفر في اليمن';
  const heroSubtitle = data?.hero?.subtitle || 'نسعى لتمكين كل مسافر من استكشاف جمال اليمن والعالم بكل سهولة وأمان، عبر تقنيات رقمية حديثة وخدمة عملاء استثنائية.';

  const statsList = (data?.stats && data.stats.length > 0) ? data.stats : [
    { value: '+50,000', label: 'مسافر وثقوا بخدماتنا' },
    { value: '+500', label: 'فندق وشاليه معتمد' },
    { value: '10+', label: 'محافظات يمنية مغطاة' },
    { value: '24/7', label: 'دعم وخدمة متواصلة' },
  ];

  const valuesList = (data?.values && data.values.length > 0) ? data.values : [
    { icon: 'Shield', title: 'الأمان والموثوقية', desc: 'نضمن حجزك 100% مع أعلى معايير الخصوصية وتأمين بياناتك ومعاملاتك المالية.' },
    { icon: 'HeartHandshake', title: 'الشفافية المطلقة', desc: 'أسعار واضحة ومباشرة بدون أي رسوم خفية أو تكاليف غير معلنة.' },
    { icon: 'Zap', title: 'السرعة والابتكار', desc: 'تأكيد فوري لحجوزاتك بلمسة زر عبر واجهات سلسة وتقنيات متطورة.' },
    { icon: 'Star', title: 'الجودة الاستثنائية', desc: 'شراكات مع أرقى الفنادق ومقدمي الخدمات لضمان إقامة وتجربة سفر لا تُنسى.' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] text-neutral-900 selection:bg-[var(--brand-primary)] selection:text-white">
      
      {/* ─── 1. Cinematic Hero Section ─── */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white overflow-hidden">
        {/* Ambient Glows & Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute top-1/2 -start-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -end-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container-msari relative z-10 text-center px-4 sm:px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm font-bold mb-6 border border-white/15 backdrop-blur-md shadow-sm">
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
            <span>{heroBadge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight max-w-4xl mx-auto tracking-tight drop-shadow-md">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium mb-10">
            {heroSubtitle}
          </p>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90">
              <CheckCircle2 size={14} className="text-emerald-400" /> حجز فوري ومؤكد
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90">
              <CheckCircle2 size={14} className="text-emerald-400" /> دعم محلي 24 ساعة
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90">
              <CheckCircle2 size={14} className="text-emerald-400" /> دفع مرن بالريال والدولار
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. Floating Impact Metrics Bar ─── */}
      <section className="container-msari -mt-12 sm:-mt-16 relative z-20 px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {statsList.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-center shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-2xl sm:text-4xl font-black text-[var(--brand-primary)] mb-1.5 tracking-tight group-hover:scale-105 transition-transform duration-300">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 font-bold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. The Story & Vision Section ─── */}
      <section className="container-msari px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Narrative Side (7 Cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-xs sm:text-sm font-black">
              <Compass size={16} />
              <span>{data?.story?.badge || 'قصة مساري'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 leading-tight tracking-tight">
              {data?.story?.title || 'انطلقنا برؤية طموحة لتسهيل السفر والسياحة'}
            </h2>

            <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed">
              {(data?.story?.paragraphs && data.story.paragraphs.length > 0) ? (
                data.story.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))
              ) : (
                <>
                  <p>
                    تأسست منصة <strong className="text-neutral-900 font-black">مساري</strong> انطلاقاً من الحاجة الملحة لوجود بوابة رقمية متكاملة وموثوقة تخدم المسافرين داخل اليمن وخارجه، وتوفر لهم تجربة حجز عصرية تضاهي المنصات العالمية الرائدة.
                  </p>
                  <p>
                    نعمل جنباً إلى جنب مع مئات الفنادق والمنتجعات وشركات النقل المعتمدة في مختلف المحافظات، لتقديم أفضل العروض والأسعار مع ضمان تأكيد الحجز الفوري والدعم المستمر على مدار الساعة.
                  </p>
                </>
              )}
            </div>

            {/* Location & Trust Footer */}
            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-6 text-sm text-neutral-700 font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <span>{data?.story?.locationText || 'المقر الرئيسي: عدن، الجمهورية اليمنية'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <span>ترخيص رسمي معتمد</span>
              </div>
            </div>
          </div>

          {/* Imagery & Card Stack Side (5 Cols on lg) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src={data?.story?.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop'}
                alt="مساري لخدمات السفر"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b0654]/60 via-transparent to-transparent" />
            </div>

            {/* Floating Trust Card 1 (Satisfied Guests) */}
            <div className="absolute -bottom-6 -start-4 sm:-start-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-neutral-100/80 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white flex items-center justify-center shrink-0 shadow-md">
                <Users size={22} />
              </div>
              <div>
                <div className="font-black text-neutral-900 text-lg sm:text-xl tracking-tight">
                  {data?.story?.satisfiedClientsCount || '+50,000'}
                </div>
                <div className="text-xs text-neutral-500 font-bold">مسافر راضٍ ومطمئن</div>
              </div>
            </div>

            {/* Floating Trust Card 2 (Top Rating Badge) */}
            <div className="absolute -top-4 -end-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg border border-neutral-100/80 flex items-center gap-2">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-neutral-900">4.9 / 5 تقييم النزلاء</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 4. Core Values Section ─── */}
      <section className="bg-gradient-to-b from-[#1b0654] via-[#23096e] to-[#200760] py-20 lg:py-28 text-white relative overflow-hidden mb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

        <div className="container-msari px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-bold mb-4 border border-white/15 backdrop-blur-md">
              <Award size={14} className="text-amber-300" />
              <span>مبادئنا الأساسية</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              القيم التي تقود مسيرتنا
            </h2>
            <p className="text-white/75 text-sm sm:text-base leading-relaxed">
              نلتزم بأعلى معايير الخدمة والاحترافية لضمان راحة وطمأنينة كل مسافر يضع ثقته في مساري.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuesList.map((v, idx) => {
              const IconComponent = VALUE_ICONS[v.icon] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 shadow-lg group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6 text-amber-300 group-hover:scale-110 transition-transform">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="text-white font-black text-lg sm:text-xl mb-3 tracking-tight">
                    {v.title}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-medium">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. Why Choose Msari Grid ─── */}
      <section className="container-msari px-4 sm:px-6 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-xs sm:text-sm font-black mb-4">
            <Sparkles size={16} />
            <span>لماذا مساري؟</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-4">
            ما الذي يميزنا عن غيرنا؟
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            صممنا مساري ليكون رفيقك الموثوق والذكي في كل رحلة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm hover:shadow-xl hover:border-[var(--brand-primary)]/20 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[var(--brand-primary)] flex items-center justify-center mb-6 font-black text-xl">
              <Hotel size={28} />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3 tracking-tight">
              أوسع شبكة فنادق محلية
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              تغطية شاملة لأفضل وأرقى الفنادق والشاليهات والأجنحة في عدن، صنعاء، حضرموت، وكافة المدن اليمنية بأسعار معتمدة ومباشرة.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm hover:shadow-xl hover:border-[var(--brand-primary)]/20 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 font-black text-xl">
              <CreditCard size={28} />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3 tracking-tight">
              مرونة دفع محلية كاملة
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              ندعم جميع طرق الدفع المناسبة لك: حوالات بنكية محلية لكافة البنوك، الدفع عند الوصول، وبالعملات المختلفة (YER، SAR، USD).
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm hover:shadow-xl hover:border-[var(--brand-primary)]/20 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 font-black text-xl">
              <Headphones size={28} />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3 tracking-tight">
              فريق دعم محلي على مدار الساعة
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              فريقنا متواجد ومتاح 24/7 عبر واتساب والمكالمات لمساعدتك في أي استفسار أو تعديل طارئ لرحلتك دون أي تعقيد.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 6. High-Conversion Luxury CTA Banner ─── */}
      <section className="container-msari px-4 sm:px-6 mb-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] p-8 sm:p-14 text-center text-white overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 end-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white/90 border border-white/15 backdrop-blur-md">
              <Sparkles size={14} className="text-amber-300" />
              <span>ابدأ تجربتك اليوم</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {data?.cta?.title || 'مستعد لحجز إقامتك ورحلتك القادمة؟'}
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              {data?.cta?.subtitle || 'استكشف أفضل خيارات الإقامة والرحلات بأفضل الأسعار مع تأكيد فوري ودعم مباشر.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/hotels"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#23096e] hover:bg-neutral-100 font-black text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-center"
              >
                تصفح الفنادق المتاحة
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all duration-200 backdrop-blur-md text-center"
              >
                تواصل مع فريق الدعم
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
