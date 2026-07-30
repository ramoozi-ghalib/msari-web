'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

interface HotelFiltersProps {
  cities: City[];
}

export default function HotelFilters({ cities }: HotelFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Local state for debouncing and immediate UI updates
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 5000
  ]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>(
    searchParams.get('ratings')?.split(',').map(Number).filter(Boolean) || []
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      
      if (searchQuery) params.set('q', searchQuery); else params.delete('q');
      if (selectedCity) params.set('city', selectedCity); else params.delete('city');
      
      // Only set price if changed from default wide range
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString()); else params.delete('minPrice');
      if (priceRange[1] < 5000) params.set('maxPrice', priceRange[1].toString()); else params.delete('maxPrice');
      
      if (selectedRatings.length > 0) params.set('ratings', selectedRatings.join(',')); else params.delete('ratings');
      
      router.push(`?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCity, priceRange, selectedRatings, router, searchParams]);

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full lg:hidden flex items-center justify-center gap-2 btn btn-outline mb-4 bg-white"
      >
        <Filter size={18} />
        {isMobileOpen ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
      </button>

      <div className={cn(
        "bg-white rounded-2xl shadow-sm border border-[--neutral-100] p-6 sticky top-24",
        !isMobileOpen && "hidden lg:block"
      )}>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Filter size={20} className="text-[--brand-primary]" />
          تصفية النتائج
        </h3>

        {/* Text Search */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-neutral-700 mb-2">بحث بالاسم</label>
          <div className="relative">
            <input
              type="text"
              placeholder="اسم الفندق..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-msari ps-10"
            />
            <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>

        {/* City Filter */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-neutral-700 mb-2">المدينة / الواجهة</label>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCity('')}
              className={cn(
                "w-full text-start px-3 py-2 rounded-lg text-sm transition-colors",
                selectedCity === '' ? "bg-[--brand-primary]/10 text-[--brand-primary] font-bold" : "hover:bg-neutral-50 text-neutral-600"
              )}
            >
              جميع المدن
            </button>
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.name)}
                className={cn(
                  "w-full text-start px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                  selectedCity === city.name ? "bg-[--brand-primary]/10 text-[--brand-primary] font-bold" : "hover:bg-neutral-50 text-neutral-600"
                )}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={selectedCity === city.name ? "text-[--brand-primary]" : "text-neutral-400"} />
                  {city.name}
                </div>
                <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500">
                  {city.hotelCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-neutral-700 mb-2">نطاق السعر (بالدولار)</label>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                className="input-msari p-2 text-center text-sm"
                min={0}
              />
            </div>
            <span className="text-neutral-400">-</span>
            <div className="flex-1">
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                className="input-msari p-2 text-center text-sm"
                min={10}
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-3">تصنيف النجوم</label>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => toggleRating(rating)}
                  />
                  <div className="w-5 h-5 border-2 border-neutral-300 rounded peer-checked:bg-[--brand-primary] peer-checked:border-[--brand-primary] transition-colors flex items-center justify-center">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
