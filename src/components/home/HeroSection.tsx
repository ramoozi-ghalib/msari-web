'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Hotel, Plane, Car, Search, MapPin, Calendar, Users, Star, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'hotels', labelAr: 'فنادق', icon: Hotel },
  { id: 'flights', labelAr: 'طيران', icon: Plane },
  { id: 'cars', labelAr: 'سيارات', icon: Car },
];

const yemenCities = ['صنعاء', 'عدن', 'مأرب', 'المكلا', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'البيضاء'];

export default function HeroSection() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale || 'ar';

  const [activeTab, setActiveTab] = useState('hotels');
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  
  // Interactive guests and rooms states
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '92vh' }}>

      {/* ── Background: Sanaa/Aden City Skyline at Dusk ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hero-bg.jpg')`
        }}
      >
        {/* Light gradient overlay — city stays clearly visible */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(22,6,77,0.65) 0%, rgba(30,10,90,0.40) 35%, rgba(40,12,90,0.35) 65%, rgba(14,3,41,0.75) 100%)'
        }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-16" style={{ minHeight: '92vh' }}>

        {/* Title Block */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h1 className="font-extrabold leading-tight mb-4 text-3xl sm:text-5xl lg:text-6xl text-white drop-shadow-md">
            اكتشف أجمل وجهات اليمن
            <br />
            مع <span className="text-[#FF3B30]">مساري</span>
          </h1>
          <p className="text-[#F4F2F8] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-semibold">
            منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران
            <br className="hidden sm:block" />
            وتأجير السيارات بسهولة وأمان
          </p>
        </div>

        {/* ── Search Box Area ── */}
        <div className="w-full max-w-[900px] mx-auto">

          {/* Tabs Row — sitting flush on top of the white card */}
          <div className="flex items-end gap-0 pe-4" style={{ direction: 'rtl' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors relative',
                    isActive
                      ? 'bg-white text-[#2d0f64] z-10 shadow-sm'
                      : 'bg-white/15 text-white/90 hover:bg-white/25 backdrop-blur-sm'
                  )}
                  style={isActive ? { marginBottom: '-1px' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.labelAr}</span>
                </button>
              );
            })}
          </div>

          {/* White Search Card */}
          <div className="bg-white rounded-2xl rounded-se-none p-5 shadow-2xl" style={{ direction: 'rtl' }}>
            {activeTab === 'hotels' ? (
              <div className="flex flex-col lg:flex-row items-stretch gap-3">

                {/* Field: City */}
                <div className="flex-[2] min-w-0">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">المدينة أو الفندق</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-11">
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
                      {yemenCities.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                {/* Divider (desktop) */}
                <div className="hidden lg:block w-px bg-gray-200 self-stretch my-1" />

                {/* Field: Check-in */}
                <div className="flex-[1.5] min-w-0">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">تاريخ الوصول</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-11">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-xs text-gray-800 outline-none"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px bg-gray-200 self-stretch my-1" />

                {/* Field: Check-out */}
                <div className="flex-[1.5] min-w-0">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">تاريخ المغادرة</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-11">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs text-gray-800 outline-none"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px bg-gray-200 self-stretch my-1" />

                {/* Field: Guests & Rooms (Interactive) */}
                <div className="flex-[1.2] min-w-0 relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">النزلاء والغرف</label>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-11 text-right focus:outline-none focus:border-[#23096e] transition-colors"
                  >
                    <Users className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {guests} {guests > 2 && guests <= 10 ? 'نزلاء' : 'نزيل'} - {rooms} {rooms > 2 && rooms <= 10 ? 'غرف' : 'غرفة'}
                    </span>
                  </button>

                  {/* Dropdown Popover */}
                  {showDropdown && (
                    <div className="absolute top-[105%] start-0 z-20 w-64 bg-white rounded-2xl p-4 shadow-xl border border-neutral-100 mt-1">
                      {/* Guests Control */}
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

                      {/* Rooms Control */}
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

                      {/* Close Done Button */}
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

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="h-11 px-6 bg-[#FF3B30] hover:bg-[#e02d23] text-white text-sm font-black rounded-xl flex items-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-[#FF3B30]/20"
                  >
                    <Search className="w-4 h-4" />
                    <span>ابحث الآن</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center">
                <p className="text-gray-500 text-sm mb-4">
                  {activeTab === 'flights' ? 'احجز رحلات الطيران بأفضل الأسعار' : 'خدمات تأجير السيارات مع أو بدون سائق'}
                </p>
                <button
                  onClick={handleSearch}
                  className="px-8 py-2.5 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black rounded-xl text-sm transition-all"
                >
                  استعرض الخيارات
                </button>
              </div>
            )}
          </div>

          {/* ── Stats Row ── */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ direction: 'rtl' }}>
            {[
              { value: '5000+', label: 'مستخدم سعيد', icon: Users, color: '#23096E' },
              { value: '100+', label: 'فندق', icon: Hotel, color: '#23096E' },
              { value: '6', label: 'محافظات', icon: MapPin, color: '#FF3B30' },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: stat.color + '12' }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-base font-black text-gray-900 leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
