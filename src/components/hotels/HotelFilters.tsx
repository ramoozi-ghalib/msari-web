'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Star, Filter, X, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

interface HotelFiltersProps {
  cities: City[];
  totalHotels?: number;
}

export default function HotelFilters({ cities, totalHotels }: HotelFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Local state for debouncing and immediate UI updates
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 1000
  ]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>(
    searchParams.get('ratings')?.split(',').map(Number).filter(Boolean) || []
  );

  // Active filters count
  const activeFiltersCount = [
    Boolean(searchQuery),
    Boolean(selectedCity),
    priceRange[0] > 0 || priceRange[1] < 1000,
    selectedRatings.length > 0,
  ].filter(Boolean).length;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      
      if (searchQuery) params.set('q', searchQuery); else params.delete('q');
      if (selectedCity) params.set('city', selectedCity); else params.delete('city');
      
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString()); else params.delete('minPrice');
      if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1].toString()); else params.delete('maxPrice');
      
      if (selectedRatings.length > 0) params.set('ratings', selectedRatings.join(',')); else params.delete('ratings');
      
      // Reset page on filter change
      params.delete('page');

      router.push(`?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCity, priceRange, selectedRatings, router, searchParams]);

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setPriceRange([0, 1000]);
    setSelectedRatings([]);
    router.push(window.location.pathname, { scroll: false });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Search by Hotel Name */}
      <div>
        <label className="block text-xs font-black text-neutral-600 mb-2">بحث باسم الفندق</label>
        <div className="relative">
          <input
            type="text"
            placeholder="اكتب اسم الفندق..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 ps-9 pe-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-[#23096E]/20 focus:border-[#23096E] outline-none transition-all"
          />
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {/* City Filter */}
      <div>
        <label className="block text-xs font-black text-neutral-600 mb-2">المدينة / الوجهة</label>
        <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar pe-1">
          <button
            type="button"
            onClick={() => setSelectedCity('')}
            className={cn(
              "w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between",
              selectedCity === '' 
                ? "bg-[#23096E] text-white shadow-sm" 
                : "hover:bg-neutral-100 text-neutral-600 bg-neutral-50/70"
            )}
          >
            <span>جميع المدن</span>
            {selectedCity === '' && <Check size={14} className="text-white" />}
          </button>
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => setSelectedCity(city.name)}
              className={cn(
                "w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between",
                selectedCity === city.name 
                  ? "bg-[#23096E] text-white shadow-sm" 
                  : "hover:bg-neutral-100 text-neutral-700 bg-neutral-50/70"
              )}
            >
              <div className="flex items-center gap-2">
                <MapPin size={13} className={selectedCity === city.name ? "text-white" : "text-[#23096E]"} />
                <span>{city.name}</span>
              </div>
              {city.hotelCount > 0 && (
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  selectedCity === city.name ? "bg-white/20 text-white" : "bg-neutral-200/70 text-neutral-600"
                )}>
                  {city.hotelCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-black text-neutral-600">نطاق السعر للّيلة</label>
          <span className="text-xs font-black text-[#23096E]">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <div className="px-1 py-2">
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-[#23096E] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
          />
          <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 mt-1">
            <span>$0</span>
            <span>$500</span>
            <span>$1000+</span>
          </div>
        </div>
      </div>

      {/* Star Rating Filter */}
      <div>
        <label className="block text-xs font-black text-neutral-600 mb-2.5">تصنيف النجوم</label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const isChecked = selectedRatings.includes(rating);
            return (
              <label 
                key={rating} 
                className={cn(
                  "flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all",
                  isChecked 
                    ? "bg-[#23096E]/5 border-[#23096E]/30" 
                    : "bg-white border-neutral-100 hover:border-neutral-200"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isChecked ? "bg-[#23096E] border-[#23096E]" : "border-neutral-300 bg-white"
                  )}>
                    {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array(rating).fill(0).map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-neutral-500">
                  {rating} {rating === 1 ? 'نجمة' : rating === 2 ? 'نجمتان' : 'نجوم'}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Filter Sidebar ── */}
      <div className="hidden lg:block bg-white rounded-2xl p-5 shadow-sm border border-neutral-200/80 sticky top-24">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#23096E]" />
            <h3 className="text-sm font-black text-neutral-900">تصفية النتائج</h3>
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-[#FF3B30] hover:text-[#d32f2f] transition-colors"
            >
              <RotateCcw size={12} />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
        {filterContent}
      </div>

      {/* ── Mobile Sticky Floating Action Pill ── */}
      <div className="lg:hidden fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="pointer-events-auto flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#23096E] text-white font-black text-xs shadow-[0_10px_25px_-5px_rgba(35,9,110,0.45)] hover:bg-[#3A1C8F] active:scale-95 transition-all duration-200"
        >
          <Filter size={15} />
          <span>تصفية الفنادق</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#FF3B30] text-white text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile Bottom Sheet Drawer ── */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Container */}
          <div 
            className="relative z-10 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up"
            style={{ direction: 'rtl' }}
          >
            {/* Drawer Handle */}
            <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#23096E]" />
                <h3 className="text-sm font-black text-neutral-900">تصفية الفنادق</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1">
              {filterContent}
            </div>

            {/* Drawer Footer with Actions */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/80 flex items-center gap-3 shrink-0">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-white transition-colors"
                >
                  إعادة ضبط
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex-1 py-2.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-xl text-xs font-black shadow-md shadow-[#23096E]/20 transition-all text-center"
              >
                {typeof totalHotels === 'number' ? `عرض النتائج (${totalHotels} فندق)` : 'تطبيق الفلاتر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
