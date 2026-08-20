'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { MapPin, Calendar, Users, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

interface HotelsSearchBarProps {
  cities: City[];
}

export default function HotelsSearchBar({ cities }: HotelsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'ar';

  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('city') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [rooms, setRooms] = useState(Number(searchParams.get('rooms')) || 1);

  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Set default dates if not present
  useEffect(() => {
    if (!checkIn) {
      const today = new Date();
      setCheckIn(today.toISOString().split('T')[0]);
    }
    if (!checkOut) {
      const tomorrow = new Date(Date.now() + 86400000);
      setCheckOut(tomorrow.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut]);

  const handleSearch = () => {
    const nextParams = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Reset to page 1 on new search
    nextParams.delete('page');

    if (selectedCity) {
      nextParams.set('city', selectedCity);
      nextParams.delete('q');
    } else if (query.trim()) {
      // Check if query matches a city name
      const matchedCity = cities.find(c => c.name.toLowerCase() === query.trim().toLowerCase() || c.nameEn?.toLowerCase() === query.trim().toLowerCase());
      if (matchedCity) {
        nextParams.set('city', matchedCity.name);
        nextParams.delete('q');
      } else {
        nextParams.set('q', query.trim());
        nextParams.delete('city');
      }
    } else {
      nextParams.delete('city');
      nextParams.delete('q');
    }

    if (checkIn) nextParams.set('checkIn', checkIn);
    if (checkOut) nextParams.set('checkOut', checkOut);
    if (guests > 1) nextParams.set('guests', String(guests)); else nextParams.delete('guests');
    if (rooms > 1) nextParams.set('rooms', String(rooms)); else nextParams.delete('rooms');

    setShowCityDropdown(false);
    setShowGuestsDropdown(false);

    router.push(`/${currentLocale}/hotels?${nextParams.toString()}`, { scroll: false });
  };

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setQuery(cityName);
    setShowCityDropdown(false);
  };

  return (
    <div className="w-full relative z-30">
      <div 
        className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-[0_12px_36px_-10px_rgba(35,9,110,0.18)] border border-neutral-200/90 text-neutral-800"
        style={{ direction: 'rtl' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          
          {/* 1. Destination / City */}
          <div className="md:col-span-4 relative text-start p-2 sm:p-2.5 rounded-xl bg-neutral-50/90 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-[#23096E]/20 border border-neutral-200/80 transition-all">
            <label className="block text-[10px] font-black text-neutral-400 mb-0.5">الوجهة أو المدينة</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#23096E] shrink-0" />
              <input
                type="text"
                placeholder="اختر المدينة أو الفندق..."
                value={query}
                onFocus={() => setShowCityDropdown(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedCity('');
                  setShowCityDropdown(true);
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-neutral-900 placeholder:text-neutral-400 outline-none"
              />
              <button 
                type="button" 
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* City Dropdown Menu */}
            {showCityDropdown && (
              <div className="absolute top-full start-0 mt-2 w-full sm:w-64 bg-white rounded-2xl p-2 shadow-2xl border border-neutral-100 z-50 animate-fade-in max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('');
                    setQuery('');
                    setShowCityDropdown(false);
                  }}
                  className={cn(
                    "w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between",
                    !selectedCity && !query ? "bg-[#23096E]/10 text-[#23096E]" : "hover:bg-neutral-50 text-neutral-700"
                  )}
                >
                  <span>جميع المدن</span>
                </button>
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCity(city.name)}
                    className={cn(
                      "w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between",
                      selectedCity === city.name ? "bg-[#23096E]/10 text-[#23096E]" : "hover:bg-neutral-50 text-neutral-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#23096E]" />
                      <span>{city.name}</span>
                    </div>
                    {city.hotelCount > 0 && (
                      <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500 font-medium">
                        {city.hotelCount} فندق
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Dates (Check-In & Check-Out) */}
          <div className="md:col-span-4 text-start p-2 sm:p-2.5 rounded-xl bg-neutral-50/90 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-[#23096E]/20 border border-neutral-200/80 transition-all">
            <label className="block text-[10px] font-black text-neutral-400 mb-0.5">تاريخ الوصول والمغادرة</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#23096E] shrink-0" />
              <div className="flex items-center gap-1.5 w-full text-xs font-bold text-neutral-800">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer w-full font-bold text-xs"
                />
                <span className="text-neutral-300 font-normal">-</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer w-full font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Guests & Rooms */}
          <div className="md:col-span-3 relative text-start p-2 sm:p-2.5 rounded-xl bg-neutral-50/90 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-[#23096E]/20 border border-neutral-200/80 transition-all">
            <label className="block text-[10px] font-black text-neutral-400 mb-0.5">الضيوف والغرف</label>
            <button
              type="button"
              onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
              className="flex items-center justify-between text-xs font-bold text-neutral-800 w-full"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Users className="w-4 h-4 text-[#23096E] shrink-0" />
                <span className="truncate">{guests} ضيوف، {rooms} غرفة</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>

            {/* Guests Popup */}
            {showGuestsDropdown && (
              <div className="absolute top-full end-0 mt-2 w-64 bg-white rounded-2xl p-4 shadow-2xl border border-neutral-100 z-50 animate-fade-in text-neutral-900">
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

                <div className="flex items-center justify-between py-2 pt-3">
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
                  className="w-full mt-3 py-1.5 bg-[#23096E] text-white rounded-xl text-xs font-bold hover:bg-[#3A1C8F] transition-colors"
                >
                  تم
                </button>
              </div>
            )}
          </div>

          {/* 4. Search Action Button */}
          <div className="md:col-span-1 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full h-10 md:h-11 bg-[#FF3B30] hover:bg-[#e03429] text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#FF3B30]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>بحث</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
