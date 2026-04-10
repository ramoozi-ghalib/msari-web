import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

const CITY_COLORS = [
  'from-[--brand-primary-light] to-[--brand-primary-dark]',
  'from-[--brand-primary] to-neutral-900',
  'from-[--brand-accent] to-[--brand-primary-dark]',
  'from-[--neutral-600] to-[--neutral-800]',
  'from-[--brand-primary-dark] to-black',
  'from-[--brand-secondary] to-red-900',
];

const CITY_EMOJIS: Record<string, string> = {
  'صنعاء': '🕌',
  'عدن': '⚓',
  'مأرب': '🏛️',
  'المكلا': '🌊',
  'تعز': '⛰️',
  'الحديدة': '🐟',
};

interface CitiesSectionProps {
  cities: City[];
}

export default function CitiesSection({ cities }: CitiesSectionProps) {
  return (
    <section className="section-pad bg-white">
      <div className="container-msari">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="group">
            <div className="section-tag hover:scale-105 transition-transform duration-300">📍 استكشف اليمن</div>
            <h2 className="section-title group-hover:text-[--brand-primary] transition-colors duration-300">الوجهات الأكثر حجزاً</h2>
            <p className="section-subtitle group-hover:text-neutral-600 transition-colors duration-300">اكتشف أجمل مدن اليمن واحجز فندقك المفضل</p>
          </div>
          <Link href="/hotels" className="btn btn-outline btn-sm hidden sm:flex items-center gap-1 hover:shadow-lg transition-shadow duration-300">
            عرض الكل
            <ArrowLeft size={15} />
          </Link>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city, i) => (
            <Link
              key={city.id}
              href={`/hotels?city=${city.name}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] block shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {city.image && city.image.startsWith('http') ? (
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              ) : (
                <div className={cn('absolute inset-0 bg-gradient-to-b', CITY_COLORS[i % CITY_COLORS.length])} />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-3 text-center">
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{CITY_EMOJIS[city.name] || '🏙️'}</span>
                <h3 className="text-white font-bold text-base leading-tight group-hover:text-white/90 transition-colors duration-300">{city.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Building2 size={11} className="text-white/70 group-hover:text-white/80 transition-colors duration-300" />
                  <span className="text-white/70 text-xs group-hover:text-white/80 transition-colors duration-300">{city.hotelCount} فندق</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
