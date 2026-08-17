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

const quickDestinations = [
  { name: 'عدن', icon: '🌊' },
  { name: 'صنعاء', icon: '🏛️' },
  { name: 'المكلا', icon: '⛵' },
  { name: 'سقطرى', icon: '🌴' },
  { name: 'إب', icon: '🌿' },
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

  const handleSearch = (cityOverride?: string) => {
    const targetCity = cityOverride !== undefined ? cityOverride : query;
    if (activeTab === 'hotels') {
      const searchParams = new URLSearchParams();
      if (targetCity.trim()) searchParams.set('city', targetCity.trim());
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

  const subtitle = hero?.subtitleAr || 'منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران وتأجير السيارات';
  
  // Real luxury hotel & resort photography
  const bgImage = (hero?.backgroundImageUrl && hero.backgroundImageUrl !== '/images/hero-bg.jpg')
    ? hero.backgroundImageUrl
    : 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000&auto=format&fit=crop';

  const renderHeroTitle = (title: string | undefined) => {
    const rawTitle = title ? title.replace(/\n/g, ' ') : 'اكتشف أجمل وجهات اليمن مع مساري';

    if (rawTitle.includes('مساري')) {
      const parts = rawTitle.split('مساري');
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

    return rawTitle;
  };

  return (
    <section className="relative overflow-hidden w-full text-white min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] flex items-center justify-center">
      
      {/* ── Real Panoramic Luxury Resort Background ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        {/* Balanced Royal Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(8,2,26,0.80) 0%, rgba(21,5,69,0.68) 45%, rgba(35,9,110,0.85) 100%)',
          }}
        />
      </div>

      {/* ── Content Container: Compact, Balanced & Clean Spacing ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-8 sm:pb-12 text-center flex flex-col items-center w-full">
        
        {/* Official Hero Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[11px] sm:text-xs font-bold mb-3 sm:mb-4 border border-white/15 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
          <span>منصة حجز الفنادق الأولى في اليمن</span>
        </div>

        {/* Hero Title: Strictly in ONE ROW on all screen sizes with weighted responsive size */}
        <h1 className="text-[17px] min-[360px]:text-[19px] min-[390px]:text-[21px] sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white whitespace-nowrap leading-tight tracking-tight mb-2 sm:mb-2.5 max-w-full">
          {renderHeroTitle(hero?.titleAr)}
        </h1>

        {/* Subtitle: Strictly in ONE ROW on all screen sizes */}
        <p className="text-white/85 text-[10.5px] min-[360px]:text-[11.5px] min-[390px]:text-[12.5px] sm:text-sm md:text-base font-medium whitespace-nowrap leading-tight max-w-full overflow-hidden text-ellipsis mb-5 sm:mb-6 px-1">
          {subtitle}
        </p>

        {/* ── 1. Service Selection Tabs (Positioned First) ── */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5" style={{ direction: 'rtl' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black transition-all duration-300',
                  isActive
                    ? 'bg-white text-[var(--brand-primary)] shadow-md scale-105'
                    : 'bg-white/15 text-white/85 hover:bg-white/25 backdrop-blur-md'
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{tab.labelAr}</span>
              </button>
            );
          })}
        </div>

        {/* ── 2. Luxury Search Console (Desktop & Tablet) ── */}
        <div className="hidden md:block w-full max-w-4xl mx-auto">
          {activeTab === 'hotels' ? (
            <div 
              className="bg-white rounded-3xl p-3 sm:p-3.5 shadow-2xl border border-white/20 text-neutral-800"
              style={{ direction: 'rtl' }}
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                
                {/* Destination: Completely Free Text Input */}
                <div className="col-span-4 text-start p-2 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <label className="block text-[10px] font-black text-neutral-400 mb-0.5">الوجهة أو الفندق</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <input
                      type="text"
                      placeholder="المدينة، الفندق، أو الوجهة"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-neutral-900 placeholder-neutral-400 outline-none"
                    />
                  </div>
                </div>

                <div className="w-px h-8 bg-neutral-200" />

                {/* Dates */}
                <div className="col-span-4 text-start p-2 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <label className="block text-[10px] font-black text-neutral-400 mb-0.5">تاريخ الوصول والمغادرة</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <div className="flex items-center gap-1.5 w-full text-xs font-bold text-neutral-700">
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer w-full font-bold"
                      />
                      <span className="text-neutral-300">-</span>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer w-full font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-px h-8 bg-neutral-200" />

                {/* Guests & Rooms */}
                <div className="col-span-2 relative text-start p-2 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <label className="block text-[10px] font-black text-neutral-400 mb-0.5">الضيوف والغرف</label>
                  <button
                    type="button"
                    onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                    className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 w-full"
                  >
                    <Users className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span className="truncate">{guests} ضيوف، {rooms} غرفة</span>
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
                    onClick={() => handleSearch()}
                    className="w-full py-3 px-5 rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>بحث</span>
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-white/20 text-neutral-800 text-center space-y-3">
              <p className="text-sm font-bold text-neutral-600">
                {activeTab === 'flights' 
                  ? '✈️ احجز تذاكر الطيران إلى كافة المطارات المحلية والدولية بأفضل الأسعار المباشرة'
                  : '🚗 خدمات تأجير السيارات الفاخرة والنقل بين المحافظات مع أو بدون سائق'}
              </p>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-8 py-2.5 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black rounded-2xl text-sm shadow-lg transition-all inline-flex items-center gap-2"
              >
                <span>استعرض الخيارات المتاحة</span>
              </button>
            </div>
          )}

          {/* ── Quick City Pills (Desktop Only) ── */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs font-bold text-white/85">
            <span className="text-white/60 text-[11px]">وجهات سريعة:</span>
            {quickDestinations.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => {
                  setQuery(dest.name);
                  handleSearch(dest.name);
                }}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all text-white inline-flex items-center gap-1 hover:scale-105 text-xs"
              >
                <span>{dest.icon}</span>
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. Luxury Search Bar (Mobile View - Perfectly Airy & Clean) ── */}
        <div className="md:hidden w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="w-full flex items-center justify-between bg-white text-neutral-800 rounded-2xl shadow-xl px-4 py-3 border border-white/40 active:scale-98 transition-transform"
            style={{ direction: 'rtl' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                <Search className="w-4 h-4 text-[#FF3B30]" />
              </div>
              <div className="text-start">
                <div className="text-xs font-black text-neutral-900">
                  {query.trim() ? query : 'إلى أين ترغب بالسفر؟'}
                </div>
                <div className="text-[10px] text-neutral-400 font-semibold">
                  {checkIn ? `وصول: ${checkIn}` : 'اختر الوجهة أو الفندق والتواريخ'}
                </div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#FF3B30] text-white text-xs font-bold shadow-sm">
              بحث
            </div>
          </button>
        </div>

      </div>

      {/* ── Mobile Slide-up Search Sheet with Quick Pills Inside ── */}
      {mobileSearchOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileSearchOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-white text-neutral-900 rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
            style={{ direction: 'rtl' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base text-neutral-900">ابحث عن رحلتك في اليمن</h3>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Tab Row */}
            <div className="flex items-center gap-2 mb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all',
                      isActive
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.labelAr}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'hotels' ? (
              <div className="space-y-3.5">
                {/* City / Hotel Free Input */}
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">المدينة أو اسم الفندق</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                    <input
                      type="text"
                      placeholder="اكتب اسم المدينة، الفندق، أو الوجهة"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                {/* Quick Selection Tags inside Mobile Sheet */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[10px] text-neutral-400 font-bold shrink-0">اقتراحات:</span>
                  {quickDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => setQuery(dest.name)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[10px] font-bold shrink-0 hover:bg-neutral-200"
                    >
                      {dest.icon} {dest.name}
                    </button>
                  ))}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">تاريخ الوصول</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-neutral-900 outline-none"
                    />
                  </div>

                  <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">تاريخ المغادرة</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">عدد الضيوف</div>
                    <div className="text-[10px] text-neutral-400">{guests} نزلاء، {rooms} غرفة</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-black w-5 text-center">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
                      className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="w-full py-3.5 rounded-2xl bg-[#FF3B30] text-white font-black text-sm shadow-xl mt-3"
                >
                  استعراض الفنادق المتاحة
                </button>
              </div>
            ) : (
              <div className="py-5 text-center space-y-3">
                <p className="text-xs font-semibold text-neutral-600">
                  {activeTab === 'flights'
                    ? 'احجز تذاكر الطيران إلى كافة المطارات المحلية والدولية'
                    : 'خدمات تأجير السيارات والتوصيل بين المدن'}
                </p>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="w-full py-3 bg-[#FF3B30] text-white font-bold rounded-2xl text-xs shadow-lg"
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
