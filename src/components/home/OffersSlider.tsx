'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Sparkles, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types';

const OFFER_GRADIENTS = [
  'from-indigo-900 via-purple-900 to-slate-900',
  'from-blue-900 via-indigo-900 to-slate-900',
  'from-red-900 via-rose-900 to-slate-900',
];

interface OffersSliderProps {
  offers: Offer[];
}

export default function OffersSlider({ offers }: OffersSliderProps) {
  if (!offers || offers.length === 0) return null;

  const count = offers.length;

  // Build cloned array for smooth infinite loop: [last2, ...offers, first2]
  const extendedOffers =
    count > 1
      ? [
          offers[(count - 2 + count) % count],
          offers[(count - 1 + count) % count],
          ...offers,
          offers[0],
          offers[1 % count],
        ]
      : offers;

  // Track state: index 2 corresponds to the real first offer (offers[0])
  const [currentIndex, setCurrentIndex] = useState(count > 1 ? 2 : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Real active index for pagination dots (0 to count - 1)
  const realIndex = count > 1 ? (currentIndex - 2 + count) % count : 0;

  const nextSlide = useCallback(() => {
    if (count <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [count]);

  const prevSlide = useCallback(() => {
    if (count <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [count]);

  // Teleport jump reset when hitting clone boundaries
  const handleTransitionEnd = () => {
    if (count <= 1) return;

    if (currentIndex >= extendedOffers.length - 2) {
      setIsTransitioning(false);
      setCurrentIndex(2);
    } else if (currentIndex <= 1) {
      setIsTransitioning(false);
      setCurrentIndex(count + 1);
    }
  };

  // Smooth Autoplay
  useEffect(() => {
    if (count <= 1 || isHovered) return;

    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [nextSlide, count, isHovered]);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container-msari">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-extrabold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>🔥 أحدث العروض والخصومات</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#23096E]">
              العروض الحصرية
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Arrow Navigation Controls */}
            {count > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-white text-[#23096E] flex items-center justify-center border border-slate-200 shadow-md hover:bg-[#23096E] hover:text-white transition-all active:scale-95"
                  aria-label="العرض السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-white text-[#23096E] flex items-center justify-center border border-slate-200 shadow-md hover:bg-[#23096E] hover:text-white transition-all active:scale-95"
                  aria-label="العرض التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}

            <Link
              href="/hotels"
              className="inline-flex items-center gap-1 text-sm font-black text-[#23096E] hover:text-[#FF3B30] transition-colors ps-2"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Smooth Infinite Dual-Card Carousel Track ── */}
        <div
          className="relative w-full overflow-hidden py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            onTransitionEnd={handleTransitionEnd}
            className={cn(
              'flex gap-6 dir-rtl',
              isTransitioning ? 'transition-transform duration-700 ease-out' : 'transition-none'
            )}
            style={{
              transform: `translateX(calc(${currentIndex} * (50% + 12px)))`,
            }}
          >
            {extendedOffers.map((offer, idx) => (
              <div
                key={`${offer.id || idx}-${idx}`}
                className="w-full md:w-[calc(50%-12px)] flex-shrink-0 relative"
              >
                {/* Responsive Aspect Ratio Card */}
                <div className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 aspect-[16/9] sm:aspect-[2.1/1] flex flex-col justify-end p-5 sm:p-7 bg-slate-950 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  
                  {/* Full Edge-to-Edge Banner Image */}
                  {offer.image ? (
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={idx === 2 || idx === 3}
                    />
                  ) : (
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        OFFER_GRADIENTS[idx % OFFER_GRADIENTS.length]
                      )}
                    />
                  )}

                  {/* Gentle Contrast Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10" />

                  {/* Badge */}
                  <div className="absolute top-4 start-4 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-black shadow-lg">
                      <Tag className="w-3.5 h-3.5" />
                      <span>عرض خاص</span>
                    </span>
                  </div>

                  {/* Content Overlay — Title on Right, Button aligned to Left */}
                  <div className="relative z-20 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black leading-snug drop-shadow-md line-clamp-1">
                        {offer.title}
                      </h3>
                    </div>

                    <Link
                      href={offer.link || '/hotels'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black text-xs transition-all shadow-md group-hover:scale-105 shrink-0 me-auto sm:me-0"
                    >
                      <span>احجز الآن واستفد من العرض</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator Bar */}
          {count > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {offers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentIndex(i + 2);
                  }}
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-500',
                    i === realIndex
                      ? 'w-8 bg-[#23096E] shadow-md'
                      : 'w-2.5 bg-slate-300 hover:bg-[#23096E]/50'
                  )}
                  aria-label={`الذهاب للعرض ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
