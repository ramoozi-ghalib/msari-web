'use client';

import { Zap, Headphones, Layers, ShieldCheck } from 'lucide-react';

interface Props {
  isEn?: boolean;
  features?: Array<{
    title: string;
    desc: string;
    icon?: string;
    badge?: string;
    color?: string;
  }>;
}

const DEFAULT_FEATURES = [
  {
    icon: Zap,
    title: 'تجربة حجز سهلة وسريعة',
    desc: 'واجهة مستخدم مرنة وبسيطة تتيح لك إتمام حجوزاتك في دقيقة واحدة دون أي تعقيدات.',
    color: 'from-[#23096E] to-[#3A1C8F]',
    badge: 'سرعة ودقة',
  },
  {
    icon: Headphones,
    title: 'دعم فني على مدار الساعة',
    desc: 'فريق محلي متخصص جاهز لمساعدتك عبر الواتساب والاتصال لضمان إقامة مريحة.',
    color: 'from-[#3A1C8F] to-[#23096E]',
    badge: 'دعم يمني 24/7',
  },
  {
    icon: Layers,
    title: 'تطبيق شامل ومبتكر',
    desc: 'حجز فنادق، تذاكر طيران، وتأجير سيارات ونقل في جميع المحافظات من مكان واحد.',
    color: 'from-[#FF3B30] to-[#e02d23]',
    badge: 'فنادق وطيران وسيارات',
  },
  {
    icon: ShieldCheck,
    title: 'أمان وضمان أفضل سعر',
    desc: 'أسعار مباشرة وتنافسية مع تأكيد حجز فوري ودون أي رسوم خفية.',
    color: 'from-emerald-600 to-teal-700',
    badge: 'أمان وضمان',
  },
];

const ICON_MAP: Record<string, any> = {
  Zap,
  Headphones,
  Layers,
  ShieldCheck,
};

export default function AppFeaturesSection({ isEn = false, features }: Props) {
  const items = (features && features.length > 0)
    ? features.map((f, idx) => ({
        icon: (f.icon && ICON_MAP[f.icon]) || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].icon,
        title: f.title,
        desc: f.desc,
        color: f.color || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].color,
        badge: f.badge || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].badge,
      }))
    : DEFAULT_FEATURES;

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
            {isEn ? 'Why Choose Msari App for Your Travel?' : 'لماذا تختار تطبيق مساري لرحلاتك القادمة؟'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'Everything you need to travel across Yemen safely, smoothly, and at the best guaranteed rates.'
              : 'كل ما تحتاجه لتجربة سفر مريحة وآمنة في اليمن وبأفضل الأسعار المضمونة.'}
          </p>
        </div>

        {/* Features 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
              >
                {/* Accent Top Line with Dynamic Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feat.color}`} />

                <div className="space-y-6">
                  {/* Badge & Icon Row */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Icon size={28} />
                    </div>
                    <span className="text-xs font-black text-slate-700 bg-slate-100 border border-slate-200/80 px-3.5 py-1.5 rounded-full">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2.5">
                    <h3 className="text-xl lg:text-2xl font-black text-slate-900 group-hover:text-[#23096E] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-[#423861] text-sm lg:text-base leading-relaxed font-semibold">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
