'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Hotel, Plane, Car, Search, MapPin, Calendar, Users, Plus, Minus, X } from 'lucide-react';
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

const yemenCities = ['صنعاء', 'عدن', 'مأرب', 'المكلا', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'البيضاء'];

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
  const [showDropdown, setShowDropdown] = useState(false);

  // Mobile: fields live in a slide-up sheet instead of being stacked inline
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
  const customBg = hero?.backgroundImageUrl && hero.backgroundImageUrl !== '/images/hero-bg.jpg' ? hero.backgroundImageUrl : null;

  const tabsRowEl = (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 lg:mb-4 max-w-full flex-wrap" style={{ direction: 'rtl' }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-all shrink-0',
              isActive
                ? 'bg-white text-[#2d0f64] shadow-md'
                : 'bg-white/15 text-white/85 hover:bg-white/25 backdrop-blur-sm'
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.labelAr}</span>
          </button>
        );
      })}
    </div>
  );

  const sheetTabsRowEl = (
    <div className="flex items-center gap-2 mb-4 max-w-full flex-wrap" style={{ direction: 'rtl' }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-all',
              isActive
                ? 'bg-[#23096E] text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.labelAr}</span>
          </button>
        );
      })}
    </div>
  );

  const searchFieldsEl = (
    activeTab === 'hotels' ? (
      <div className="flex flex-col lg:flex-row items-stretch gap-3 w-full">
        {/* Field: City */}
        <div className="flex-[2] min-w-0">
          <label className="block text-[11px] font-bold text-gray-500 mb-1">المدينة أو الفندق</label>
          <div className="flex items-center gap-2 rounded-xl px-3 h-11 hover:bg-gray-50 transition-colors">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="اختر المدينة أو الفندق"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              list="hero-cities"
            />
            <datalist id="hero-cities">
              {yemenCities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-gray-200 self-stretch my-1" />

        {/* Field: Check-in */}
        <div className="flex-[1.5] min-w-0">
          <label className="block text-[11px] font-bold text-gray-500 mb-1">تاريخ الوصول</label>
          <div className="flex items-center gap-2 rounded-xl px-3 h-11 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 outline-none"
            />
          </div>
        </div>

        <div className="hidden lg:block w-px bg-gray-200 self-stretch my-1" />

        {/* Field: Check-out */}
        <div className="flex-[1.5] min-w-0">
          <label className="block text-[11px] font-bold text-gray-500 mb-1">تاريخ المغادرة</label>
          <div className="flex items-center gap-2 rounded-xl px-3 h-11 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 outline-none"
            />
          </div>
        </div>

        <div className="hidden lg:block w-px bg-gray-200 self-stretch my-1" />

        {/* Field: Guests & Rooms */}
        <div className="flex-[1.2] min-w-0 relative">
          <label className="block text-[11px] font-bold text-gray-500 mb-1">النزلاء والغرف</label>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center gap-2 rounded-xl px-3 h-11 hover:bg-gray-50 transition-colors text-right focus:outline-none"
          >
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
              {guests} {guests > 2 && guests <= 10 ? 'نزلاء' : 'نزيل'} - {rooms} {rooms > 2 && rooms <= 10 ? 'غرف' : 'غرفة'}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute top-[105%] start-0 z-20 w-64 bg-white rounded-2xl p-4 shadow-xl border border-neutral-100 mt-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-800">عدد النزلاء</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold text-neutral-800 w-5 text-center">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(Math.min(10, guests + 1))}
                    className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-800">عدد الغرف</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold text-neutral-800 w-5 text-center">{rooms}</span>
                  <button
                    type="button"
                    onClick={() => setRooms(Math.min(5, rooms + 1))}
                    className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDropdown(false)}
                className="w-full py-1.5 bg-[#23096e] hover:bg-[#1a0655] text-white text-xs font-bold rounded-lg transition-colors text-center"
              >
                تم
              </button>
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="h-11 px-6 bg-[#FF3B30] hover:bg-[#e02d23] text-white text-sm font-black rounded-xl flex items-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-[#FF3B30]/20"
          >
            <Search className="w-4 h-4" />
            <span>ابحث الآن</span>
          </button>
        </div>
      </div>
    ) : (
      <div className="py-5 text-center w-full">
        <p className="text-gray-500 text-sm mb-4">
          {activeTab === 'flights' ? 'احجز رحلات الطيران بأفضل الأسعار' : 'خدمات تأجير السيارات مع أو بدون سائق'}
        </p>
        <button
          type="button"
          onClick={handleSearch}
          className="px-8 py-2.5 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black rounded-xl text-sm transition-all"
        >
          استعرض الخيارات
        </button>
      </div>
    )
  );

  const renderHeroTitle = (title: string | undefined) => {
    if (!title) {
      return (
        <>
          اكتشف أجمل وجهات
          <br />
          اليمن مع <span className="text-[#FF3B30]">مساري</span>
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
    <section className="relative overflow-hidden w-full max-w-full min-h-[38vh] sm:min-h-[50vh] lg:min-h-[92vh]">
      {/* ── Background: Custom CMS photo or illustrated Sana'a skyline at dusk ── */}
      {customBg ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${customBg}')` }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(22,6,77,0.65) 0%, rgba(30,10,90,0.40) 35%, rgba(40,12,90,0.35) 65%, rgba(14,3,41,0.75) 100%)',
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #170a3d 0%, #4a2170 40%, #a85a52 82%, #c9793f 100%)' }}
        >
          <svg
            className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
            style={{ height: '14vh', minHeight: 75, maxHeight: 220 }}
            viewBox="0 0 700 170"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect x="0" y="90" width="52" height="80" fill="#241040" /><rect x="14" y="66" width="24" height="24" fill="#241040" />
            <rect x="14" y="106" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="30" y="106" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="14" y="128" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="30" y="128" width="7" height="10" fill="#F3D9A4" opacity=".6" />
            <rect x="60" y="58" width="40" height="112" fill="#2c1450" /><rect x="72" y="34" width="16" height="24" fill="#2c1450" />
            <rect x="68" y="76" width="7" height="10" fill="#F3D9A4" opacity=".65" /><rect x="84" y="76" width="7" height="10" fill="#F3D9A4" opacity=".65" /><rect x="68" y="98" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="84" y="98" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="68" y="120" width="7" height="10" fill="#F3D9A4" opacity=".55" /><rect x="84" y="120" width="7" height="10" fill="#F3D9A4" opacity=".55" />
            <rect x="108" y="112" width="44" height="58" fill="#241040" />
            <rect x="118" y="126" width="7" height="10" fill="#F3D9A4" opacity=".55" /><rect x="136" y="126" width="7" height="10" fill="#F3D9A4" opacity=".55" />
            <rect x="160" y="128" width="30" height="42" fill="#2c1450" />
            <rect x="168" y="140" width="6" height="9" fill="#F3D9A4" opacity=".5" />
            <rect x="548" y="118" width="32" height="52" fill="#2c1450" />
            <rect x="556" y="130" width="6" height="9" fill="#F3D9A4" opacity=".5" />
            <rect x="586" y="96" width="46" height="74" fill="#241040" /><rect x="600" y="74" width="18" height="22" fill="#241040" />
            <rect x="596" y="112" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="613" y="112" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="596" y="134" width="7" height="10" fill="#F3D9A4" opacity=".55" /><rect x="613" y="134" width="7" height="10" fill="#F3D9A4" opacity=".55" />
            <rect x="638" y="62" width="38" height="108" fill="#2c1450" /><rect x="650" y="40" width="14" height="22" fill="#2c1450" />
            <rect x="646" y="80" width="7" height="10" fill="#F3D9A4" opacity=".65" /><rect x="661" y="80" width="7" height="10" fill="#F3D9A4" opacity=".65" /><rect x="646" y="102" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="661" y="102" width="7" height="10" fill="#F3D9A4" opacity=".6" /><rect x="646" y="124" width="7" height="10" fill="#F3D9A4" opacity=".55" /><rect x="661" y="124" width="7" height="10" fill="#F3D9A4" opacity=".55" />
            <rect x="680" y="126" width="20" height="44" fill="#241040" />
          </svg>
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-[420px] max-w-full h-[420px] rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,169,58,.35), transparent 70%)' }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(15,6,40,.5) 0%, rgba(15,6,40,.25) 45%, rgba(15,6,40,.6) 100%)' }}
          />
        </div>
      )}

      {/* ── Content: Balanced spacing with stable hero height ── */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-14 pb-5 sm:pt-20 sm:pb-10 lg:pt-32 lg:pb-20 min-h-[38vh] sm:min-h-[50vh] lg:min-h-[92vh] w-full max-w-full">
        {/* Title Block */}
        <div className="text-center mb-0 max-w-3xl mx-auto w-full px-2">
          <span className="hidden lg:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8A93A]" />
            منصة حجز الفنادق الأولى في اليمن
          </span>
          <h1 className="font-extrabold text-center text-white drop-shadow-md mb-2 lg:mb-4 text-[18px] min-[360px]:text-[19px] min-[390px]:text-[21px] sm:text-4xl md:text-5xl lg:text-6xl leading-snug">
            {renderHeroTitle(hero?.titleAr)}
          </h1>
          <p className="text-[#F4F2F8] text-[11px] min-[375px]:text-xs sm:text-base md:text-lg max-w-[340px] sm:max-w-xl mx-auto leading-relaxed font-semibold px-2">
            {subtitle === 'منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران وتأجير السيارات بسهولة وأمان' ? (
              <>
                منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران
                <br className="sm:hidden" />
                وتأجير السيارات بسهولة وأمان
              </>
            ) : (
              subtitle
            )}
          </p>
        </div>

        {/* ── Search Area: Shifted down 10% with harmonious gap ── */}
        <div className="w-full max-w-[900px] mx-auto mt-4 sm:mt-6 lg:mt-8">
          {/* Desktop / tablet: centered pill tabs + single-row search bar */}
          <div className="hidden lg:block text-center w-full">
            {tabsRowEl}
            <div className="bg-white rounded-2xl p-3 shadow-2xl mx-auto max-w-[820px] w-full" style={{ direction: 'rtl' }}>
              {searchFieldsEl}
            </div>
          </div>

          {/* Mobile: single compact pill — opens slide-up search sheet */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="lg:hidden w-full flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-4 py-3 sm:px-5 sm:py-4"
            style={{ direction: 'rtl' }}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3B30] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-500 truncate">
              {query.trim() ? query : 'إلى وين تسافر؟'}
            </span>
          </button>

          {/* Mobile: tabs shown directly in the hero */}
          <div className="lg:hidden mt-2.5 sm:mt-3.5 w-full">
            {tabsRowEl}
          </div>
        </div>
      </div>

      {/* ── Mobile search sheet ── */}
      {mobileSearchOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 animate-fade-in"
          onClick={() => setMobileSearchOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 pb-8 max-h-[88vh] overflow-y-auto"
            style={{ direction: 'rtl' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-gray-900">ابحث عن رحلتك</h3>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sheetTabsRowEl}
            <div className="bg-white rounded-2xl pt-2">
              {searchFieldsEl}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
