import { Suspense } from 'react';
import Link from 'next/link';
import HotelFilters from '@/components/hotels/HotelFilters';
import HotelCard from '@/components/ui/HotelCard';
import SortSelectClient from '@/components/hotels/SortSelectClient';
import { getLocalHotels } from '@/actions/hotels';
import { getActiveCities } from '@/actions/cities';
import { SearchX } from 'lucide-react';

export const metadata = {
  title: 'فنادق يمنية | مساري',
  description: 'اكتشف أفضل الفنادق في جميع المدن اليمنية بأسعار حصرية وخيارات تناسب جميع الميزانيات.',
};

export default async function HotelsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [params, hotels, cities] = await Promise.all([
    props.searchParams,
    getLocalHotels(),
    getActiveCities(),
  ]);
  
  const selectedCity = typeof params.city === 'string' ? params.city : '';
  const searchQuery = typeof params.q === 'string' ? params.q.toLowerCase() : '';
  const minPrice = typeof params.minPrice === 'string' ? Number(params.minPrice) : 0;
  const maxPrice = typeof params.maxPrice === 'string' ? Number(params.maxPrice) : 5000;
  const selectedRatings = typeof params.ratings === 'string' 
    ? params.ratings.split(',').map(Number).filter(Boolean) 
    : [];
  const sortBy = typeof params.sort === 'string' ? params.sort : 'recommended';

  // Server-side filtering logic
  let filteredHotels = [...hotels];

  if (selectedCity) {
    filteredHotels = filteredHotels.filter(h => h.city === selectedCity);
  }

  if (searchQuery.trim()) {
    filteredHotels = filteredHotels.filter(h => 
      (h.name && h.name.toLowerCase().includes(searchQuery)) || 
      (h.nameEn && h.nameEn.toLowerCase().includes(searchQuery))
    );
  }

  filteredHotels = filteredHotels.filter(h => h.priceFrom >= minPrice && h.priceFrom <= maxPrice);

  if (selectedRatings.length > 0) {
    filteredHotels = filteredHotels.filter(h => selectedRatings.includes(h.stars));
  }

  // Server-side sorting
  switch (sortBy) {
    case 'price_asc':
      filteredHotels.sort((a, b) => a.priceFrom - b.priceFrom);
      break;
    case 'price_desc':
      filteredHotels.sort((a, b) => b.priceFrom - a.priceFrom);
      break;
    case 'rating':
      filteredHotels.sort((a, b) => b.rating - a.rating);
      break;
    default: // recommended
      filteredHotels.sort((a, b) => (b.isFeatured ? -1 : 1));
      break;
  }

  return (
    <div className="bg-[--neutral-50] min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-[--brand-primary] text-white pt-28 pb-12 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        </div>
        <div className="container-msari relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4 animate-fade-in-up">فنادق يمنية</h1>
          <p className="text-white/80 max-w-2xl text-lg animate-fade-in-up delay-100">
            اكتشف أفضل الفنادق في جميع المدن اليمنية بأسعار حصرية وخيارات تناسب جميع الميزانيات.
          </p>
        </div>
      </div>

      <div className="container-msari mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="w-full lg:w-1/4 shrink-0">
            <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-2xl shadow-sm border border-neutral-100" />}>
              <HotelFilters cities={cities} />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[--neutral-100] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-bold text-neutral-900">{filteredHotels.length}</span> فنادق متاحة
                {selectedCity && <span> في <span className="font-bold text-[--brand-primary]">{selectedCity}</span></span>}
              </div>

              {/* Client Component for Select Sort */}
              <Suspense>
                 <SortSelectClient currentSort={sortBy} />
              </Suspense>
            </div>

            {/* Results Grid */}
            {filteredHotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredHotels.map((hotel, index) => (
                  <div key={hotel.id} className="animate-fade-in-up" style={{ animationDelay: `${(index % 6) * 100}ms` }}>
                    <HotelCard hotel={hotel} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-[--neutral-100] mt-8">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
                  <SearchX size={32} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">لا توجد نتائج بحث تطابق الفلاتر</h3>
                <p className="text-neutral-500 mb-6">حاول تغيير خيارات البحث أو إزالة بعض الفلاتر لرؤية المزيد من النتائج.</p>
                <Link 
                  href="/hotels" 
                  className="btn btn-outline inline-block"
                >
                  إعادة ضبط الفلاتر
                </Link>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
