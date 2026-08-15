'use client';

import { Smartphone, Search, CheckCircle2 } from 'lucide-react';

interface Props {
  isEn?: boolean;
  howItWorks?: Array<{
    step?: string;
    title: string;
    desc: string;
  }>;
}

const DEFAULT_STEPS = [
  {
    num: '01',
    icon: Smartphone,
    title: '1. حمّل التطبيق',
    desc: 'اختر متجرك المفضل Google Play أو App Store لتثبيت التطبيق مجاناً على جوالك.',
    color: 'bg-[#23096E]',
  },
  {
    num: '02',
    icon: Search,
    title: '2. اختر وجهتك وفندقك',
    desc: 'تصفح مئات الفنادق والخيارات وقارن الأسعار والصور المناسبة لك في جميع المدن.',
    color: 'bg-[#3A1C8F]',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: '3. احجز واستلم القسيمة',
    desc: 'أكد حجزك فورياً واستلم قسيمة إقامتك المعتمدة مباشرة مع دعم فني متواصل على مدار 24/7.',
    color: 'bg-[#FF3B30]',
  },
];

export default function AppHowItWorksSection({ isEn = false, howItWorks }: Props) {
  const steps = (howItWorks && howItWorks.length > 0)
    ? howItWorks.map((s, idx) => ({
        num: s.step || `0${idx + 1}`,
        icon: DEFAULT_STEPS[idx % DEFAULT_STEPS.length].icon,
        title: s.title,
        desc: s.desc,
        color: DEFAULT_STEPS[idx % DEFAULT_STEPS.length].color,
      }))
    : DEFAULT_STEPS;

  return (
    <section className="py-20 lg:py-28 bg-[#F4F2F8] text-slate-900 relative">
      <div className="container-msari">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs font-black">
            {isEn ? 'Easy Process' : 'خطوات سهلة'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E]">
            {isEn ? 'How to Get Started in 3 Easy Steps?' : 'كيف تبدأ في 3 خطوات بسيطة؟'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'From search to confirmed reservation with full peace of mind in less than a minute.'
              : 'من البحث وحتى استلام القسيمة وتأكيد الحجز بكل سهولة وسرعة.'}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center space-y-6 flex flex-col items-center justify-between"
              >
                {/* Step Number Bubble */}
                <div className={`w-14 h-14 rounded-2xl ${step.color} text-white font-black text-xl flex items-center justify-center shadow-md`}>
                  {step.num}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-[#423861] text-sm leading-relaxed font-semibold">
                    {step.desc}
                  </p>
                </div>

                {/* Sub Icon Footer */}
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
