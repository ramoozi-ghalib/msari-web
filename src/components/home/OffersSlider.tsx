'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types';

const OFFER_GRADIENTS = [
  'from-[#120336] via-[#23096E] to-[#3A1C8F]',
  'from-[#160549] via-[#23096E] to-[#FF3B30]/80',
  'from-[#23096E] via-[#3A1C8F] to-[#120336]',
];

interface OffersSliderProps {
  offers: Offer[];
}

export default function OffersSlider({ offers = [] }: OffersSliderProps) {
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
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Touch gesture support for mobile swiping
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [count, isHovered, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    // In RTL, positive distance moves to next
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!offers || offers.length === 0) return null;

  return (
    <section className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-white overflow-hidden w-full">
      <div className="container-msari">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 pb-2.5 border-b border-neutral-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] text-xs font-black mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>🔥 أحدث العروض والخصومات</span>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--brand-primary)]">
              العروض الحصرية
            </h2>
          </div>

          {/* Arrow Navigation Controls — Desktop */}
          {count > 1 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-full bg-white text-[var(--brand-primary)] flex items-center justify-center border border-neutral-200 shadow-sm hover:bg-[var(--brand-primary)] hover:text-white transition-all active:scale-95"
                aria-label="العرض السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-full bg-white text-[var(--brand-primary)] flex items-center justify-center border border-neutral-200 shadow-sm hover:bg-[var(--brand-primary)] hover:text-white transition-all active:scale-95"
                aria-label="العرض التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Smooth Responsive Carousel Track ── */}
        <div
          className="relative w-full overflow-hidden py-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            onTransitionEnd={handleTransitionEnd}
            className={cn(
              'flex gap-4 sm:gap-6 dir-rtl',
              isTransitioning ? 'transition-transform duration-700 ease-out' : 'transition-none'
            )}
            style={{
              transform: isMobile
                ? `translateX(calc(${currentIndex} * (100% + 16px)))`
                : `translateX(calc(${currentIndex} * (50% + 12px)))`,
            }}
          >
            {extendedOffers.map((offer, idx) => (
              <div
                key={`${offer.id || idx}-${idx}`}
                className="w-full md:w-[calc(50%-12px)] flex-shrink-0 relative"
              >
                <Link
                  href={offer.link || '/hotels'}
                  className="group block relative rounded-3xl overflow-hidden shadow-md border border-neutral-200/80 aspect-[16/9] sm:aspect-[2.1/1] p-5 sm:p-7 bg-neutral-950 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Banner Image */}
                  {offer.image ? (
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      loading="lazy"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        OFFER_GRADIENTS[idx % OFFER_GRADIENTS.length]
                      )}
                    />
                  )}

                  {/* Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 sm:bottom-5 start-4 sm:start-5 end-4 sm:end-5 z-20 text-white">
                    <h3 className="text-sm sm:text-lg font-black leading-snug drop-shadow-md line-clamp-1 group-hover:text-[var(--brand-accent)] transition-colors">
                      {offer.title}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {count > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-5 sm:mt-6">
              {offers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentIndex(i + 2);
                  }}
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    i === realIndex
                      ? 'w-6 bg-[var(--brand-primary)] shadow-md'
                      : 'w-2 bg-neutral-300 hover:bg-[var(--brand-primary)]/50'
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
