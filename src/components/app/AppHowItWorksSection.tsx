'use client';

import React from 'react';
import { Smartphone, Search, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

interface Props {
  isEn?: boolean;
  howItWorks?: Array<{
    step?: string;
    title: string;
    subtitle?: string;
    desc: string;
    badge?: string;
  }>;
}

const DEFAULT_STEPS = [
  {
    num: '01',
    icon: Smartphone,
    title: '١. حمّل التطبيق مجاناً',
    subtitle: 'تثبيت سريع في ثوانٍ',
    desc: 'قم بتحميل تطبيق مساري مباشرة من متجر Google Play أو App Store وابدأ التصفح فوراً دون أي اشتراكات.',
    badge: 'خطوة أولى',
    color: 'bg-[#23096E]',
  },
  {
    num: '02',
    icon: Search,
    title: '٢. اختر وجهتك وغرفتك',
    subtitle: 'مقارنة الأسعار والصور',
    desc: 'ابحث في المدينة المطلوبة (عدن، صنعاء، المكلا، سيئون...) وقارن صور الغرف والأسعار الحية والمرافق المتوفرة.',
    badge: 'خطوة ثانية',
    color: 'bg-[#3A1C8F]',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: '٣. أكد حجزك وسدد بسهولة',
    subtitle: 'دفع محلي وتأكيد فوري',
    desc: 'ادفع عبر المحافظ الإلكترونية، تحويل بنكي، أو كاش عند الوصول، واستلم تأكيد حجزك الرسمي فوراً مع رقم مرجعي معتمد.',
    badge: 'تأكيد مباشر',
    color: 'bg-[#FF3B30]',
  },
];

export default function AppHowItWorksSection({ isEn = false, howItWorks }: Props) {
  const stepIcons = [Smartphone, Search, CheckCircle2];
  const stepColors = ['bg-[#23096E]', 'bg-[#3A1C8F]', 'bg-[#FF3B30]'];
  const defaultBadges = ['خطوة أولى', 'خطوة ثانية', 'تأكيد مباشر'];

  const steps = (Array.isArray(howItWorks) && howItWorks.length > 0)
    ? howItWorks.map((item, idx) => ({
        num: item.step || `0${idx + 1}`,
        icon: stepIcons[idx % stepIcons.length],
        title: item.title,
        subtitle: item.subtitle || (idx === 0 ? 'تثبيت سريع في ثوانٍ' : idx === 1 ? 'مقارنة الأسعار والصور' : 'دفع محلي وتأكيد فوري'),
        desc: item.desc,
        badge: item.badge || defaultBadges[idx % defaultBadges.length],
        color: stepColors[idx % stepColors.length],
      }))
    : DEFAULT_STEPS;

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#F4F2F8] text-slate-900 relative overflow-hidden">
      <div className="container-msari relative z-10 px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'Simple 3-Step Process' : 'سهولة مطلقة'}</span>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#23096E] tracking-tight leading-tight">
            {isEn ? 'How to Book via Msari in 3 Easy Steps?' : 'كيف تبدأ حجزك في 3 خطوات بسيطة؟'}
          </h2>
          <p className="text-[#423861] text-xs sm:text-sm lg:text-base max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'From searching available hotels to instant check-in confirmation in less than a minute.'
              : 'من البحث عن الفندق وحتى استلام تأكيد الحجز المعتمد بضغطة زر وبدون أي تعقيد.'}
          </p>
        </div>

        {/* Steps Grid with Connecting Line */}
        <div className="relative">
          
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-1/3 inset-x-12 h-1 bg-gradient-to-r from-[#23096E]/30 via-[#3A1C8F]/30 to-[#FF3B30]/30 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center space-y-4 sm:space-y-6 flex flex-col items-center justify-between group"
                >
                  {/* Step Top Bubble */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-500 bg-slate-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                      {step.badge}
                    </span>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${step.color} text-white font-black text-base sm:text-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.num}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F4F2F8] text-[#23096E] flex items-center justify-center mx-auto border border-slate-200 group-hover:border-[#23096E]/30 transition-colors">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#23096E]" />
                    </div>
                    
                    <div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 group-hover:text-[#23096E] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-bold text-[#FF3B30] mt-0.5">
                        {step.subtitle}
                      </p>
                    </div>

                    <p className="text-[#423861] text-xs sm:text-sm leading-relaxed font-semibold">
                      {step.desc}
                    </p>
                  </div>

                  <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-600 text-xs font-bold">
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
