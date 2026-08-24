'use client';

import React from 'react';
import { Smartphone, Search, CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

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
    title: '١. حمّل التطبيق مجاناً',
    subtitle: 'تثبيت سريع في ثوانٍ',
    desc: 'قم بتحميل التطبيق مباشرة من متجر Google Play أو App Store وابدأ التصفح فوراً دون أي اشتراكات.',
    badge: 'خطوة أولى',
    color: 'bg-[#23096E]',
  },
  {
    num: '02',
    icon: Search,
    title: '٢. اختر وجهتك والفندق الأنسب',
    subtitle: 'تصفية ومقارنة دقيقة',
    desc: 'ابحث في المدينة المطلوبة (عدن، صنعاء، المكلا، سيئون...) وقارن صور الغرف والأسعار والمرافق المتوفرة.',
    badge: 'خطوة ثانية',
    color: 'bg-[#3A1C8F]',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: '٣. أكد حجزك واستلم قسيمتك',
    subtitle: 'دفع محلي وتأكيد فوري',
    desc: 'ادفع عبر الكريمي أو جيب أو اختر الدفع كاش عند الوصول، واستلم قسيمة إقامتك المعتمدة مباشرة على جوالك.',
    badge: 'تأكيد مباشر',
    color: 'bg-[#FF3B30]',
  },
];

export default function AppHowItWorksSection({ isEn = false, howItWorks }: Props) {
  const steps = DEFAULT_STEPS;

  return (
    <section className="py-20 lg:py-28 bg-[#F4F2F8] text-slate-900 relative overflow-hidden">
      <div className="container-msari relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'Simple 3-Step Process' : 'سهولة مطلقة'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E] tracking-tight">
            {isEn ? 'How to Book via Msari in 3 Easy Steps?' : 'كيف تبدأ حجزك في 3 خطوات بسيطة؟'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'From searching available hotels to instant check-in confirmation in less than a minute.'
              : 'من البحث عن الفندق وحتى استلام قسيمة الحجز المعتمدة بضغطة زر وبدون أي تعقيد.'}
          </p>
        </div>

        {/* Steps Grid with Connecting Line */}
        <div className="relative">
          
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-1/3 inset-x-12 h-1 bg-gradient-to-r from-[#23096E]/30 via-[#3A1C8F]/30 to-[#FF3B30]/30 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center space-y-6 flex flex-col items-center justify-between group"
                >
                  {/* Step Top Bubble */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {step.badge}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl ${step.color} text-white font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.num}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F2F8] text-[#23096E] flex items-center justify-center mx-auto border border-slate-200 group-hover:border-[#23096E]/30 transition-colors">
                      <Icon size={28} className="text-[#23096E]" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#23096E] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs font-bold text-[#FF3B30] mt-0.5">
                        {step.subtitle}
                      </p>
                    </div>

                    <p className="text-[#423861] text-xs sm:text-sm leading-relaxed font-semibold">
                      {step.desc}
                    </p>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-600 text-xs font-bold">
                    <span>{isEn ? 'Next Step' : 'الخطوة التالية'}</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-[#FF3B30] rtl:rotate-0 rotate-180" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
