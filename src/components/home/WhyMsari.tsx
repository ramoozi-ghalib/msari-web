import Link from 'next/link';
import { 
  Rocket, Shield, ShieldCheck, Clock, Tag, Globe, 
  Plug, Sparkles, CheckCircle2, Headphones, Building, ArrowLeft
} from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface WhyMsariProps {
  whyMsari?: HomepageContentData['whyMsari'];
}

const DEFAULT_FEATURES = [
  {
    title: 'دفع آمن',
    desc: 'حجز موثوق مع خيارات دفع مرنة تناسبك',
    color: 'from-[#23096E] to-[#3A1C8F]',
    icon: ShieldCheck,
  },
  {
    title: 'دعم على مدار الساعة',
    desc: 'فريقنا معك للرد على استفساراتك على مدار الساعة',
    color: 'from-[#3A1C8F] to-[#23096E]',
    icon: Clock,
  },
  {
    title: 'أفضل الأسعار',
    desc: 'عروض حصرية وأسعار تنافسية',
    color: 'from-[#FF3B30] to-[#23096E]',
    icon: Tag,
  },
  {
    title: 'تغطية واسعة',
    desc: '10 مدن يمنية، وشراكات فنادق',
    color: 'from-[#FF3B30] to-[#3A1C8F]',
    icon: Globe,
  },
  {
    title: 'محلي وعالمي',
    desc: 'فنادق يمنية وعالمية، ومقارنة الأسعار والحجز',
    color: 'from-[#23096E] to-[#FF3B30]',
    icon: Sparkles,
  },
  {
    title: 'API للشركاء',
    desc: 'نوفر API متكامل لأي شريك تقني يريد التكامل معنا',
    color: 'from-[#3A1C8F] to-[#23096E]',
    icon: Plug,
  },
];

function getWhyIcon(iconName?: string, idx: number = 0) {
  const name = (iconName || '').toLowerCase();
  if (name.includes('shieldcheck') || name.includes('check')) return ShieldCheck;
  if (name.includes('shield') || name.includes('safe') || name.includes('أمان')) return Shield;
  if (name.includes('clock') || name.includes('time') || name.includes('24') || name.includes('ساعة')) return Clock;
  if (name.includes('tag') || name.includes('price') || name.includes('سعر') || name.includes('عرض')) return Tag;
  if (name.includes('globe') || name.includes('world') || name.includes('مدن') || name.includes('تغطية')) return Globe;
  if (name.includes('sparkle') || name.includes('star') || name.includes('محلي')) return Sparkles;
  if (name.includes('plug') || name.includes('api') || name.includes('شريك')) return Plug;
  if (name.includes('rocket') || name.includes('صاروخ')) return Rocket;
  if (name.includes('headphone') || name.includes('support') || name.includes('دعم')) return Headphones;
  if (name.includes('build') || name.includes('hotel') || name.includes('فندق')) return Building;

  return DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].icon;
}

export default function WhyMsari({ whyMsari }: WhyMsariProps) {
  const sectionTitle = whyMsari?.sectionTitleAr || 'المنصة التي تثق بها';
  const badge = whyMsari?.badgeAr || 'لماذا مساري';
  
  // Resolve features directly from CMS (using titleAr/title, descAr/desc)
  const featuresList = (whyMsari?.features && whyMsari.features.length > 0)
    ? whyMsari.features.map((f: any, idx) => ({
        title: f.titleAr || f.title || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].title,
        desc: f.descAr || f.desc || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].desc,
        color: f.color || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].color,
        icon: getWhyIcon(f.icon, idx),
      }))
    : DEFAULT_FEATURES;

  const partnerTitle = whyMsari?.partnerCta?.titleAr || 'هل أنت مزود فندق أو شريك تقني؟ انضم لشبكة مساري';
  const partnerDesc = whyMsari?.partnerCta?.descriptionAr || 'انضم لشبكة مساري وضاعف حجوزاتك مع نظام إدارة متكامل وربط برمجي مباشر';
  const partnerBtnText = whyMsari?.partnerCta?.buttonTextAr || 'وثائق API ←';
  const partnerHref = whyMsari?.partnerCta?.href || '/developers';

  return (
    <section className="py-20 sm:py-28 bg-[#F4F2F8]/50 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs sm:text-sm font-black mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--brand-primary)] tracking-tight mb-3">
            {sectionTitle}
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base font-semibold leading-relaxed">
            بنينا مساري لتكون منصة الحجز الأكثر موثوقية وأماناً للمسافر في اليمن والعالم
          </p>
        </div>

        {/* ── Modern Trust Matrix Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon || Shield;
            return (
              <div
                key={`${feature.title}-${idx}`}
                className="group relative p-6 sm:p-7 rounded-3xl bg-white border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-start"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="shrink-0" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Luxury Partner Banner ── */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-[#0c0326] via-[#1a0654] to-[#2d1275] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 end-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 text-start">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-black mb-3 border border-white/15">
                <Rocket size={13} className="text-[#FF3B30]" />
                <span>للشركاء والمطورين</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-snug mb-3">
                {partnerTitle}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                {partnerDesc}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/add-hotel"
                className="px-7 py-3.5 rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-sm shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                <span>أضف فندقك</span>
                <ArrowLeft size={16} />
              </Link>
              <Link
                href={partnerHref}
                className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all"
              >
                {partnerBtnText}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
