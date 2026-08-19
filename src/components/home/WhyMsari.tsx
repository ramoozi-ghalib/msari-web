import Link from 'next/link';
import { 
  Rocket, CreditCard, Headset, BadgePercent, MapPinned, Globe2, 
  Code2, Shield, Clock, Tag, Globe, Sparkles, Building, ArrowLeft,
  Building2, PlaneTakeoff, ShieldCheck, LockKeyhole, PhoneCall
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
    icon: CreditCard,
  },
  {
    title: 'دعم على مدار الساعة',
    desc: 'فريقنا معك للرد على استفساراتك على مدار الساعة',
    color: 'from-[#3A1C8F] to-[#23096E]',
    icon: Headset,
  },
  {
    title: 'أفضل الأسعار',
    desc: 'عروض حصرية وأسعار تنافسية',
    color: 'from-[#FF3B30] to-[#23096E]',
    icon: BadgePercent,
  },
  {
    title: 'تغطية واسعة',
    desc: '10 مدن يمنية، وشراكات فنادق',
    color: 'from-[#FF3B30] to-[#3A1C8F]',
    icon: MapPinned,
  },
  {
    title: 'محلي وعالمي',
    desc: 'فنادق يمنية وعالمية، ومقارنة الأسعار والحجز',
    color: 'from-[#23096E] to-[#FF3B30]',
    icon: Globe2,
  },
  {
    title: 'API للشركاء',
    desc: 'نوفر API متكامل لأي شريك تقني يريد التكامل معنا',
    color: 'from-[#3A1C8F] to-[#23096E]',
    icon: Code2,
  },
];

function getWhyIcon(iconName?: string, idx: number = 0) {
  const name = (iconName || '').toLowerCase();
  
  if (name.includes('card') || name.includes('دفع') || name.includes('shield') || name.includes('safe') || name.includes('أمان') || idx === 0) {
    return CreditCard;
  }
  if (name.includes('headset') || name.includes('headphone') || name.includes('support') || name.includes('دعم') || name.includes('clock') || name.includes('24') || name.includes('ساعة') || idx === 1) {
    return Headset;
  }
  if (name.includes('percent') || name.includes('badge') || name.includes('tag') || name.includes('price') || name.includes('سعر') || name.includes('عرض') || idx === 2) {
    return BadgePercent;
  }
  if (name.includes('map') || name.includes('pin') || name.includes('مدن') || name.includes('تغطية') || idx === 3) {
    return MapPinned;
  }
  if (name.includes('globe') || name.includes('world') || name.includes('عالمي') || name.includes('محلي') || name.includes('sparkle') || idx === 4) {
    return Globe2;
  }
  if (name.includes('code') || name.includes('api') || name.includes('plug') || name.includes('شريك') || name.includes('مطور') || idx === 5) {
    return Code2;
  }

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

  return (
    <section className="py-10 sm:py-14 bg-[#F4F2F8]/60 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-2 sm:mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--brand-primary)] tracking-tight mb-1 sm:mb-2">
            {sectionTitle}
          </h2>
          <p className="text-neutral-600 text-xs sm:text-base font-semibold leading-relaxed">
            بنينا مساري لتكون منصة الحجز الأكثر موثوقية وأماناً للمسافر في اليمن والعالم
          </p>
        </div>

        {/* ── 2-Column Mobile Grid / 3-Column Desktop Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon || CreditCard;
            return (
              <div
                key={`${feature.title}-${idx}`}
                className="group relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-start"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-2.5 sm:mb-4 shadow-md border border-white/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xs sm:text-base font-black text-neutral-900 mb-1 group-hover:text-[var(--brand-primary)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-500 text-[10px] sm:text-xs leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Luxury Interactive Partner Banner (Buttons Side-by-Side in 1 Row) ── */}
        <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0c0326] via-[#1a0654] to-[#2d1275] text-white p-5 sm:p-8 shadow-2xl relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(35,9,110,0.3)] transition-all duration-500 border border-white/10">
          <div className="absolute top-0 end-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 text-center lg:text-start">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-black mb-2 border border-white/15">
                <Rocket size={13} className="text-[#FF3B30]" />
                <span>للشركاء والمطورين</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white leading-snug">
                {partnerTitle}
              </h3>
            </div>

            {/* Buttons in One Row (Mobile & Desktop) */}
            <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-initial shrink-0">
              <Link
                href="/add-hotel"
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>أضف فندقك</span>
                <ArrowLeft size={14} />
              </Link>
              <Link
                href="/developers"
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Code2 size={14} />
                <span>وثائق API</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
