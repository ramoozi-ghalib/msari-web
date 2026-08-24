'use client';

import React from 'react';
import { Download, Star, Building2, Headphones } from 'lucide-react';

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
      value: data?.downloads || '5000+',
      label: isEn ? 'Downloads' : 'تحميل',
      color: 'text-[#23096E]',
      bg: 'bg-[#23096E]/10 border-[#23096E]/20',
      iconColor: 'text-[#23096E]',
    },
    {
      icon: Star,
      value: (data?.rating || '4.8') + '★',
      label: isEn ? 'User Rating' : 'تقييم المسافرين',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-500 fill-amber-400',
    },
    {
      icon: Building2,
      value: data?.hotels || '100+',
      label: isEn ? 'Hotels' : 'فندق',
      color: 'text-[#FF3B30]',
      bg: 'bg-[#FF3B30]/10 border-[#FF3B30]/20',
      iconColor: 'text-[#FF3B30]',
    },
    {
      icon: Headphones,
      value: data?.support || '24/7',
      label: isEn ? 'Customer Support' : 'خدمة عملاء',
      color: 'text-emerald-700',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-700',
    },
  ];

  return (
    <section className="relative z-20 -mt-6 sm:-mt-10 lg:-mt-12 container-msari px-4 sm:px-6">
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg shadow-[#23096E]/6 backdrop-blur-md">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F2F8]/70 border border-slate-100 hover:border-[#23096E]/20 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border ${stat.bg} ${stat.iconColor} shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 text-start">
                  <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-[#23096E] tracking-tight leading-none">
                    {stat.value}
                  </h3>
                  <p className="text-[11px] sm:text-xs lg:text-sm text-slate-800 font-black mt-1 truncate">
                    {stat.label}
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
