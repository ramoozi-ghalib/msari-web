import { Suspense } from 'react';
import Link from 'next/link';
import HotelFilters from '@/components/hotels/HotelFilters';
import HotelCard from '@/components/ui/HotelCard';
import SortSelectClient from '@/components/hotels/SortSelectClient';
import HotelsPagination from '@/components/hotels/HotelsPagination';
import { getLocalHotels } from '@/actions/hotels';
import { getActiveCities } from '@/actions/cities';
import { SearchX } from 'lucide-react';

export const metadata = {
  title: 'فنادق يمنية - حجز جميع الفنادق في اليمن',
  description: 'اكتشف واحجز أفضل الفنادق في جميع المدن اليمنية (عدن، صنعاء، تعز، المكلا، إب، الحديدة) بأسعار حصرية وخيارات تناسب جميع الميزانيات.',
  alternates: {
    canonical: 'https://msari.net/ar/hotels',
    languages: {
      'ar': 'https://msari.net/ar/hotels',
      'en': 'https://msari.net/en/hotels',
      'x-default': 'https://msari.net/ar/hotels',
    },
  },
};

/**
 * [FIX C-2] صفحة الفنادق تمرر searchParams مباشرة إلى getLocalHotels.
 * كل الفلترة والترتيب والـ pagination يحدثان في Prisma (DB) لا في JavaScript.
 * السابق: getAll() ثم .filter() + .sort() على كل البيانات في الذاكرة.
 */
export default async function HotelsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.searchParams;

  // استخراج params وتحويلها للأنواع الصحيحة
  const selectedCity    = typeof params.city     === 'string' ? params.city          : undefined;
  const searchQuery     = typeof params.q        === 'string' ? params.q.trim()      : undefined;
  const minPrice        = typeof params.minPrice === 'string' ? Number(params.minPrice) : undefined;
  const maxPrice        = typeof params.maxPrice === 'string' ? Number(params.maxPrice) : undefined;
  const selectedRatings = typeof params.ratings  === 'string'
    ? params.ratings.split(',').map(Number).filter((n) => n >= 1 && n <= 5)
    : undefined;
  const sortBy          = typeof params.sort === 'string'
    ? params.sort as 'recommended' | 'price_asc' | 'price_desc' | 'rating'
    : 'recommended';
  const page            = typeof params.page === 'string' ? Math.max(1, Number(params.page)) : 1;
  const bookingError    = typeof params.bookingError === 'string' ? params.bookingError : '';

  // [FIX C-2] جلب البيانات المُفلترة من DB مباشرة — لا JavaScript filtering
  const [{ data: hotels, total, pageSize }, cities] = await Promise.all([
    getLocalHotels({
      city:     selectedCity,
      q:        searchQuery,
      minPrice: minPrice ?? 0,
      maxPrice: maxPrice ?? 5000,
      ratings:  selectedRatings,
      sort:     sortBy,
      page,
      pageSize: 12,
    }),
    getActiveCities(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-[#F4F2F8] min-h-screen pb-16">
      {/* Page Header with Single-Line Description Text in Msari Primary Brand Color (#23096E) */}
      <div className="bg-white border-b border-neutral-200/80 pt-28 pb-10 shadow-sm relative overflow-hidden">
        <div className="container-msari relative z-10">
          <h1 
            className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight animate-fade-in-up" 
            style={{ color: '#23096E' }}
          >
            فنادق يمنية
          </h1>
          <p 
            className="font-extrabold text-base sm:text-lg leading-relaxed whitespace-nowrap overflow-x-auto no-scrollbar max-w-full animate-fade-in-up delay-100" 
            style={{ color: '#23096E' }}
          >
            اكتشف أفضل الفنادق في جميع المدن اليمنية بأسعار حصرية وخيارات تناسب جميع الميزانيات.
          </p>
        </div>
      </div>

      <div className="container-msari mt-8">
        {bookingError && (
          <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium">
            {bookingError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="w-full lg:w-1/4 shrink-0">
            <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-2xl shadow-sm border border-neutral-100" />}>
              <HotelFilters cities={cities} />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-neutral-600">
                  تم العثور على <span className="font-extrabold text-[#23096E]">{total}</span> فندق
                </span>
                {(selectedCity || searchQuery) && (
                  <span className="text-xs text-neutral-500 ms-2">
                    ({[selectedCity, searchQuery && `بحث: "${searchQuery}"`].filter(Boolean).join(' - ')})
                  </span>
                )}
              </div>
              <SortSelectClient currentSort={sortBy} />
            </div>

            {/* Hotels Grid */}
            {hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-neutral-200/80 my-8">
                <SearchX size={48} className="mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-bold text-neutral-800 mb-2">لا توجد فنادق تطابق خيارات الفلترة</h3>
                <p className="text-neutral-500 text-sm max-w-md mx-auto mb-6">
                  جرب تغيير خيارات الفلترة أو البحث في مدينة أخرى للعثور على الفنادق المتاحة.
                </p>
                <Link
                  href="/hotels"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#23096E] text-white font-bold text-sm hover:bg-[#3A1C8F] transition-colors"
                >
                  إعادة ضبط الفلاتر
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <HotelsPagination currentPage={page} totalPages={totalPages} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
