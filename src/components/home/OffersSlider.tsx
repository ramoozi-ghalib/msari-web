'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types';

// Demo offer colors since we don't have real images
const OFFER_GRADIENTS = [
  'from-[--brand-primary] via-[--brand-accent] to-[--brand-primary-dark]',
  'from-[--brand-error] via-red-600 to-red-800',
  'from-[--brand-primary-dark] via-[--neutral-700] to-[--neutral-900]',
];

interface OffersSliderProps {
  offers: Offer[];
}

export default function OffersSlider({ offers }: OffersSliderProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % offers.length), [offers.length]);
  const prev = () => setCurrent((c) => (c - 1 + offers.length) % offers.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (!offers.length) return null;

  return (
    <section className="section-pad bg-[--neutral-50]">
      <div className="container-msari">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="group">
            <div className="section-tag hover:scale-105 transition-transform duration-300">🔥 أحدث العروض</div>
            <h2 className="section-title group-hover:text-[--brand-primary] transition-colors duration-300">عروض وخصومات حصرية</h2>
          </div>
          <Link href="/offers" className="btn btn-outline btn-sm hidden sm:flex hover:shadow-lg transition-shadow duration-300">
            عرض الكل
          </Link>
        </div>

        {/* Slider */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500" style={{ height: '320px' }}>
          {offers.map((offer, i) => (
            <Link
              key={offer.id}
              href={offer.link}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 group',
                i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              )}
            >
              <div className={cn('w-full h-full relative overflow-hidden flex items-end p-8')}>
                {offer.image ? (
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority={i === 0}
                  />
                ) : (
                  <div className={cn('absolute inset-0 bg-gradient-to-br', OFFER_GRADIENTS[i % OFFER_GRADIENTS.length])} />
                )}
                <div className="bg-black/40 absolute inset-0 transition-opacity duration-300 group-hover:bg-black/30" />
                <div className="relative z-10 text-white">
                  <h3 className="text-2xl font-black mb-2 group-hover:text-white/90 transition-colors duration-300">{offer.title}</h3>
                  <span className="btn btn-secondary btn-sm text-sm hover:shadow-lg transition-shadow duration-300">
                    احجز الآن واستفد من العرض
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Navigation */}
          <button
            onClick={prev}
            className="absolute start-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={next}
            className="absolute end-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'rounded-full transition-all duration-300 hover:scale-125',
                  i === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
