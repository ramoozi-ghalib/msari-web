'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Hotel, Plane, Car, Search, MapPin, Calendar, Users, Building2, ChevronDown, BedDouble
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomepageContentData } from '@/services/cms';

interface HeroSectionProps {
  hero?: HomepageContentData['hero'];
}

const desktopTabs = [
  { id: 'hotels', labelAr: 'فنادق', icon: Hotel },
  { id: 'flights', labelAr: 'طيران', icon: Plane },
  { id: 'cars', labelAr: 'سيارات', icon: Car },
];

export default function HeroSection({ hero }: HeroSectionProps) {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'ar';

  const [activeTab, setActiveTab] = useState('hotels');
  const [query, setQuery] = useState('');
  
  // Default check-in = Today, check-out = Tomorrow
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setCheckIn(todayStr);
    setCheckOut(tomorrowStr);
  }, []);

  // Interactive guests and rooms states
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [showMobileGuestsModal, setShowMobileGuestsModal] = useState(false);

  const handleSearch = () => {
    if (activeTab === 'hotels') {
      const searchParams = new URLSearchParams();
      if (query.trim()) searchParams.set('city', query.trim());
      if (checkIn) searchParams.set('checkIn', checkIn);
      if (checkOut) searchParams.set('checkOut', checkOut);
      searchParams.set('guests', String(guests));
      searchParams.set('rooms', String(rooms));
      if (childrenCount > 0) searchParams.set('children', String(childrenCount));
      router.push(`/${currentLocale}/hotels?${searchParams.toString()}`);
    } else if (activeTab === 'flights') {
      router.push(`/${currentLocale}/flights`);
    } else {
      router.push(`/${currentLocale}/cars`);
    }
  };

  // Ultra-Luxury 5-Star Hotel & Grand Resort Photography
  const bgImage = (hero?.backgroundImageUrl && hero.backgroundImageUrl !== '/images/hero-bg.jpg')
    ? hero.backgroundImageUrl
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="relative w-full">
      
      {/* ── 1. Grand Atmospheric Hero Section ── */}
      <section className="relative overflow-hidden w-full text-white min-h-[360px] sm:min-h-[500px] lg:min-h-[560px] pt-24 sm:pt-36 lg:pt-40 pb-36 sm:pb-44 lg:pb-48 flex flex-col items-center justify-center">
        
        {/* Panoramic 5-Star Luxury Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${bgImage}')` }}
        >
          {/* Royal Ambient Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(8,2,26,0.78) 0%, rgba(25,6,77,0.65) 45%, rgba(35,9,110,0.92) 100%)',
            }}
          />
        </div>

        {/* Content Container: Clean 2-Line Headline */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center w-full">
          
          <div className="text-center space-y-2.5 sm:space-y-4 mb-2">
            {/* Line 1: Main Title */}
            <h1 
              className="font-black text-white whitespace-nowrap leading-tight tracking-tight max-w-full drop-shadow-xl"
              style={{ fontSize: 'clamp(20px, 5.5vw, 48px)' }}
            >
              {(hero?.titleAr || 'حجزك أسهل... مع مساري').includes('مع مساري') ? (
                <>
                  {(hero?.titleAr || 'حجزك أسهل... مع مساري').split('مع مساري')[0]}
                  <span className="text-[#FF3B30] drop-shadow-md">مع مساري</span>
                  {(hero?.titleAr || 'حجزك أسهل... مع مساري').split('مع مساري')[1] || ''}
                </>
              ) : (
                hero?.titleAr || 'حجزك أسهل... مع مساري'
              )}
            </h1>

            {/* Line 2: Subtitle */}
            <p 
              className="font-bold text-white/95 whitespace-nowrap leading-tight max-w-full drop-shadow-lg"
              style={{ fontSize: 'clamp(12px, 3.4vw, 24px)' }}
            >
              {hero?.subtitleAr || 'احجز فندقك في اليمن بأفضل سعر'}
            </p>
          </div>

        </div>
      </section>

      {/* ── 2. Floating Search Console (Mobile: 50% on Hero / 50% outside) ── */}
      <div className="relative z-30 max-w-5xl mx-auto px-3 sm:px-6 -mt-[140px] sm:-mt-20 lg:-mt-22">
        
        {/* ── DESKTOP VIEW: Full 12-Column Luxury Search Console with Prominent Fields ── */}
        <div 
          className="hidden md:block bg-white rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_-15px_rgba(35,9,110,0.22)] border border-neutral-100/90 text-neutral-800"
          style={{ direction: 'rtl' }}
        >
          {/* Desktop Tabs */}
          <div className="flex items-center gap-3 mb-4 pb-3.5 border-b border-neutral-100">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200',
                    isActive
                      ? 'bg-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/30 scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200/60'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.labelAr}</span>
                </button>
              );
            })}
          </div>

          {/* Search Inputs Row with Prominent Elevated Fields */}
          {activeTab === 'hotels' ? (
            <div className="grid grid-cols-12 gap-2.5 items-center">
              
              {/* Destination */}
              <div className="col-span-4 text-start p-2.5 rounded-2xl bg-neutral-50 hover:bg-white focus-within:bg-white focus-within:border-[var(--brand-primary)] border border-neutral-200/90 shadow-sm transition-all">
                <label className="block text-[10px] font-black text-neutral-400 mb-0.5">الوجهة أو الفندق</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <input
                    type="text"
                    placeholder="المدينة، الفندق"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="col-span-4 text-start p-2.5 rounded-2xl bg-neutral-50 hover:bg-white focus-within:bg-white focus-within:border-[var(--brand-primary)] border border-neutral-200/90 shadow-sm transition-all">
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

              {/* Guests & Rooms */}
              <div className="col-span-2 relative text-start p-2.5 rounded-2xl bg-neutral-50 hover:bg-white focus-within:bg-white focus-within:border-[var(--brand-primary)] border border-neutral-200/90 shadow-sm transition-all">
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
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>بحث</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="py-4 text-center space-y-3">
              <p className="text-xs sm:text-sm font-bold text-neutral-600">
                {activeTab === 'flights' 
                  ? '✈️ احجز تذاكر الطيران إلى كافة المطارات المحلية والدولية بأفضل الأسعار المباشرة'
                  : '🚗 خدمات تأجير السيارات الفاخرة والنقل بين المحافظات مع أو بدون سائق'}
              </p>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-6 sm:px-8 py-2.5 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black rounded-xl text-xs sm:text-sm shadow-lg transition-all inline-flex items-center gap-2"
              >
                <span>بحث</span>
              </button>
            </div>
          )}

        </div>

        {/* ── MOBILE VIEW: Seamless Unified Notched Hotel Search Card ── */}
        <div className="md:hidden w-full max-w-sm mx-auto" style={{ direction: 'rtl' }}>
          
          {/* Top Notch Tab: Attached Seamlessly to Card Body */}
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-t-2xl bg-white text-neutral-900 font-black text-xs border-t border-x border-neutral-100 shadow-[-5px_-5px_15px_rgba(0,0,0,0.04)] -mb-[1px] relative z-10">
              <BedDouble className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>فنادق</span>
            </div>
          </div>

          {/* Unified Solid Card Body */}
          <div className="bg-white rounded-3xl rounded-tr-none p-4 shadow-[0_20px_50px_-10px_rgba(35,9,110,0.22)] border border-neutral-100/90 text-neutral-800 space-y-3 relative z-0">
            
            {/* Field 1: Destination / Hotel Name */}
            <div className="rounded-2xl border border-neutral-200/90 p-3 bg-neutral-50/60 hover:bg-neutral-50 focus-within:border-[var(--brand-primary)] focus-within:bg-white transition-all">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[var(--brand-primary)] shrink-0" />
                <input
                  type="text"
                  placeholder="المدينة، الفندق"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-neutral-800 placeholder:text-neutral-400 placeholder:font-normal outline-none"
                />
              </div>
            </div>

            {/* Row 2: Check-in & Check-out Dates (Side by Side) */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Check-In Date */}
              <div className="relative rounded-2xl border border-neutral-200/90 p-2.5 bg-neutral-50/60 hover:bg-neutral-50 focus-within:border-[var(--brand-primary)] focus-within:bg-white transition-all text-start">
                <label className="block text-[10px] font-bold text-neutral-400 mb-0.5">موعد الوصول</label>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-xs font-black text-neutral-900 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Check-Out Date */}
              <div className="relative rounded-2xl border border-neutral-200/90 p-2.5 bg-neutral-50/60 hover:bg-neutral-50 focus-within:border-[var(--brand-primary)] focus-within:bg-white transition-all text-start">
                <label className="block text-[10px] font-bold text-neutral-400 mb-0.5">موعد المغادرة</label>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-xs font-black text-neutral-900 outline-none cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Field 3: Guests & Rooms Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMobileGuestsModal(!showMobileGuestsModal)}
                className="w-full rounded-2xl border border-neutral-200/90 p-3 bg-neutral-50/60 hover:bg-neutral-50 flex items-center justify-between text-start transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span className="text-xs font-black text-neutral-900">
                    {rooms} غرفة, {guests} بالغين{childrenCount > 0 ? `, ${childrenCount} أطفال` : ', 0 طفل'}
                  </span>
                </div>
                <ChevronDown size={14} className={cn('text-neutral-400 transition-transform', showMobileGuestsModal && 'rotate-180')} />
              </button>

              {/* Mobile Guest Counter Dropdown */}
              {showMobileGuestsModal && (
                <div className="mt-2 p-3 bg-white rounded-2xl border border-neutral-200 shadow-xl space-y-2.5 animate-scale-in text-neutral-900">
                  {/* Adults */}
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <div>
                      <div className="text-xs font-black">البالغين</div>
                      <div className="text-[9.5px] text-neutral-400">12 سنة فأكثر</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-black w-4 text-center">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests(guests + 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <div>
                      <div className="text-xs font-black">الأطفال</div>
                      <div className="text-[9.5px] text-neutral-400">أقل من 12 سنة</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-black w-4 text-center">{childrenCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount(childrenCount + 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="text-xs font-black">الغرف</div>
                      <div className="text-[9.5px] text-neutral-400">عدد الغرف</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-black w-4 text-center">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(rooms + 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold hover:bg-neutral-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMobileGuestsModal(false)}
                    className="w-full py-1.5 bg-[var(--brand-primary)] text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    تم
                  </button>
                </div>
              )}
            </div>

            {/* Big Prominent Full-Width Search CTA Button */}
            <button
              type="button"
              onClick={() => handleSearch()}
              className="w-full py-3.5 rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-sm shadow-xl shadow-[#FF3B30]/30 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>بحث</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
