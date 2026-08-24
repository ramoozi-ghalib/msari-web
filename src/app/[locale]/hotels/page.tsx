import { Suspense } from 'react';
import Link from 'next/link';
import HotelFilters from '@/components/hotels/HotelFilters';
import HotelCard from '@/components/ui/HotelCard';
import SortSelectClient from '@/components/hotels/SortSelectClient';
import HotelsPagination from '@/components/hotels/HotelsPagination';
import HotelsSearchBar from '@/components/hotels/HotelsSearchBar';
import { getLocalHotels } from '@/actions/hotels';
import { getActiveCities } from '@/actions/cities';
import { SearchX, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'فنادق اليمن - حجز جميع الفنادق في اليمن بأفضل سعر | مساري',
  description: 'اكتشف واحجز أفضل الفنادق في جميع المدن اليمنية (عدن، صنعاء، تعز، المكلا، إب، الحديدة) بأسعار حصرية وخيارات تناسب جميع الميزانيات.',
  alternates: {
    canonical: 'https://msari.net/ar/hotels',
    languages: {
      'ar': 'https://msari.net/ar/hotels',
      'en': 'https://msari.net/en/hotels',
      'x-default': 'https://msari.net/ar/hotels',
    },
  },
  openGraph: {
    title: 'فنادق اليمن - حجز جميع الفنادق في اليمن | مساري',
    description: 'اكتشف واحجز أفضل الفنادق في جميع المدن اليمنية بأسعار حصرية وخيارات تناسب جميع الميزانيات.',
    url: 'https://msari.net/ar/hotels',
  },
};

export default async function HotelsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.searchParams;

  // استخراج params وتحويلها للأنواع الصحيحة
  const selectedCity    = typeof params.city     === 'string' ? params.city          : undefined;
  const searchQuery     = typeof params.q        === 'string' ? params.q.trim()      : undefined;
  const sortBy          = typeof params.sort === 'string'
    ? params.sort as 'recommended' | 'price_asc' | 'price_desc'
    : 'recommended';
  const page            = typeof params.page === 'string' ? Math.max(1, Number(params.page)) : 1;
  const bookingError    = typeof params.bookingError === 'string' ? params.bookingError : '';

  // جلب البيانات من قاعدة البيانات مباشرة
  const [{ data: hotels, total, pageSize }, cities] = await Promise.all([
    getLocalHotels({
      city:     selectedCity,
      q:        searchQuery,
      sort:     sortBy,
      page,
      pageSize: 12,
    }),
    getActiveCities(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-[#F8F9FC] min-h-screen pb-20">
      
      {/* ── 1. Compact Sleek Mini-Hero ── */}
      <div className="relative bg-gradient-to-b from-[#100330] via-[#1A0654] to-[#23096E] text-white pt-24 sm:pt-28 pb-14 sm:pb-16 overflow-hidden">
        {/* Ambient background lighting texture */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-[#23096E]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container-msari relative z-10">
          {/* Breadcrumbs - Far Right in RTL */}
          <nav className="flex items-center justify-start gap-1.5 text-xs text-white/70 font-medium mb-3">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronLeft size={12} className="text-white/40" />
            <span className="text-white font-bold">فنادق اليمن</span>
            {selectedCity && (
              <>
                <ChevronLeft size={12} className="text-white/40" />
                <span className="text-[#FF3B30] font-bold">{selectedCity}</span>
              </>
            )}
          </nav>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            فنادق اليمن
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl">
            احجز فندقك المناسب بأفضل الأسعار
          </p>
        </div>
      </div>

      {/* ── 2. Search Bar Container ── */}
      <div className="container-msari -mt-20 md:-mt-8 relative z-30 mb-6 sm:mb-8 lg:mb-16">
        <HotelsSearchBar cities={cities} />
      </div>

      {/* ── 3. Main Body: Filters & Hotels Grid ── */}
      <div className="container-msari">
        {bookingError && (
          <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium">
            {bookingError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          
          {/* Right Sidebar: Filters */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0">
            <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-2xl shadow-sm border border-neutral-100" />}>
              <HotelFilters cities={cities} />
            </Suspense>
          </aside>

          {/* Left Main Content: Results & Grid */}
          <main className="flex-1 w-full min-w-0">
            
            {/* Top Bar: Sort Control Only (Left Aligned) */}
            <div className="flex items-center justify-end mb-4 sm:mb-5">
              <SortSelectClient currentSort={sortBy} />
            </div>

            {/* Hotels Grid */}
            {hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-neutral-200/80 my-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <SearchX size={32} />
                </div>
                <h3 className="text-base font-black text-neutral-800 mb-1.5">لا توجد فنادق تطابق خيارات البحث</h3>
                <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  جرب اختيار مدينة أخرى للعثور على الفنادق المتاحة.
                </p>
                <Link
                  href="/hotels"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#23096E] text-white font-bold text-xs hover:bg-[#3A1C8F] transition-colors shadow-sm"
                >
                  عرض جميع الفنادق
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <HotelsPagination currentPage={page} totalPages={totalPages} />
            )}
          </main>

        </div>
      </div>

    </div>
  );
}
