import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HotelCard from '@/components/ui/HotelCard';
import Heading from '@/components/ui/Heading';
import type { Hotel } from '@/types';

interface FeaturedHotelsProps {
  hotels: Hotel[];
}

export default function FeaturedHotels({ hotels }: FeaturedHotelsProps) {
  return (
    <section className="py-10 sm:py-14 bg-[#F4F2F8] surface-page">
      <div className="container-msari">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black mb-2">
              ⭐ الأكثر طلباً
            </div>
            <Heading level={2} variant="brand" className="mb-1 text-2xl sm:text-3xl font-black">
              فنادق مقترحة
            </Heading>
            <p className="text-[var(--text-secondary)] text-xs sm:text-base font-semibold">
              الأكثر طلباً والأعلى تقييماً في اليمن
            </p>
          </div>
          <Link
            href="/hotels"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white font-black text-sm transition-all"
          >
            عرض جميع الفنادق
            <ArrowLeft size={16} />
          </Link>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-6 sm:hidden">
          <Link
            href="/hotels"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-black text-xs shadow-md"
          >
            عرض جميع الفنادق
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
