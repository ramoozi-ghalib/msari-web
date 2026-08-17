import Link from 'next/link';
import { 
  Rocket, Shield, ShieldCheck, Clock, Tag, Globe, 
  Plug, Sparkles, CheckCircle2, Headphones, Building
} from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface WhyMsariProps {
  whyMsari?: HomepageContentData['whyMsari'];
}

const DEFAULT_FEATURES = [
  {
    title: 'دفع آمن',
    desc: 'حجز موثوق بلا مفاجآت، مع خيارات دفع مرنة تناسبك',
    color: 'from-[#23096E] to-[#3A1C8F]',
    icon: ShieldCheck,
  },
  {
    title: 'دعم على مدار الساعة',
    desc: 'فريقنا معك عبر واتساب في أي وقت تحتاجه',
    color: 'from-[#3A1C8F] to-[#23096E]',
    icon: Clock,
  },
  {
    title: 'أفضل الأسعار',
    desc: 'عروض حصرية وأسعار تنافسية مضمونة دائماً',
    color: 'from-[#FF3B30] to-[#23096E]',
    icon: Tag,
  },
  {
    title: 'تغطية واسعة',
    desc: '10 مدن يمنية وشراكات فنادق عالمية',
    color: 'from-[#FF3B30] to-[#3A1C8F]',
    icon: Globe,
  },
  {
    title: 'محلي وعالمي',
    desc: 'فنادق يمنية بخبرة محلية، وفنادق عالمية عبر أهم الشراكات',
    color: 'from-[#23096E] to-[#FF3B30]',
    icon: Sparkles,
  },
  {
    title: 'API للشركاء',
    desc: 'نوفر API متكامل لبيانات الفنادق اليمنية لأي شريك تقني',
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
  
  // Resolve features strictly from CMS if present (using titleAr/title, descAr/desc)
  const featuresList = (whyMsari?.features && whyMsari.features.length > 0)
    ? whyMsari.features.map((f: any, idx) => ({
        title: f.titleAr || f.title || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].title,
        desc: f.descAr || f.desc || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].desc,
        color: f.color || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].color,
        icon: getWhyIcon(f.icon, idx),
      }))
    : DEFAULT_FEATURES;

  const partnerTitle = whyMsari?.partnerCta?.titleAr || 'هل أنت مزود فندق أو شريك تقني؟ انضم لشبكة مساري';
  const partnerDesc = whyMsari?.partnerCta?.descriptionAr || 'انضم لشبكة مساري وتكامل مع منتجنا — سواء كنت صاحب فندق يمني أو مطور يريد الوصول لبيانات الفنادق عبر API موثوق.';
  const partnerBtnText = whyMsari?.partnerCta?.buttonTextAr || 'وثائق API ←';
  const partnerHref = whyMsari?.partnerCta?.href || '/developers';

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container-msari">
        {/* Header */}
        <div className="text-center mb-14 group">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs sm:text-sm font-black mb-3 hover:scale-105 transition-transform duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
            {badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E] mb-3 group-hover:text-[#3A1C8F] transition-colors duration-300">
            {sectionTitle}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
            بنيّنا مساري بكل تفاصيل المسافر اليمني وعرفنا احتياجاته — لتكون تجربة السفر أسهل وأوثق
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${Math.min(featuresList.length, 6)} gap-4 sm:gap-6`}>
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon || Shield;
            return (
              <div
                key={`${feature.title}-${idx}`}
                className="why-card group p-4 sm:p-5 lg:p-5 rounded-2xl border border-neutral-200/80 bg-white cursor-pointer shadow-[0_1px_3px_rgba(23,15,46,0.06),0_1px_2px_rgba(23,15,46,0.05)] hover:shadow-[0_4px_10px_rgba(35,9,110,0.05),0_10px_26px_rgba(35,9,110,0.09)] transition-all duration-300"
              >
                <div className={`why-icon w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-4 lg:mb-5 shadow-md`}>
                  <Icon size={24} className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Partner CTA */}
        <div className="text-center mt-14 p-10 rounded-3xl bg-gradient-to-br from-[#23096E] to-[#FF3B30] text-white hover:shadow-2xl transition-all duration-500 group">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <Rocket size={26} strokeWidth={2} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white group-hover:text-white/90 transition-colors duration-300">
            {partnerTitle}
          </h3>
          <p className="text-white/85 mb-6 max-w-xl mx-auto font-medium text-base group-hover:text-white transition-colors duration-300">
            {partnerDesc}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/add-hotel"
              className="px-6 py-3 rounded-xl bg-white text-[#23096E] hover:bg-slate-100 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              أضف فندقك
            </Link>
            <Link
              href={partnerHref}
              className="px-6 py-3 rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/20 font-bold transition-all duration-300"
            >
              {partnerBtnText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
