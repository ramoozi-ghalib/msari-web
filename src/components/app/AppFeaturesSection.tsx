'use client';

import { Zap, Headphones, Layers, ShieldCheck } from 'lucide-react';

interface Props {
  isEn?: boolean;
}

export default function AppFeaturesSection({ isEn = false }: Props) {
  const features = [
    {
      icon: Zap,
      title: isEn ? 'Fast & Effortless Booking' : 'تجربة حجز سهلة وسريعة',
      desc: isEn
        ? 'A smooth, intuitive interface that lets you complete your bookings in under a minute.'
        : 'واجهة مستخدم مرنة وبسيطة تتيح لك إتمام حجوزاتك في دقيقة واحدة دون أي تعقيدات.',
      color: 'from-[#23096E] to-[#3A1C8F]',
      badge: isEn ? 'Speed & Precision' : 'سرعة ودقة',
    },
    {
      icon: Headphones,
      title: isEn ? '24/7 Dedicated Support' : 'دعم فني على مدار الساعة',
      desc: isEn
        ? 'A local expert team ready to assist you via WhatsApp and phone around the clock.'
        : 'فريق محلي متخصص جاهز لمساعدتك عبر الواتساب والاتصال لضمان إقامة مريحة.',
      color: 'from-[#3A1C8F] to-[#23096E]',
      badge: isEn ? 'Yemeni Support 24/7' : 'دعم يمني 24/7',
    },
    {
      icon: Layers,
      title: isEn ? 'All-in-One Travel App' : 'تطبيق شامل ومبتكر',
      desc: isEn
        ? 'Book hotels, flight tickets, and car rentals across all Yemeni governorates in one place.'
        : 'حجز فنادق، تذاكر طيران، وتأجير سيارات ونقل في جميع المحافظات من مكان واحد.',
      color: 'from-[#FF3B30] to-[#e02d23]',
      badge: isEn ? 'Hotels, Flights, Cars' : 'فنادق وطيران وسيارات',
    },
    {
      icon: ShieldCheck,
      title: isEn ? 'Best Price & Security Guarantee' : 'أمان وضمان أفضل سعر',
      desc: isEn
        ? 'Direct competitive rates with instant booking confirmation and zero hidden fees.'
        : 'أسعار مباشرة وتنافسية مع تأكيد حجز فوري ودون أي رسوم خفية.',
      color: 'from-emerald-600 to-teal-700',
      badge: isEn ? 'Secured & Guaranteed' : 'أمان وضمان',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F4F2F8]/70 relative overflow-hidden">
      {/* Glow shape */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#23096E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs font-black">
            {isEn ? 'Features & Benefits' : 'المميزات والفوائد'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E]">
            {isEn ? 'Why Choose Msari App?' : 'لماذا تختار تطبيق مساري؟'}
          </h2>
          <p className="text-slate-700 text-base sm:text-lg font-bold">
            {isEn
              ? 'Crafted to give you the fastest, easiest accommodation and travel booking experience in Yemen'
              : 'صُمم التطبيق ليوفر لك أسهل وأسرع تجربة حجز إقامة وسفر في اليمن'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white border border-slate-200/90 rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-[#23096E]/10 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black px-3 py-1 rounded-full bg-[#F4F2F8] text-[#23096E] border border-slate-200">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-[#23096E] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-bold">
                    {feature.desc}
                  </p>
                </div>

                {/* Subtle Bottom Accent Line */}
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${feature.color} mt-8 group-hover:w-full transition-all duration-500`} />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
