'use client';

import { Smartphone, Search, CheckCircle2 } from 'lucide-react';

interface Props {
  isEn?: boolean;
}

export default function AppHowItWorksSection({ isEn = false }: Props) {
  const steps = [
    {
      num: '01',
      icon: Smartphone,
      title: isEn ? '1. Download the App' : '1. حمّل التطبيق',
      desc: isEn
        ? 'Choose your preferred store or scan the QR code to install Msari App on your phone.'
        : 'اختر متجرك المفضل أو امسح رمز الـ QR لتثبيت التطبيق على جوالك.',
      color: 'bg-[#23096E]',
    },
    {
      num: '02',
      icon: Search,
      title: isEn ? '2. Choose Destination & Hotel' : '2. اختر وجهتك وفندقك',
      desc: isEn
        ? 'Browse hundreds of hotel options across Aden, Sanaa, Hadramout, and all cities.'
        : 'تصفح مئات الفنادق والخيارات في عدن، صنعاء، الحضرموت، وجميع المدن.',
      color: 'bg-[#3A1C8F]',
    },
    {
      num: '03',
      icon: CheckCircle2,
      title: isEn ? '3. Book & Enjoy' : '3. احجز واستمتع بتجربتك',
      desc: isEn
        ? 'Get instant voucher confirmation and enjoy premier 24/7 customer service.'
        : 'احصل على تأكيد فوري لقسيمة حجزك واستمتع بخدمة عملاء متميزة.',
      color: 'bg-[#FF3B30]',
    },
  ];

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
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-5 hover:border-[#23096E]/40 transition-all duration-300 transform hover:-translate-y-2 shadow-md hover:shadow-xl hover:shadow-[#23096E]/10"
              >
                {/* Step Badge & Icon */}
                <div className="relative inline-flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} text-white flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#23096E] text-white text-xs font-black flex items-center justify-center shadow">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#23096E]">
                  {step.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed font-bold">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
