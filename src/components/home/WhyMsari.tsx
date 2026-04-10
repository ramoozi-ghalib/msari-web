import Link from 'next/link';
import { Zap, Shield, Globe, Star, Smartphone, Code } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  emoji: string;
  title: string;
  desc: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    emoji: '⚡',
    title: 'سرعة فائقة',
    desc: 'موقع مُحسَّن للسرعة القصوى، يُحمَّل في ثوانٍ على أي جهاز أو اتصال',
    color: 'from-[--brand-primary] to-[--brand-accent]',
  },
  {
    icon: Shield,
    emoji: '🔒',
    title: 'حجز آمن 100%',
    desc: 'نظام حجز مشفر وآمن مع تأكيد فوري وضمان استرداد كامل',
    color: 'from-[--brand-primary-light] to-[--brand-primary-dark]',
  },
  {
    icon: Globe,
    emoji: '🌍',
    title: 'محلي وعالمي',
    desc: 'فنادق يمنية بخبرة محلية، وفنادق عالمية عبر أهم الشراكات التقنية',
    color: 'from-[--brand-accent] to-[--brand-primary]',
  },
  {
    icon: Star,
    emoji: '⭐',
    title: 'تقييمات موثوقة',
    desc: 'آراء حقيقية من مسافرين زاروا الفنادق لمساعدتك في اتخاذ القرار الصحيح',
    color: 'from-[--brand-primary] to-[--neutral-700]',
  },
  {
    icon: Smartphone,
    emoji: '📱',
    title: 'تطبيق مساري',
    desc: 'تجربة متكاملة على هاتفك — احجز، تابع، وعدّل حجوزاتك بضغطة واحدة',
    color: 'from-[--neutral-600] to-[--brand-primary-dark]',
  },
  {
    icon: Code,
    emoji: '🔌',
    title: 'API للشركاء',
    desc: 'نوفر API متكامل لبيانات الفنادق اليمنية لأي شريك تقني يريد التكامل معنا',
    color: 'from-[--brand-secondary] to-red-600',
  },
];

export default function WhyMsari() {
  return (
    <section className="section-pad bg-white">
      <div className="container-msari">
        {/* Header */}
        <div className="text-center mb-12 group">
          <div className="section-tag mx-auto hover:scale-105 transition-transform duration-300">✨ لماذا مساري؟</div>
          <h2 className="section-title group-hover:text-[--brand-primary] transition-colors duration-300">المنصة التي تثق بها</h2>
          <p className="section-subtitle mx-auto text-center group-hover:text-neutral-600 transition-colors duration-300">
            بنيّنا مساري بكل تفاصيل المسافر اليمني وعرفنا احتياجاته — لتكون تجربة السفر أسهل وأوثق
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-[--neutral-100] hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {feature.emoji}
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-[--brand-primary] transition-colors duration-300">{feature.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-600 transition-colors duration-300">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14 p-10 rounded-3xl bg-gradient-to-br from-[--brand-primary] to-[--brand-accent] text-white hover:shadow-2xl transition-all duration-500 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
          <h3 className="text-2xl font-black mb-3 group-hover:text-white/90 transition-colors duration-300">هل أنت مزود فندق أو شريك تقني؟</h3>
          <p className="text-white/75 mb-6 max-w-xl mx-auto group-hover:text-white/85 transition-colors duration-300">
            انضم لشبكة مساري وتكامل مع منتجنا — سواء كنت صاحب فندق يمني أو مطور يريد الوصول لبيانات الفنادق عبر API موثوق.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/partner" className="btn bg-white text-[--brand-primary] hover:bg-neutral-100 font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
              أضف فندقك
            </Link>
            <Link href="/api-docs" className="btn btn-ghost hover:bg-white/20 transition-all duration-300">
              وثائق API ←
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
