import Link from 'next/link';
import { ArrowLeft, Sparkles, Hotel as HotelIcon } from 'lucide-react';
import HotelCard from '@/components/ui/HotelCard';
import type { Hotel } from '@/types';

interface FeaturedHotelsProps {
  hotels: Hotel[];
}

export default function FeaturedHotels({ hotels }: FeaturedHotelsProps) {
  return (
    <section className="py-20 sm:py-28 bg-[#fafafc] border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-3">
              <Sparkles size={14} />
              <span>فنادق معتمدة وحصرية</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
              أفضل الفنادق وأماكن الإقامة المقترحة
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base font-semibold mt-2">
              استكشف خيارات الإقامة الأعلى طلباً في المدن اليمنية مع تأكيد حجز فوري ومضمون
            </p>
          </div>

          <Link
            href="/hotels"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white font-black text-sm transition-all shrink-0"
          >
            <span>استعراض كافة الفنادق</span>
            <ArrowLeft size={16} />
          </Link>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        {/* Mobile View All CTA */}
        <div className="text-center mt-10 sm:hidden">
          <Link
            href="/hotels"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] text-white font-bold text-sm shadow-md"
          >
            <span>استعراض كافة الفنادق في اليمن</span>
            <ArrowLeft size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
