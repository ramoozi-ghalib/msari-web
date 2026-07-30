import Link from 'next/link';

interface Feature {
  emoji: string;
  title: string;
  desc: string;
  color: string;
}

const features: Feature[] = [
  {
    emoji: '⚡',
    title: 'سرعة فائقة',
    desc: 'موقع مُحسَّن للسرعة القصوى، يُحمَّل في ثوانٍ على أي جهاز أو اتصال',
    color: 'from-[#23096E] to-[#3A1C8F]',
  },
  {
    emoji: '🔒',
    title: 'حجز آمن 100%',
    desc: 'نظام حجز مشفر وآمن مع تأكيد فوري وضمان استرداد كامل',
    color: 'from-[#3A1C8F] to-[#23096E]',
  },
  {
    emoji: '🌍',
    title: 'محلي وعالمي',
    desc: 'فنادق يمنية بخبرة محلية، وفنادق عالمية عبر أهم الشراكات التقنية',
    color: 'from-[#FF3B30] to-[#23096E]',
  },
  {
    emoji: '⭐',
    title: 'تقييمات موثوقة',
    desc: 'آراء حقيقية من مسافرين زاروا الفنادق لمساعدتك في اتخاذ القرار الصحيح',
    color: 'from-[#23096E] to-[#FF3B30]',
  },
  {
    emoji: '📱',
    title: 'تطبيق مساري',
    desc: 'تجربة متكاملة على هاتفك — احجز، تابع، وعدّل حجوزاتك بضغطة واحدة',
    color: 'from-[#3A1C8F] to-[#23096E]',
  },
  {
    emoji: '🔌',
    title: 'API للشركاء',
    desc: 'نوفر API متكامل لبيانات الفنادق اليمنية لأي شريك تقني يريد التكامل معنا',
    color: 'from-[#FF3B30] to-[#3A1C8F]',
  },
];

export default function WhyMsari() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container-msari">
        {/* Header */}
        <div className="text-center mb-14 group">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs sm:text-sm font-black mb-3 hover:scale-105 transition-transform duration-300">
            ✨ لماذا مساري؟
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E] mb-3 group-hover:text-[#3A1C8F] transition-colors duration-300">
            المنصة التي تثق بها
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
            بنيّنا مساري بكل تفاصيل المسافر اليمني وعرفنا احتياجاته — لتكون تجربة السفر أسهل وأوثق
          </p>
        </div>

        {/* Features Grid - Exact Original Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-slate-200/80 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center text-2xl mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {feature.emoji}
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-[#23096E] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-600 transition-colors duration-300">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA - Exact Original Gradient Box Design */}
        <div className="text-center mt-14 p-10 rounded-3xl bg-gradient-to-br from-[#23096E] to-[#FF3B30] text-white hover:shadow-2xl transition-all duration-500 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
          <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white group-hover:text-white/90 transition-colors duration-300">
            هل أنت مزود فندق أو شريك تقني؟
          </h3>
          <p className="text-white/85 mb-6 max-w-xl mx-auto font-medium text-base group-hover:text-white transition-colors duration-300">
            انضم لشبكة مساري وتكامل مع منتجنا — سواء كنت صاحب فندق يمني أو مطور يريد الوصول لبيانات الفنادق عبر API موثوق.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/add-hotel"
              className="px-6 py-3 rounded-xl bg-white text-[#23096E] hover:bg-slate-100 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              أضف فندقك
            </Link>
            <Link
              href="/developers"
              className="px-6 py-3 rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/20 font-bold transition-all duration-300"
            >
              وثائق API ←
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
