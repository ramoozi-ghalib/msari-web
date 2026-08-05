'use client';

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
      label: isEn ? 'Downloads' : 'عملية تحميل',
      color: 'text-[#23096E]',
      bg: 'bg-[#23096E]/10 border-[#23096E]/20',
      iconColor: 'text-[#23096E]',
    },
    {
      icon: Star,
      value: (data?.rating || '4.0') + '★',
      label: isEn ? 'User Rating' : 'تقييم المستخدمين',
      color: 'text-slate-900',
      bg: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-400 fill-amber-400',
    },
    {
      icon: Building2,
      value: data?.hotels || '50+',
      label: isEn ? 'Hotels & Stays in Yemen' : 'فندق ومكان إقامة في اليمن',
      color: 'text-[#FF3B30]',
      bg: 'bg-[#FF3B30]/10 border-[#FF3B30]/20',
      iconColor: 'text-[#FF3B30]',
    },
    {
      icon: Headphones,
      value: data?.support || '24/7',
      label: isEn ? 'Live Yemeni Support' : 'دعم فني يمني مباشر',
      color: 'text-[#3A1C8F]',
      bg: 'bg-[#3A1C8F]/10 border-[#3A1C8F]/20',
      iconColor: 'text-[#3A1C8F]',
    },
  ];

  return (
    <section className="relative z-20 -mt-8 sm:-mt-12 container-msari px-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#23096E]/5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-4 p-4 rounded-2xl bg-[#F4F2F8]/60 border border-slate-100 hover:border-[#23096E]/20 hover:bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`p-3.5 rounded-2xl border ${stat.bg} ${stat.iconColor} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#23096E] tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-extrabold mt-0.5">
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
