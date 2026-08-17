import Link from 'next/link';
import Image from 'next/image';
import { Building2, ArrowLeft, Compass, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

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
  const fallbackImages: Record<string, string> = {
    'عدن': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
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

  const cityHighlights: Record<string, string> = {
    'عدن': 'عروس البحر والشواطئ الفيروزية',
    'صنعاء': 'سحر التاريخ والبيوت البرجية',
    'المكلا': 'هدوء الساحل وخور المحضار',
    'إب': 'اللواء الأخضر والطبيعة الجبلية',
    'الحديدة': 'شاطئ الكورنيش وميناء البحر الأحمر',
  };

  const featuredCities = TARGET_CITIES.map((name, index) => {
    const dbCity = findDbCity(cities, name);
    const slug = citySlugs[name] || dbCity?.nameEn?.toLowerCase() || dbCity?.id || name;

    return {
      id: dbCity?.id || `mock-${index}`,
      name: name,
      slug: slug,
      highlight: cityHighlights[name] || 'وجهة سياحية مميزة',
      image: dbCity?.image || fallbackImages[name],
      hotelCount: dbCity?.hotelCount ?? (index === 0 ? 32 : index === 1 ? 45 : index === 2 ? 18 : index === 3 ? 14 : 12),
    };
  });

  const mainFeatured = featuredCities[0]; // عدن
  const secondaryCities = featuredCities.slice(1);

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-2 sm:mb-3">
              <Compass size={14} />
              <span>📍 استكشف اليمن</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--brand-primary)] tracking-tight mb-1">
              وجهات رائجة
            </h2>
            <p className="text-[var(--text-secondary)] text-xs sm:text-base font-semibold">
              اكتشف أجمل مدن اليمن واحجز فندقك المفضل
            </p>
          </div>

          <Link
            href="/hotels"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white font-black text-sm transition-all shrink-0"
          >
            <span>عرض الكل</span>
            <ArrowLeft size={16} />
          </Link>
        </div>

        {/* ── Modern Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Main Large Hero Card (عدن - 7 cols) */}
          <Link
            href={`/ar/destinations/${mainFeatured.slug}`}
            className="md:col-span-7 group relative rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[400px] block shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-neutral-900"
          >
            <Image
              src={mainFeatured.image}
              alt={mainFeatured.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            {/* Contrast Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            
            {/* Top Pill Badge */}
            <div className="absolute top-4 start-4 z-10">
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[var(--brand-primary)] text-xs font-black shadow-md inline-flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#FF3B30]" />
                <span>الوجهة الأكثر طلباً</span>
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-start text-white">
              <h3 className="font-black text-xl sm:text-3xl text-white leading-tight mb-1 group-hover:text-[#FF3B30] transition-colors">
                {mainFeatured.name}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm font-medium mb-2.5">
                {mainFeatured.highlight}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                <Building2 size={13} className="text-[#FF3B30]" />
                <span>{mainFeatured.hotelCount} فندق متاح للحجز</span>
              </div>
            </div>
          </Link>

          {/* Secondary 4-Card 2x2 Bento (5 cols) */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            {secondaryCities.map((city) => (
              <Link
                key={city.id}
                href={`/ar/destinations/${city.slug}`}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[145px] sm:min-h-[190px] block shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-neutral-900"
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Contrast Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Bottom Content */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-start text-white">
                  <h3 className="font-black text-sm sm:text-base text-white leading-tight mb-0.5 group-hover:text-[#FF3B30] transition-colors">
                    {city.name}
                  </h3>
                  <div className="flex items-center gap-1 text-white/80 text-[10px] sm:text-[11px] font-bold">
                    <Building2 size={11} className="text-[#FF3B30] shrink-0" />
                    <span>{city.hotelCount} فندق</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
