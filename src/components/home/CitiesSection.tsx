import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

const CITY_COLORS = [
  'from-[#23096E] to-[#3A1C8F]',
  'from-[#160549] to-[#23096E]',
  'from-[#3A1C8F] to-[#23096E]',
  'from-[#23096E] to-[#0A0912]',
];

const TARGET_CITIES = ['عدن', 'صنعاء', 'الحديدة', 'إب', 'المكلا'];

function findDbCity(cities: City[], name: string): City | undefined {
  const norm = (s: string) => s.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').trim().toLowerCase();
  const targetNorm = norm(name);
  
  return cities.find(c => {
    const cName = c.name ? norm(c.name) : '';
    const cNameEn = c.nameEn ? c.nameEn.toLowerCase() : '';
    
    if (cName.includes(targetNorm)) return true;
    
    // English names
    if (name === 'عدن' && cNameEn.includes('aden')) return true;
    if (name === 'صنعاء' && (cNameEn.includes('sanaa') || cNameEn.includes("sana'a") || cName.includes('عاصمه'))) return true;
    if (name === 'الحديدة' && (cNameEn.includes('hodeidah') || cNameEn.includes('hudaydah'))) return true;
    if (name === 'إب' && cNameEn.includes('ibb')) return true;
    if (name === 'المكلا' && cNameEn.includes('mukalla')) return true;
    
    return false;
  });
}

interface CitiesSectionProps {
  cities: City[];
}

export default function CitiesSection({ cities }: CitiesSectionProps) {
  // Map standard cities into featured list with full safety matches and high-res fallbacks
  const featuredCities = TARGET_CITIES.map((name, index) => {
    const dbCity = findDbCity(cities, name);
    
    const fallbackImages: Record<string, string> = {
      'عدن': 'https://images.unsplash.com/photo-1562137569-808b26e03399?q=80&w=600&auto=format&fit=crop',
      'صنعاء': 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop',
      'الحديدة': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
      'إب': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop',
      'المكلا': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    };

    const citySlugs: Record<string, string> = {
      'عدن': 'aden',
      'صنعاء': 'sanaa',
      'الحديدة': 'hodeidah',
      'إب': 'ibb',
      'المكلا': 'mukalla',
    };

    const slug = citySlugs[name] || dbCity?.nameEn?.toLowerCase() || dbCity?.id || name;

    return {
      id: dbCity?.id || `mock-${index}`,
      name: name,
      slug: slug,
      image: dbCity?.image || fallbackImages[name],
      hotelCount: dbCity?.hotelCount ?? 0,
    };
  });

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container-msari">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs font-black mb-2">
              📍 استكشف اليمن
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#23096E] mb-1">
              وجهات رائجة
            </h2>
            <p className="text-[#423861] text-sm sm:text-base font-semibold">
              اكتشف أجمل مدن اليمن واحجز فندقك المفضل
            </p>
          </div>
          <Link
            href="/hotels"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#23096E] text-[#23096E] hover:bg-[#23096E] hover:text-white font-black text-sm transition-all"
          >
            عرض الكل
            <ArrowLeft size={16} />
          </Link>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {featuredCities.map((city, i) => (
            <Link
              key={city.id}
              href={`/ar/destinations/${city.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] block shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {city.image && (city.image.startsWith('http') || city.image.startsWith('/')) ? (
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <div className={cn('absolute inset-0 bg-gradient-to-b', CITY_COLORS[i % CITY_COLORS.length])} />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-3 text-center">
                <h3 className="!text-white font-bold text-base leading-tight group-hover:text-white/90 transition-colors duration-300">{city.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-white/70 text-xs group-hover:text-white/80 transition-colors duration-300">
                  <Building2 size={12} className="shrink-0" />
                  <span>{city.hotelCount} {city.hotelCount === 1 ? 'فندق' : 'فنادق'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
