import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Hotel, Compass, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';
import { getActiveCities } from '@/actions/cities';
import { getLocalizedAlternates, generateBreadcrumbSchema } from '@/lib/seo';
import { safeJsonLd } from '@/lib/sanitize';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Destinations & Tourism Guides in Yemen | Msari'
    : 'الوجهات السياحية في اليمن — دليلك لأفضل المدن والفنادق | مساري';

  const description = isEn
    ? 'Explore top destinations across Yemen (Aden, Sanaa, Socotra, Mukalla, Taiz, Ibb). Tourist attractions, travel guides, and verified hotel booking.'
    : 'استكشف أجمل الوجهات والمعالم السياحية في اليمن (عدن، صنعاء، سقطرى، المكلا، تعز، إب). أدلة شاملة، أهم المعالم، وأفضل الفنادق المتاحة للحجز الفوري مع مساري.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/destinations', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/destinations`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function DestinationsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const isEn = locale === 'en';
  const currentLocale = locale || 'ar';
  const cities = await getActiveCities({ limit: 50 });

  const breadcrumbs = isEn
    ? [
        { name: 'Home', url: '/en' },
        { name: 'Destinations', url: '/en/destinations' },
      ]
    : [
        { name: 'الرئيسية', url: '/ar' },
        { name: 'الوجهات السياحية', url: '/ar/destinations' },
      ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      {/* ─── Hero Header ─── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 bg-gradient-to-br from-[#120336] via-[#1E085A] to-[#3A1C8F] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm font-bold mb-6 border border-white/15 backdrop-blur-md">
            <Compass size={14} className="text-amber-300" />
            <span>{isEn ? 'Yemen Travel & Tourism Directory' : 'دليل السياحة والوجهات في اليمن'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            {isEn ? 'Tourist Destinations in Yemen' : 'الوجهات السياحية وأدلة المدن في اليمن'}
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? 'Discover historic cities, coastal resorts, and natural wonders across Yemen with comprehensive travel guides and instant hotel reservations.'
              : 'اكتشف المدن التاريخية، المنتجعات الساحلية، والوجهات الطبيعية الساحرة عبر اليمن مع أدلة سياحية متكاملة وحجوزات فندقية مؤكدة.'}
          </p>
        </div>
      </section>

      {/* ─── Destinations Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => {
            const cityName = isEn ? (city.nameEn || city.name) : city.name;
            const citySlug = (city.id || city.nameEn || city.name).toLowerCase().trim().replace(/\s+/g, '-');
            const cityImage = city.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800';

            return (
              <div
                key={city.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200/70 flex flex-col justify-between"
              >
                <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={cityImage}
                    alt={`${cityName} - ${isEn ? 'Hotels & Tourism' : 'فنادق ومعالم'}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-4 start-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-800 flex items-center gap-1.5 shadow-sm">
                    <Hotel size={13} className="text-[#3A1C8F]" />
                    <span>{city.hotelCount} {isEn ? 'Hotels' : 'فندق متاح'}</span>
                  </div>

                  <div className="absolute bottom-4 start-4 end-4">
                    <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      <MapPin size={18} className="text-amber-400" />
                      <span>{cityName}</span>
                    </h2>
                    <p className="text-white/80 text-xs line-clamp-1">
                      {isEn ? `Explore hotels and attractions in ${cityName}` : `استكشف أفضل الفنادق والمعالم في ${cityName}`}
                    </p>
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between gap-3 bg-white">
                  <Link
                    href={`/${currentLocale}/destinations/${citySlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A1C8F] hover:text-[#23096e] transition-colors"
                  >
                    <span>{isEn ? 'View Travel Guide' : 'الدليل السياحي'}</span>
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </Link>

                  <Link
                    href={`/${currentLocale}/hotels?city=${encodeURIComponent(city.name)}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-[#3A1C8F] text-neutral-700 hover:text-white text-xs font-bold transition-all"
                  >
                    <Hotel size={13} />
                    <span>{isEn ? 'Book Hotels' : 'حجز الفنادق'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
