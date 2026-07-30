'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Search, SlidersHorizontal, ChevronDown, 
  Clock, Plane, PlaneTakeoff, Info, CheckCircle2 
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_FLIGHTS = [
  {
    id: 'f1',
    airline: 'الخطوط الجوية القطرية',
    airlineLogo: 'QR',
    fromTime: '09:00',
    fromCode: 'CAI',
    fromCity: 'القاهرة',
    toTime: '13:30',
    toCode: 'DXB',
    toCity: 'دبي',
    duration: '4 س 30 د',
    stops: 0,
    stopStations: [],
    price: 345,
    isRecommended: true
  },
  {
    id: 'f2',
    airline: 'طيران الإمارات',
    airlineLogo: 'EK',
    fromTime: '14:15',
    fromCode: 'CAI',
    fromCity: 'القاهرة',
    toTime: '19:50',
    toCode: 'DXB',
    toCity: 'دبي',
    duration: '5 س 35 د',
    stops: 1,
    stopStations: ['AMM'],
    price: 290,
    isRecommended: false
  },
  {
    id: 'f3',
    airline: 'مصر للطيران',
    airlineLogo: 'MS',
    fromTime: '23:40',
    fromCode: 'CAI',
    fromCity: 'القاهرة',
    toTime: '04:10',
    toCode: 'DXB',
    toCity: 'دبي',
    duration: '4 س 30 د',
    stops: 0,
    stopStations: [],
    price: 410,
    isRecommended: false
  },
];

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

            {/* Airlines */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-4">شركات الطيران</h3>
              <div className="space-y-3">
                {['الخطوط الجوية القطرية', 'طيران الإمارات', 'مصر للطيران', 'فلاي دبي'].map((airline, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300 text-[#23096e] focus:ring-[#23096e]" />
                    <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{airline}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Results List ─── */}
        <div className="flex-1 space-y-5">
          {/* Sorter & Meta */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
            <h1 className="text-lg font-black text-neutral-900">
              {MOCK_FLIGHTS.length} رحلات متاحة
            </h1>
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-neutral-100">
              <button className="px-5 py-2 rounded-lg text-sm font-bold bg-[#23096e] text-white">الأرخص</button>
              <button className="px-5 py-2 rounded-lg text-sm font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors">الأسرع</button>
              <button className="px-5 py-2 rounded-lg text-sm font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors">الموصى بها</button>
            </div>
          </div>

          {/* Cards */}
          {MOCK_FLIGHTS.map((f, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:border-[#23096e]/30 transition-all hover:shadow-md">
              {f.isRecommended && (
                <div className="bg-green-50 text-green-700 text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> خيارنا الموصى به
                </div>
              )}
              
              <div className="p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                
                {/* Airline & Timing */}
                <div className="flex-1 w-full grid grid-cols-[auto_1fr] md:grid-cols-[120px_1fr] items-center gap-6">
                  {/* Airline Info */}
                  <div className="text-center w-full">
                    <div className="w-14 h-14 mx-auto bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center font-black text-[#23096e] shadow-sm mb-2">
                      {f.airlineLogo}
                    </div>
                    <p className="text-xs font-bold text-neutral-600 leading-tight">{f.airline}</p>
                  </div>

                  {/* Flight Timeline */}
                  <div className="flex items-center justify-between flex-1">
                    <div className="text-end min-w-[60px]">
                      <p className="text-2xl font-black text-neutral-900">{f.fromTime}</p>
                      <p className="text-sm font-semibold text-neutral-400">{f.fromCode}</p>
                    </div>

                    <div className="flex-1 mx-4 flex flex-col items-center">
                      <div className="text-xs text-neutral-400 font-medium mb-1 flex items-center gap-1">
                        <Clock size={12} /> {f.duration}
                      </div>
                      <div className="w-full relative flex items-center justify-center">
                        <div className="absolute w-full h-px bg-neutral-200" />
                        <PlaneTakeoff size={14} className="text-[#23096e] bg-white px-1 z-10 box-content rotate-45" />
                      </div>
                      <div className="text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-full bg-neutral-50 text-neutral-500 border border-neutral-100">
                        {f.stops === 0 ? 'مباشر' : `${f.stops} توقف (${f.stopStations.join(',')})`}
                      </div>
                    </div>

                    <div className="text-start min-w-[60px]">
                      <p className="text-2xl font-black text-neutral-900">{f.toTime}</p>
                      <p className="text-sm font-semibold text-neutral-400">{f.toCode}</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-20 bg-neutral-100" />

                {/* Price & Action */}
                <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-center gap-4 border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0">
                  <div className="text-start md:text-center">
                    <p className="text-xs text-neutral-400 font-medium md:mb-0.5">تبدأ من</p>
                    <p className="text-3xl font-black text-[#23096e] leading-none">${f.price}</p>
                  </div>
                  <button className="px-6 py-3 rounded-xl text-white font-black text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-md"
                    style={{ background: 'linear-gradient(135deg, #23096e, #3A1C8F)' }}>
                    اختيار الرحلة
                  </button>
                </div>

              </div>
              
              {/* Expand details */}
              <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-3 flex items-center justify-between">
                <button className="text-xs font-bold text-[#23096e] flex items-center gap-1 hover:underline">
                  <ChevronDown size={14} /> تفاصيل الرحلة
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                    <Info size={12} /> السعر يشمل الضرائب والرسوم
                  </span>
                </div>
              </div>
            </div>
          ))}

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
