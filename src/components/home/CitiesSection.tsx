import Link from 'next/link';
import Image from 'next/image';
import { Building2, ArrowLeft, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

const CITY_COLORS = [
  'from-[#23096E] to-[#3A1C8F]',
  'from-[#160549] to-[#23096E]',
  'from-[#3A1C8F] to-[#23096E]',
  'from-[#23096E] to-[#0A0912]',
];

const TARGET_CITIES = ['عدن', 'صنعاء', 'المكلا', 'إب', 'الحديدة'];

function findDbCity(cities: City[], name: string): City | undefined {
  const norm = (s: string) => s.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').trim().toLowerCase();
  const targetNorm = norm(name);
  
  return cities.find(c => {
    const cName = c.name ? norm(c.name) : '';
    const cNameEn = c.nameEn ? c.nameEn.toLowerCase() : '';
    
    if (cName.includes(targetNorm)) return true;
    
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
  const featuredCities = TARGET_CITIES.map((name, index) => {
    const dbCity = findDbCity(cities, name);
    
    const fallbackImages: Record<string, string> = {
      'عدن': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop',
      'صنعاء': 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop',
      'المكلا': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      'إب': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
      'الحديدة': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
    };

    const citySlugs: Record<string, string> = {
      'عدن': 'aden',
      'صنعاء': 'sanaa',
      'المكلا': 'mukalla',
      'إب': 'ibb',
      'الحديدة': 'hodeidah',
    };

    const slug = citySlugs[name] || dbCity?.nameEn?.toLowerCase() || dbCity?.id || name;

    return {
      id: dbCity?.id || `mock-${index}`,
      name: name,
      slug: slug,
      image: dbCity?.image || fallbackImages[name],
      hotelCount: dbCity?.hotelCount ?? (index === 0 ? 32 : index === 1 ? 45 : 18),
    };
  });

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-3">
              <Compass size={14} />
              <span>استكشف مدن اليمن</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
              أشهر الوجهات السياحية في اليمن
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base font-semibold mt-2">
              اكتشف جمال المدن اليمنية وتعرف على الفنادق والمنتجعات المتاحة فيها
            </p>
          </div>

          <Link
            href="/hotels"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white font-black text-sm transition-all shrink-0"
          >
            <span>استعراض كافة الوجهات</span>
            <ArrowLeft size={16} />
          </Link>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {featuredCities.map((city, i) => (
            <Link
              key={city.id}
              href={`/ar/destinations/${city.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] block shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-neutral-900"
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

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                <h3 className="text-white font-black text-lg sm:text-xl leading-tight mb-1 group-hover:text-amber-300 transition-colors">
                  {city.name}
                </h3>
                <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                  <Building2 size={13} className="shrink-0 text-amber-400" />
                  <span>{city.hotelCount} فندق متاح</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
