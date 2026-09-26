'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight, Search, SlidersHorizontal,
  Plane, Info
} from 'lucide-react';

// --- F-04 fix: NO mock data in Production. There is no live flights source
// connected to this page, so results render an explicit unavailable state.
// (Removed: MOCK_FLIGHTS with fake airlines/prices + dead "select" buttons.)

import { Suspense } from 'react';

function FlightSearchResultsContent() {
  const searchParams = useSearchParams();
  // Using generic fallbacks in case no params are passed yet
  const from = searchParams.get('from') || 'القاهرة (CAI)';
  const to = searchParams.get('to') || 'دبي (DXB)';
  const dateStr = searchParams.get('date') || '15 أكتوبر';
  const guests = searchParams.get('passengers') || '1 بالغ، سياحية';

  const [priceRange, setPriceRange] = useState(500);

  return (
    <div className="bg-[#f8f8fa] min-h-screen pt-24 pb-20">

      {/* ─── Search Info Bar ─── */}
      <div className="bg-[#23096e] text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/flights" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ArrowRight size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3 text-xl font-black">
                {from} <Plane size={18} className="opacity-70 rotate-90" /> {to}
              </div>
              <div className="text-white/70 text-sm mt-1 font-medium flex gap-3">
                <span>{dateStr}</span>
                <span className="w-1 h-1 rounded-full bg-white/30 self-center" />
                <span>{guests}</span>
              </div>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-bold hover:bg-white hover:text-[#23096e] transition-colors flex items-center gap-2">
            <Search size={16} /> تعديل البحث
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">

        {/* ─── Sidebar Filters ─── */}
        <div className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-neutral-900 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#23096e]" /> التصفية
              </h2>
              <button className="text-xs text-[#ff3b30] font-bold hover:underline">مسح الكل</button>
            </div>

            {/* Stops */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-neutral-900 mb-4">عدد التوقفات</h3>
              <div className="space-y-3">
                {['مباشر', 'توقف واحد', 'توقفين أو أكثر'].map((stop, i) => (
                  <label key={i} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded border-neutral-300 text-[#23096e] focus:ring-[#23096e]" />
                      <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{stop}</span>
                    </div>
                    {i === 0 && <span className="text-xs text-neutral-400 font-medium">الأرخص</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-neutral-900 mb-4 flex justify-between">
                <span>السعر</span>
                <span className="text-[#23096e]">حتى ${priceRange}</span>
              </h3>
              <input
                type="range" min="150" max="1500" step="10"
                value={priceRange} onChange={e=>setPriceRange(Number(e.target.value))}
                className="w-full accent-[#23096e]"
              />
            </div>
          </div>
        </div>

        {/* ─── Results List ─── */}
        <div className="flex-1 space-y-5">
          {/* F-04: honest unavailable state — no live flights inventory connected. */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#23096e]/10 flex items-center justify-center mb-4">
              <Plane size={28} className="text-[#23096e]" />
            </div>
            <h1 className="text-lg font-black text-neutral-900 mb-2">
              حجز الطيران غير متاح حالياً
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              لم يتم ربط نتائج بحث حية بعد — لا توجد رحلات معروضة.
              للحجز أو الاستفسار تواصل مع فريق مساري على مدار الساعة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/967733644466?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AD%D8%AC%D8%B2%20%D8%B7%D9%8A%D8%B1%D8%A7%D9%86"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #23096e, #3A1C8F)' }}
              >
                تواصل واتساب
              </a>
              <Link
                href="/flights"
                className="px-6 py-3 rounded-xl font-black text-sm border-2 border-[#23096e] text-[#23096e]"
              >
                بحث جديد
              </Link>
            </div>
            <p className="mt-6 text-[11px] text-neutral-400 font-medium flex items-center justify-center gap-1">
              <Info size={12} /> لا يتم عرض أي أسعار أو رحلات تجريبية
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function FlightSearchResults() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#23096e] font-bold">جاري التحميل...</div>}>
      <FlightSearchResultsContent />
    </Suspense>
  );
}
