'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Hotel, Plane, Car, Search, MapPin, Calendar, Users
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
  };

  const rawSubtitle = hero?.subtitleAr 
    ? hero.subtitleAr.replace(/\s+/g, ' ').trim() 
    : 'منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران وتأجير السيارات';
  
  // Real luxury hotel & resort photography
  const bgImage = (hero?.backgroundImageUrl && hero.backgroundImageUrl !== '/images/hero-bg.jpg')
    ? hero.backgroundImageUrl
    : 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000&auto=format&fit=crop';

  const renderHeroTitle = (title: string | undefined) => {
    const rawTitle = title ? title.replace(/\s+/g, ' ').trim() : 'اكتشف أجمل وجهات اليمن مع مساري';

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
    <div className="relative w-full">
      
      {/* ── 1. Hero Atmospheric Header (+20% Higher & Spacious) ── */}
      <section className="relative overflow-hidden w-full text-white min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] pt-28 sm:pt-36 lg:pt-40 pb-24 sm:pb-32 lg:pb-36 flex flex-col items-center justify-center">
        
        {/* Panoramic Luxury Resort Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${bgImage}')` }}
        >
          {/* Balanced Royal Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(8,2,26,0.82) 0%, rgba(21,5,69,0.72) 45%, rgba(35,9,110,0.92) 100%)',
            }}
          />
        </div>

        {/* Content Container: Spacious, Breathable Typography */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center w-full">
          
          {/* Top Badge: Elevated at the very top with clear breathing room */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold mb-5 sm:mb-6 border border-white/20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <span>منصة حجز الفنادق الأولى في اليمن</span>
          </div>

          {/* Hero Title: Strictly in ONE ROW with fluid scaling */}
          <h1 
            className="font-black text-white whitespace-nowrap leading-tight tracking-tight mb-3 sm:mb-4 max-w-full text-center"
            style={{ fontSize: 'clamp(14px, 4.2vw, 42px)' }}
          >
            {renderHeroTitle(hero?.titleAr)}
          </h1>

          {/* Subtitle: Strictly in ONE ROW */}
          <p 
            className="text-white/85 font-medium whitespace-nowrap leading-tight max-w-full overflow-hidden text-ellipsis px-1 text-center"
            style={{ fontSize: 'clamp(10px, 2.7vw, 16px)' }}
          >
            {rawSubtitle}
          </p>

        </div>
      </section>

      {/* ── 2. Floating Overlapping Search Console (Half on Hero, Half on Page - Unified for Mobile & Desktop) ── */}
      <div className="relative z-30 max-w-5xl mx-auto px-3 sm:px-6 -mt-16 sm:-mt-20 lg:-mt-22">
        <div 
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_-15px_rgba(35,9,110,0.18)] border border-neutral-100/90 text-neutral-800"
          style={{ direction: 'rtl' }}
        >
          
          {/* Top Row: Service Tabs */}
          <div className="flex items-center gap-2 mb-3.5 pb-3 border-b border-neutral-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all',
                    isActive
                      ? 'bg-[var(--brand-primary)] text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{tab.labelAr}</span>
                </button>
              );
            })}
          </div>

          {/* Hotels Search Inputs */}
          {activeTab === 'hotels' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-2 items-center">
              
              {/* Destination: Free Text Input */}
              <div className="md:col-span-4 bg-neutral-50 md:bg-transparent p-2.5 md:p-2 rounded-2xl border md:border-0 border-neutral-100 hover:bg-neutral-50 transition-colors">
                <label className="block text-[10px] font-black text-neutral-400 mb-0.5">الوجهة أو الفندق</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <input
                    type="text"
                    placeholder="المدينة، الفندق، أو الوجهة"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-neutral-900 placeholder-neutral-400 outline-none"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-neutral-200" />

              {/* Dates */}
              <div className="md:col-span-4 bg-neutral-50 md:bg-transparent p-2.5 md:p-2 rounded-2xl border md:border-0 border-neutral-100 hover:bg-neutral-50 transition-colors">
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

              <div className="hidden md:block w-px h-8 bg-neutral-200" />

              {/* Guests & Rooms */}
              <div className="md:col-span-2 relative bg-neutral-50 md:bg-transparent p-2.5 md:p-2 rounded-2xl border md:border-0 border-neutral-100 hover:bg-neutral-50 transition-colors">
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
              <div className="md:col-span-2 pt-1 md:pt-0">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="w-full py-3 px-5 rounded-2xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
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
                className="px-6 sm:px-8 py-2.5 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg transition-all inline-flex items-center gap-2"
              >
                <span>استعرض الخيارات المتاحة</span>
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
