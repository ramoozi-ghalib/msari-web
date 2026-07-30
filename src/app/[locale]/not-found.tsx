'use client';

import Link from 'next/link';
import { Home, ArrowRight, Search, Hotel, Plane, Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#23096e] via-[#2d1580] to-[#3A1C8F] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#ff3b30]/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="mb-6">
          <span
            className="font-black text-white/10 select-none"
            style={{ fontSize: 'clamp(8rem, 20vw, 14rem)', lineHeight: 1 }}
          >
            404
          </span>
        </div>

        {/* Icon */}
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 backdrop-blur-sm -mt-16">
          <Search size={40} className="text-white" />
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
          عذراً! الصفحة غير موجودة
        </h1>
        <p className="text-white/70 text-lg mb-10 leading-relaxed">
          يبدو أن الصفحة التي تبحث عنها قد انتقلت أو لم تعد موجودة.<br />
          لكن لا تقلق، يمكنك استكشاف ما نقدمه!
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { href: '/hotels', icon: Hotel, label: 'الفنادق', desc: 'تصفح أفضل الفنادق' },
            { href: '/flights', icon: Plane, label: 'الطيران', desc: 'احجز رحلتك' },
            { href: '/cars', icon: Car, label: 'السيارات', desc: 'خدمة النقل' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-3 p-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm group"
            >
              <item.icon size={28} className="text-white group-hover:scale-110 transition-transform duration-300" />
              <div>
                <div className="text-white font-bold text-sm">{item.label}</div>
                <div className="text-white/60 text-xs">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-white text-[#23096e] font-black px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-base"
        >
          <Home size={20} />
          العودة للصفحة الرئيسية
          <ArrowRight size={18} className="rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
