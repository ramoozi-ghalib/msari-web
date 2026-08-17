'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import HotelCard from '@/components/ui/HotelCard';
import Heading from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import type { Hotel } from '@/types';

interface FeaturedHotelsProps {
  hotels: Hotel[];
}

export default function FeaturedHotels({ hotels }: FeaturedHotelsProps) {
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'ar';
  const hotelsPageHref = `/${currentLocale}/hotels`;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft } = sliderRef.current;
    const scrollPos = Math.abs(scrollLeft);
    const cardWidth = 280 + 14; // Approximate card width + gap
    const index = Math.round(scrollPos / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), hotels.length - 1));
  };

  const scrollToHotel = (index: number) => {
    if (!sliderRef.current) return;
    const cardWidth = 280 + 14;
    const targetScroll = index * cardWidth;
    
    sliderRef.current.scrollTo({
      left: -targetScroll, // Negative for RTL
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-neutral-100/80 overflow-hidden w-full">
      <div className="container-msari">
        
        {/* ── Section Header: Title on Right, "عرض الكل" with Arrow on Left ── */}
        <div className="flex items-center justify-between mb-6 sm:mb-8" style={{ direction: 'rtl' }}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-1.5">
              <Sparkles size={12} className="text-[#FF3B30]" />
              <span>⭐ الأكثر طلباً</span>
            </div>
            <Heading level={2} variant="brand" className="mb-0.5 text-2xl sm:text-3xl font-black">
              فنادق مقترحة
            </Heading>
            <p className="text-[var(--text-secondary)] text-xs sm:text-base font-semibold">
              الأكثر طلباً والأعلى تقييماً في اليمن
            </p>
          </div>

          {/* "عرض الكل" link to local hotels */}
          <Link
            href={hotelsPageHref}
            className="group inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-[var(--brand-primary)]/30 sm:border-2 sm:border-[var(--brand-primary)] text-[var(--brand-primary)] bg-neutral-50 hover:bg-[var(--brand-primary)] hover:text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            <span>عرض الكل</span>
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* ── Responsive Track: Completely Hidden Native Scrollbar with Smooth Momentum Swiping ── */}
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex sm:grid overflow-x-auto sm:overflow-x-visible no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory gap-3.5 sm:gap-6 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 scroll-smooth overscroll-x-contain"
        >
          {hotels.map((hotel) => (
            <div 
              key={hotel.id} 
              className="w-[260px] min-[390px]:w-[280px] sm:w-auto flex-shrink-0 snap-start"
            >
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>

        {/* ── Centered Pagination Dots Indicator (Mobile View) ── */}
        {hotels.length > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-4">
            {hotels.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToHotel(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  i === activeIndex
                    ? 'w-6 bg-[var(--brand-primary)] shadow-md'
                    : 'w-2 bg-neutral-300 hover:bg-[var(--brand-primary)]/50'
                )}
                aria-label={`الذهاب للفندق ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
