'use client';

import React from 'react';
import { Download, Star, Building2, Headphones, ShieldCheck, MapPin } from 'lucide-react';

interface Props {
  isEn?: boolean;
  data?: {
    downloads?: string;
    rating?: string;
    hotels?: string;
    support?: string;
  };
}

export default function AppStatsBannerSection({ isEn = false, data }: Props) {
  const stats = [
    {
      icon: Download,
      value: data?.downloads || '+10,000',
      label: isEn ? 'Active Downloads' : 'تحميل نشط ومستخدم',
      subtext: isEn ? 'On Google Play & iOS' : 'على متجر جوجل بلاي وآبل',
      color: 'text-[#23096E]',
      bg: 'bg-[#23096E]/10 border-[#23096E]/20',
      iconColor: 'text-[#23096E]',
    },
    {
      icon: Star,
      value: (data?.rating || '4.8') + '★',
      label: isEn ? 'User Rating' : 'تقييم المسافرين',
      subtext: isEn ? 'From 500+ Reviews' : 'بناءً على مئات التجارب',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-500 fill-amber-400',
    },
    {
      icon: Building2,
      value: data?.hotels || '+50',
      label: isEn ? 'Hotels in Yemen' : 'فندق ومكان إقامة في اليمن',
      subtext: isEn ? 'Across all governorates' : 'في مختلف المدن والمحافظات',
      color: 'text-[#FF3B30]',
      bg: 'bg-[#FF3B30]/10 border-[#FF3B30]/20',
      iconColor: 'text-[#FF3B30]',
    },
    {
      icon: Headphones,
      value: data?.support || '24/7',
      label: isEn ? 'Direct Support' : 'خدمة عملاء يمنية مباشرة',
      subtext: isEn ? 'Instant WhatsApp & Call' : 'عبر واتساب والاتصال الهاتفي',
      color: 'text-emerald-700',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-700',
    },
  ];

  return (
    <section className="relative z-20 -mt-8 sm:-mt-12 container-msari px-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl shadow-[#23096E]/8 backdrop-blur-md">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#F4F2F8]/70 border border-slate-100 hover:border-[#23096E]/20 hover:bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className={`p-3 rounded-2xl border ${stat.bg} ${stat.iconColor} shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#23096E] tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-800 font-extrabold mt-0.5 truncate">
                    {stat.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block mt-0.5">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
