'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, Building2, Calendar, Sun, Landmark, History, Compass, 
  Sparkles, Search
} from 'lucide-react';
import HotelCard from '@/components/ui/HotelCard';

interface DestinationDetailClientProps {
  destination: any;
  locale: string;
}

export default function DestinationDetailClient({ destination, locale }: DestinationDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'climate' | 'culture' | 'bestTime'>('history');
  const [searchQuery, setSearchQuery] = useState('');

  const currentLocale = locale || 'ar';
  const hotels = destination.rawHotels || [];

  const filteredHotels = searchQuery.trim()
    ? hotels.filter((h: any) => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : hotels;

  return (
    <div className="min-h-screen bg-[var(--surface-page)] space-y-6 sm:space-y-8 pb-20">
      {/* ─── 1. HERO SECTION (Full-Width Banner with Light Brand Gradient & Pure White Title) ─── */}
      <div className="relative w-full overflow-hidden bg-[var(--brand-dark)] pt-24 sm:pt-32 pb-14 sm:pb-18 shadow-lg">
        {destination.heroImage ? (
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            priority
            className="object-cover object-center scale-105 animate-fade-in transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-dark)]" />
        )}

        {/* Light Msari Brand Gradient Overlay (Preserves original hero image clarity & details) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-dark)]/85 via-[var(--brand-primary)]/30 to-[var(--brand-dark)]/35" />

        {/* Content Box */}
        <div className="relative container-msari space-y-6 z-10">
          {/* Top Breadcrumb Bar */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white backdrop-blur-md bg-white/15 w-fit px-4 py-1.5 rounded-full border border-white/25 shadow-lg">
            <Link href={`/${currentLocale}`} className="text-white hover:text-neutral-200 transition-colors">الرئيسية</Link>
            <span className="text-white/60">/</span>
            <Link href={`/${currentLocale}/destinations`} className="text-white hover:text-neutral-200 transition-colors">الوجهات</Link>
            <span className="text-white/60">/</span>
            <span className="text-white font-black">{destination.name}</span>
          </div>

          {/* Title & Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[var(--brand-accent)] text-white font-extrabold text-xs shadow-lg">
                📍 {destination.governorate}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[var(--brand-primary)] backdrop-blur-md border border-white/30 text-white font-extrabold text-xs shadow-lg">
                {destination.hotelCount} {destination.hotelCount === 1 ? 'فندق متاح' : 'فنادق متاحة'}
              </span>
            </div>

            {/* Main Destination Title forced in Pure High-Contrast White via inline style override */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]" style={{ color: '#FFFFFF' }}>
              <span style={{ color: '#FFFFFF' }}>وجهة {destination.name}</span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-white max-w-3xl leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{ color: '#FFFFFF' }}>
              {destination.tagline}
            </p>
          </div>

          {/* Quick Feature Cards Row - Positioned downwards towards bottom of hero */}
          <div className="mt-8 sm:mt-12 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--brand-dark)]/60 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <Building2 size={22} className="text-[var(--brand-accent)] shrink-0" />
              <div>
                <span className="text-[10px] text-white/80 font-bold block">إتاحة الفنادق</span>
                <span className="text-xs sm:text-sm font-extrabold text-white" style={{ color: '#FFFFFF' }}>{destination.hotelCount} خيارات إقامة</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--brand-dark)]/60 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <Sun size={22} className="text-[var(--brand-accent)] shrink-0" />
              <div>
                <span className="text-[10px] text-white/80 font-bold block">مناخ الوجهة</span>
                <span className="text-xs sm:text-sm font-extrabold text-white line-clamp-1" style={{ color: '#FFFFFF' }}>معتدل وسياحي</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--brand-dark)]/60 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <Landmark size={22} className="text-[var(--brand-accent)] shrink-0" />
              <div>
                <span className="text-[10px] text-white/80 font-bold block">أبرز المعالم</span>
                <span className="text-xs sm:text-sm font-extrabold text-white" style={{ color: '#FFFFFF' }}>{destination.landmarks?.length || 0} معالم شهيرة</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--brand-dark)]/60 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <Calendar size={22} className="text-[var(--brand-accent)] shrink-0" />
              <div>
                <span className="text-[10px] text-white/80 font-bold block">أفضل وقت للزيارة</span>
                <span className="text-xs sm:text-sm font-extrabold text-white line-clamp-1" style={{ color: '#FFFFFF' }}>طوال العام</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. TRAVEL GUIDE & OVERVIEW SECTION (Distinct Balanced Card) ─ */}
      <section className="container-msari">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/80">
          {/* Title and Tabs arranged vertically directly under the title */}
          <div className="border-b border-neutral-100 pb-6 mb-6 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-1">
                📖 دليل المسافر والتاريخ
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                استكشف روعة وسحر مدينة {destination.name}
              </h2>
            </div>

            {/* Interactive Tabs placed DIRECTLY UNDER the title */}
            <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-page)] rounded-2xl overflow-x-auto no-scrollbar max-w-full">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'history'
                    ? 'bg-[var(--brand-primary)] text-white shadow-md hover:bg-[var(--brand-secondary)]'
                    : 'text-neutral-600 hover:text-[var(--brand-primary)] hover:bg-white'
                }`}
              >
                <History size={16} />
                <span>التاريخ والتراث</span>
              </button>

              <button
                onClick={() => setActiveTab('climate')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'climate'
                    ? 'bg-[var(--brand-primary)] text-white shadow-md hover:bg-[var(--brand-secondary)]'
                    : 'text-neutral-600 hover:text-[var(--brand-primary)] hover:bg-white'
                }`}
              >
                <Sun size={16} />
                <span>الطقس والمناخ</span>
              </button>

              <button
                onClick={() => setActiveTab('culture')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'culture'
                    ? 'bg-[var(--brand-primary)] text-white shadow-md hover:bg-[var(--brand-secondary)]'
                    : 'text-neutral-600 hover:text-[var(--brand-primary)] hover:bg-white'
                }`}
              >
                <Sparkles size={16} />
                <span>الثقافة والأسواق</span>
              </button>

              <button
                onClick={() => setActiveTab('bestTime')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'bestTime'
                    ? 'bg-[var(--brand-primary)] text-white shadow-md hover:bg-[var(--brand-secondary)]'
                    : 'text-neutral-600 hover:text-[var(--brand-primary)] hover:bg-white'
                }`}
              >
                <Calendar size={16} />
                <span>أفضل أوقات الزيارة</span>
              </button>
            </div>
          </div>

          {/* Tab Content Box */}
          <div className="p-6 rounded-2xl bg-[var(--surface-page)]/80 border border-neutral-200/80 leading-relaxed text-neutral-800 text-base sm:text-lg">
            {activeTab === 'history' && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-bold text-[var(--brand-primary)] text-xl flex items-center gap-2">
                  <History size={20} className="text-[var(--brand-secondary)]" />
                  عراقة التاريخ وأصالة التراث
                </h3>
                <p>{destination.overview?.history}</p>
              </div>
            )}

            {activeTab === 'climate' && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-bold text-[var(--brand-primary)] text-xl flex items-center gap-2">
                  <Sun size={20} className="text-[var(--brand-secondary)]" />
                  أجواء المناخ والبيئة
                </h3>
                <p>{destination.overview?.climate}</p>
              </div>
            )}

            {activeTab === 'culture' && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-bold text-[var(--brand-primary)] text-xl flex items-center gap-2">
                  <Sparkles size={20} className="text-[var(--brand-secondary)]" />
                  المظاهر الثقافية والفلكلور الشعبي
                </h3>
                <p>{destination.overview?.culture}</p>
              </div>
            )}

            {activeTab === 'bestTime' && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-bold text-[var(--brand-primary)] text-xl flex items-center gap-2">
                  <Calendar size={20} className="text-[var(--brand-secondary)]" />
                  الموسم الموصى به للسفر والإقامة
                </h3>
                <p>{destination.overview?.bestTimeToVisit}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3. 3D LANDMARK CARDS SECTION (Distinct Balanced Card Block) ─ */}
      {destination.landmarks && destination.landmarks.length > 0 && (
        <section className="container-msari">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/80">
            <div className="border-b border-neutral-100 pb-6 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] text-xs font-black mb-1">
                🏰 جولة استكشافية
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                أبرز المعالم السياحية والتاريخية
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium">
                أهم الأماكن والمعالم الشهيرة التي نوصيك بزيارتها أثناء إقامتك في {destination.name}
              </p>
            </div>

            {/* 3D Glassmorphism Landmark Cards Grid inside the card block */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.landmarks.map((landmark: any, idx: number) => (
                <div
                  key={landmark.id || landmark.name || `lm-${idx}`}
                  className="group relative rounded-3xl overflow-hidden bg-[var(--surface-page)]/60 border border-neutral-200/80 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 transform hover:rotate-1 flex flex-col justify-between"
                >
                  {/* Landmark Image */}
                  <div className="relative aspect-[4/3] bg-neutral-200 overflow-hidden">
                    {landmark.image ? (
                      <Image
                        src={landmark.image}
                        alt={landmark.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--brand-primary)] to-neutral-800" />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-dark)]/80 via-black/20 to-transparent" />

                    {/* Category Pill Badge using Brand Accent Red */}
                    <span className="absolute top-4 start-4 z-10 px-3 py-1 rounded-full bg-[var(--brand-accent)] text-white font-black text-xs shadow-lg">
                      {landmark.category}
                    </span>

                    {/* Title & Location on Image */}
                    <div className="absolute bottom-4 start-4 end-4 z-10 text-white">
                      <h3 className="font-bold text-xl leading-snug drop-shadow-md group-hover:text-white/90 transition-colors">
                        {landmark.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--brand-white)] mt-1">
                        <MapPin size={13} className="text-[var(--brand-accent)] shrink-0" />
                        <span>{landmark.locationText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Landmark Description Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3">
                      {landmark.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[var(--brand-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                      <span>معلم تاريخي ومزار رائع</span>
                      <Compass size={16} className="group-hover:rotate-45 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. CITY HOTELS & BOOKING SECTION (Distinct Standalone Card) ──── */}
      <section className="container-msari">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-200/80">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-1">
                🏨 أماكن الإقامة والحجز
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                فنادق ومقرات الإقامة في {destination.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium">
                احجز فندقك المفضل مباشرة بأفضل الأسعار وأرقى الخدمات
              </p>
            </div>

            {/* Quick Filter Search */}
            <div className="relative min-w-[260px] sm:min-w-[320px]">
              <Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={`ابحث عن فندق في ${destination.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-[var(--surface-page)] border border-neutral-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
              />
            </div>
          </div>

          {/* Hotels Cards Grid */}
          {filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHotels.map((hotel: any) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-[var(--surface-page)] border border-dashed border-neutral-300">
              <Building2 size={48} className="mx-auto text-neutral-400 mb-3" />
              <h3 className="font-bold text-neutral-800 text-lg mb-1">لا توجد فنادق تطابق بحثك حالياً</h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mb-4">
                جرب تغيير البحث أو تصفح جميع الفنادق المتاحة في المدن الأخرى.
              </p>
              <Link href={`/${currentLocale}/hotels`} className="btn btn-primary btn-sm px-6 py-2 rounded-xl text-xs font-bold">
                عرض جميع الفنادق
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
