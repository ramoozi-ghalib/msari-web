'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Hotel, Plane, Car, Search, MapPin, Calendar, Users, 
  Plus, Minus, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomepageContentData } from '@/services/cms';

interface HeroSectionProps {
  hero?: HomepageContentData['hero'];
}

const tabs = [
  { id: 'hotels', labelAr: 'فنادق', icon: Hotel },
  { id: 'flights', labelAr: 'طيران', icon: Plane },
  { id: 'cars', labelAr: 'سيارات', icon: Car },
];

const yemenCities = [
  'صنعاء', 'عدن', 'المكلا', 'سيئون', 'إب', 'تعز', 
  'الحديدة', 'مأرب', 'سقطرى', 'شبوة', 'ذمار'
];

export default function HeroSection({ hero }: HeroSectionProps) {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'ar';

  const [activeTab, setActiveTab] = useState('hotels');
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Interactive guests and rooms states
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Mobile: slide-up search sheet
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = () => {
    if (activeTab === 'hotels') {
      const searchParams = new URLSearchParams();
      if (query.trim()) searchParams.set('city', query.trim());
      if (checkIn) searchParams.set('checkIn', checkIn);
      if (checkOut) searchParams.set('checkOut', checkOut);
      searchParams.set('guests', String(guests));
      searchParams.set('rooms', String(rooms));
      router.push(`/${currentLocale}/hotels?${searchParams.toString()}`);
    } else if (activeTab === 'flights') {
      router.push(`/${currentLocale}/flights`);
    } else {
      router.push(`/${currentLocale}/cars`);
    }
    setMobileSearchOpen(false);
  };

  const subtitle = hero?.subtitleAr || 'منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران وتأجير السيارات بسهولة وأمان';

  const renderHeroTitle = (title: string | undefined) => {
    if (!title) {
      return (
        <>
          اكتشف أجمل وجهات
          <br className="hidden sm:inline" />
          {' '}اليمن مع <span className="text-[#FF3B30]">مساري</span>
        </>
      );
    }

    if (title.includes('مساري')) {
      const parts = title.split('مساري');
      return (
        <>
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i !== parts.length - 1 && <span className="text-[#FF3B30]">مساري</span>}
            </span>
          ))}
        </>
      );
    }

    return title;
  };

  return (
    <section className="relative overflow-hidden w-full bg-gradient-to-br from-[#0a0220] via-[#1a0654] to-[#2d1275] text-white">
      
      {/* ── Royal Atmospheric Glows ── */}
      <div className="absolute top-1/4 -start-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -end-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Content Container: Generous top padding (pt-32 to pt-44) preventing ANY header cutoff ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-44 pb-16 sm:pb-24 lg:pb-28 text-center flex flex-col items-center">
        
        {/* Official Hero Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs sm:text-sm font-bold mb-5 sm:mb-6 border border-white/15 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
          <span>منصة حجز الفنادق الأولى في اليمن</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.3] sm:leading-[1.25] tracking-tight mb-4 sm:mb-6 max-w-4xl">
          {renderHeroTitle(hero?.titleAr)}
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-xs sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-medium mb-8 sm:mb-10 px-2">
          {subtitle}
        </p>

        {/* ── 1. Service Selection Tabs (Positioned First) ── */}
        <div className="flex items-center justify-center gap-2 mb-6" style={{ direction: 'rtl' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all shadow-sm',
                  isActive
                    ? 'bg-white text-[var(--brand-primary)] shadow-lg scale-105'
                    : 'bg-white/15 text-white/85 hover:bg-white/25 backdrop-blur-md'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.labelAr}</span>
              </button>
            );
          })}
        </div>

        {/* ── 2. Luxury Search Console (Desktop & Tablet) ── */}
        <div className="hidden md:block w-full max-w-4xl mx-auto">
          {activeTab === 'hotels' ? (
            <div 
              className="bg-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/20 text-neutral-800"
              style={{ direction: 'rtl' }}
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                
                {/* Destination */}
                <div className="col-span-4 text-start p-2.5 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <label className="block text-[11px] font-black text-neutral-400 mb-1">الوجهة أو الفندق</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <input
                      type="text"
                      placeholder="اختر المدينة أو الفندق"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-neutral-900 placeholder-neutral-400 outline-none"
                      list="hero-cities-desktop"
                    />
                    <datalist id="hero-cities-desktop">
                      {yemenCities.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="w-px h-10 bg-neutral-200" />

                {/* Dates */}
                <div className="col-span-4 text-start p-2.5 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <label className="block text-[11px] font-black text-neutral-400 mb-1">تاريخ الوصول والمغادرة</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <div className="flex items-center gap-1.5 w-full text-xs font-bold text-neutral-700">
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer w-full"
                      />
                      <span className="text-neutral-300">-</span>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-px h-10 bg-neutral-200" />

                {/* Guests & Rooms */}
                <div className="col-span-2 relative text-start p-2.5 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <label className="block text-[11px] font-black text-neutral-400 mb-1">الضيوف والغرف</label>
                  <button
                    type="button"
                    onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                    className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 w-full"
                  >
                    <Users className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span>{guests} نزلاء، {rooms} غرفة</span>
                  </button>

                  {showGuestsDropdown && (
                    <div className="absolute top-full end-0 mt-3 w-64 bg-white rounded-2xl p-4 shadow-2xl border border-neutral-100 z-50 animate-fade-in text-neutral-900">
                      <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                        <div>
                          <div className="text-xs font-black">النزلاء البالغين</div>
                          <div className="text-[10px] text-neutral-400">12 سنة فأكثر</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                          >
                            -
                          </button>
                          <span className="text-xs font-black w-4 text-center">{guests}</span>
                          <button
                            type="button"
                            onClick={() => setGuests(guests + 1)}
                            className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-xs font-black">عدد الغرف</div>
                          <div className="text-[10px] text-neutral-400">غرف الإقامة</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                          >
                            -
                          </button>
                          <span className="text-xs font-black w-4 text-center">{rooms}</span>
                          <button
                            type="button"
                            onClick={() => setRooms(rooms + 1)}
                            className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowGuestsDropdown(false)}
                        className="w-full mt-3 py-2 bg-[var(--brand-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[var(--brand-secondary)]"
                      >
                        تم
                      </button>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>بحث</span>
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-white/20 text-neutral-800 text-center space-y-4">
              <p className="text-sm font-bold text-neutral-600">
                {activeTab === 'flights' 
                  ? '✈️ احجز تذاكر الطيران إلى كافة المطارات المحلية والدولية بأفضل الأسعار المباشرة'
                  : '🚗 خدمات تأجير السيارات الفاخرة والنقل بين المحافظات مع أو بدون سائق'}
              </p>
              <button
                type="button"
                onClick={handleSearch}
                className="px-8 py-3 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black rounded-2xl text-sm shadow-lg transition-all inline-flex items-center gap-2"
              >
                <span>استعرض الخيارات المتاحة</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 3. Luxury Search Bar (Mobile View) ── */}
        <div className="md:hidden w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="w-full flex items-center justify-between bg-white text-neutral-800 rounded-2xl shadow-xl px-5 py-4 border border-white/40"
            style={{ direction: 'rtl' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                <Search className="w-5 h-5 text-[#FF3B30]" />
              </div>
              <div className="text-start">
                <div className="text-xs font-black text-neutral-900">
                  {query.trim() ? query : 'إلى أين ترغب بالسفر؟'}
                </div>
                <div className="text-[10px] text-neutral-400 font-semibold">
                  {checkIn ? `وصول: ${checkIn}` : 'اختر الوجهة والتواريخ والضيوف'}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-[#FF3B30] text-white text-xs font-bold shadow-sm">
              بحث
            </div>
          </button>
        </div>

      </div>

      {/* ── Mobile Slide-up Search Sheet ── */}
      {mobileSearchOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileSearchOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-white text-neutral-900 rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto"
            style={{ direction: 'rtl' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
              <h3 className="font-black text-lg text-neutral-900">ابحث عن رحلتك في اليمن</h3>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Tab Row */}
            <div className="flex items-center gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all',
                      isActive
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.labelAr}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'hotels' ? (
              <div className="space-y-4">
                {/* City */}
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                  <label className="block text-xs font-bold text-neutral-400 mb-1">المدينة أو الفندق</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                    <input
                      type="text"
                      placeholder="مثال: عدن، صنعاء، المكلا"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                    <label className="block text-xs font-bold text-neutral-400 mb-1">تاريخ الوصول</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-neutral-900 outline-none"
                    />
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                    <label className="block text-xs font-bold text-neutral-400 mb-1">تاريخ المغادرة</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">عدد الضيوف</div>
                    <div className="text-[10px] text-neutral-400">{guests} نزلاء، {rooms} غرفة</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-black w-6 text-center">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full py-4 rounded-2xl bg-[#FF3B30] text-white font-black text-base shadow-xl mt-4"
                >
                  استعراض الفنادق المتاحة
                </button>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <p className="text-sm font-semibold text-neutral-600">
                  {activeTab === 'flights'
                    ? 'احجز تذاكر الطيران إلى كافة المطارات المحلية والدولية'
                    : 'خدمات تأجير السيارات والتوصيل بين المدن'}
                </p>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full py-3.5 bg-[#FF3B30] text-white font-bold rounded-2xl text-sm shadow-lg"
                >
                  استعراض الخيارات
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
