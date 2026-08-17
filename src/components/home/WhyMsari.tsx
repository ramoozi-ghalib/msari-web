import Link from 'next/link';
import { 
  Rocket, Shield, ShieldCheck, Clock, Tag, Globe, 
  Plug, Sparkles, Headphones, Building, ArrowLeft, Code
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

  return (
    <section className="py-14 sm:py-24 bg-[#F4F2F8]/60 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--brand-primary)] tracking-tight mb-2">
            {sectionTitle}
          </h2>
          <p className="text-neutral-600 text-xs sm:text-base font-semibold leading-relaxed">
            بنينا مساري لتكون منصة الحجز الأكثر موثوقية وأماناً للمسافر في اليمن والعالم
          </p>
        </div>

        {/* ── 2-Column Mobile Grid / 3-Column Desktop Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon || Shield;
            return (
              <div
                key={`${feature.title}-${idx}`}
                className="group relative p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-start"
              >
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-3 sm:mb-5 shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-lg font-black text-neutral-900 mb-1 sm:mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-500 text-[11px] sm:text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Luxury Interactive Partner Banner (Buttons Side-by-Side in 1 Row) ── */}
        <div className="mt-10 sm:mt-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0c0326] via-[#1a0654] to-[#2d1275] text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(35,9,110,0.3)] transition-all duration-500 border border-white/10">
          <div className="absolute top-0 end-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-center lg:text-start">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-black mb-2.5 border border-white/15">
                <Rocket size={13} className="text-[#FF3B30]" />
                <span>للشركاء والمطورين</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-white leading-snug mb-2">
                {partnerTitle}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                {partnerDesc}
              </p>
            </div>

            {/* Buttons in One Row (Mobile & Desktop) */}
            <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-initial shrink-0">
              <Link
                href="/add-hotel"
                className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>أضف فندقك</span>
                <ArrowLeft size={15} />
              </Link>
              <Link
                href="/developers"
                className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Code size={15} />
                <span>وثائق API</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
