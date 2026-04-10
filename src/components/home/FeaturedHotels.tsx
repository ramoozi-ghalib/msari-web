import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HotelCard from '@/components/ui/HotelCard';
import type { Hotel } from '@/types';

interface FeaturedHotelsProps {
  hotels: Hotel[];
}

export default function FeaturedHotels({ hotels }: FeaturedHotelsProps) {
  return (
    <section className="section-pad bg-[--neutral-50]">
      <div className="container-msari">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="group">
            <div className="section-tag hover:scale-105 transition-transform duration-300">⭐ الأكثر طلباً</div>
            <h2 className="section-title group-hover:text-[--brand-primary] transition-colors duration-300">فنادق مميزة</h2>
            <p className="section-subtitle group-hover:text-neutral-600 transition-colors duration-300">الأكثر طلباً والأعلى تقييماً</p>
          </div>
          <Link href="/hotels" className="btn btn-outline btn-sm hidden sm:flex items-center gap-1 hover:shadow-lg transition-shadow duration-300">
            عرض جميع الفنادق
            <ArrowLeft size={15} />
          </Link>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 sm:hidden">
          <Link href="/hotels" className="btn btn-primary btn-lg hover:shadow-xl transition-shadow duration-300">
            عرض جميع الفنادق
          </Link>
        </div>
      </div>
    </section>
  );
}
