'use client';

import React from 'react';
import { Star, ShieldCheck, ThumbsUp, Quote, Sparkles, MapPin } from 'lucide-react';

interface Props {
  isEn?: boolean;
}

const REVIEWS = [
  {
    name: 'م. خالد باوزير',
    city: 'المكلا، حضرموت',
    rating: 5,
    date: 'قبل أسبوع',
    stay: 'حجز فندق في عدن',
    comment: 'تطبيق مساري وفّر علي عناء البحث والاتصال بالفنادق وقت السفر لعدن. حجزت وسددت عن طريق الكريمي واستلمت القسيمة فوراً، وعند وصولي للفندق كان الاستقبال جاهزاً تماماً.',
  },
  {
    name: 'د. سامي العريقي',
    city: 'تعز / صنعاء',
    rating: 5,
    date: 'قبل أسبوعين',
    stay: 'حجز جناح عائلي في سيئون',
    comment: 'أول تطبيق يمني يقدم تجربة حجز بمستوى عالمي حقيقي! الأسعار واضحة بدون زيادة، وإمكانية الدفع بالمحافظ الإلكترونية المحلية ميزة لا تقدر بثمن.',
  },
  {
    name: 'أمجد الصبيحي',
    city: 'عدن',
    rating: 5,
    date: 'قبل ٣ أسابيع',
    stay: 'حجز فندق في المكلا',
    comment: 'خدمة العملاء عبر الواتساب متجاوبة جداً وساعدوني في تعديل موعد الوصول بكل رحابة صدر. أنصح أي مسافر داخل اليمن بتحميل التطبيق والاعتماد عليه.',
  },
];

export default function AppReviewsSection({ isEn = false }: Props) {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#23096E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'Traveler Stories' : 'تجارب المسافرين الحقيقية'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E] tracking-tight">
            {isEn ? 'What Travelers Say About Msari App' : 'ماذا يقول مستخدمو تطبيق مساري؟'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'Thousands of successful bookings across Yemeni cities with trusted, verified ratings on Google Play.'
              : 'آلاف الحجوزات الناجحة وتجارب سفر مريحة عبر أفضل الفنادق في مختلف المدن اليمنية.'}
          </p>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="relative bg-[#F4F2F8]/70 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-[#23096E]/20 shrink-0" />
                </div>

                {/* Stay Type Badge */}
                <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-black text-[#23096E]">
                  {rev.stay}
                </span>

                {/* Review Text */}
                <p className="text-[#423861] text-xs sm:text-sm leading-relaxed font-semibold">
                  "{rev.comment}"
                </p>
              </div>

              {/* User Info Footer */}
              <div className="pt-4 mt-6 border-t border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#23096E] text-white flex items-center justify-center font-black text-xs shadow-md">
                    {rev.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{rev.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#FF3B30]" />
                      <span>{rev.city}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-bold">
                  {rev.date}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* Store Trust Ribbon */}
        <div className="mt-12 p-4 rounded-2xl bg-[#23096E]/5 border border-[#23096E]/15 flex flex-wrap items-center justify-center gap-6 text-xs text-[#23096E] font-black">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isEn ? 'Verified Store Reviews' : 'تقييمات موثقة من متجر Google Play'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-[#FF3B30]" />
            <span>{isEn ? '98% Customer Satisfaction' : 'نسبة رضا تتجاوز 98% للمسافرين'}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
