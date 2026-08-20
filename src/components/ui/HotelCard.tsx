'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useParams } from 'next/navigation';
import { 
  MapPin, Wifi, Coffee, Car, Waves, Heart, Shield, Tv, Dumbbell, Bell, Check,
  ShoppingCart, Shirt, ArrowUpDown, Presentation, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Hotel } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

/**
 * Maps an amenity's iconKey + name to a Lucide icon.
 */
function getAmenityIcon(iconKey?: string, name?: any) {
  const key = (typeof iconKey === 'string' ? iconKey : '').toLowerCase();
  const label = (typeof name === 'string' ? name : (typeof name === 'object' && name !== null ? (name.ar || name.en || '') : '')).toLowerCase();
  const t = `${key} ${label}`;

  if (t.includes('wifi') || t.includes('internet') || t.includes('إنترنت') || t.includes('انترنت') || t.includes('واي')) {
    return <Wifi size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('park') || t.includes('car') || t.includes('موقف') || t.includes('سيار') || t.includes('مركب')) {
    return <Car size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('room_service') || t.includes('room service') || t.includes('bell') || t.includes('خدمة الغرف') || t.includes('خدمة غرف') || t.includes('غرفة')) {
    return <Bell size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('pool') || t.includes('swim') || t.includes('wave') || t.includes('مسبح') || t.includes('سباحة')) {
    return <Waves size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('restaur') || t.includes('food') || t.includes('utensil') || t.includes('مطعم') || t.includes('طعام') || t.includes('أكل')) {
    return <Coffee size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('grocery') || t.includes('shop') || t.includes('بقالة') || t.includes('سوبرماركت') || t.includes('محل')) {
    return <ShoppingCart size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('laundry') || t.includes('wash') || t.includes('shirt') || t.includes('مغسلة') || t.includes('كوي') || t.includes('تنظيف')) {
    return <Shirt size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('elevator') || t.includes('lift') || t.includes('مصعد')) {
    return <ArrowUpDown size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('meeting') || t.includes('conference') || t.includes('presentation') || t.includes('قاعة') || t.includes('قاعات') || t.includes('تدريب')) {
    return <Presentation size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('majlis') || t.includes('terrace') || t.includes('rooftop') || t.includes('طيرمانات') || t.includes('طيرمانة') || t.includes('مجلس')) {
    return <Home size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('location') || t.includes('center') || t.includes('وسط المدينة') || t.includes('موقع') || t.includes('خريطة')) {
    return <MapPin size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('cafe') || t.includes('coffee') || t.includes('كافيه') || t.includes('مقهى') || t.includes('شاي') || t.includes('cafeteria') || t.includes('كافتيريا')) {
    return <Coffee size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('secur') || t.includes('guard') || t.includes('shield') || t.includes('أمان') || t.includes('حراسة') || t.includes('حماية')) {
    return <Shield size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('tv') || t.includes('television') || t.includes('تلفاز') || t.includes('تلفزيون') || t.includes('شاشة')) {
    return <Tv size={12} className="text-[#23096E] shrink-0" />;
  }
  if (t.includes('gym') || t.includes('fitness') || t.includes('sport') || t.includes('جيم') || t.includes('رياضة') || t.includes('لياقة') || t.includes('dumbbell')) {
    return <Dumbbell size={12} className="text-[#23096E] shrink-0" />;
  }

  return <Check size={11} className="text-[#23096E] shrink-0" />;
}

export default function HotelCard({ hotel, className }: HotelCardProps) {
  const searchParams = useSearchParams();
  const { locale } = useParams();
  const currentLocale = locale || 'ar';
  const { formatPrice } = useCurrency();

  const cardParams = new URLSearchParams();
  const city = searchParams.get('city');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  if (city) cardParams.set('city', city);
  if (checkIn) cardParams.set('checkIn', checkIn);
  if (checkOut) cardParams.set('checkOut', checkOut);
  if (guests) cardParams.set('guests', guests);

  const cardHref = cardParams.toString()
    ? `/${currentLocale}/hotels/${hotel.slug}?${cardParams.toString()}`
    : `/${currentLocale}/hotels/${hotel.slug}`;

  // Get top 4 amenities
  const topAmenities = (hotel.amenities || []).slice(0, 4);

  // Calculate base price
  const roomPrices = (hotel.rooms || []).map(r => r.pricePerNight).filter(p => typeof p === 'number' && p > 0);
  const basePrice = (hotel.priceFrom && hotel.priceFrom > 0)
    ? hotel.priceFrom
    : (roomPrices.length > 0 ? Math.min(...roomPrices) : 35);

  return (
    <Link 
      href={cardHref} 
      className={cn(
        'group block bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#23096E]/30 transition-all duration-300 ease-out flex flex-col justify-between',
        className
      )}
    >
      <div>
        {/* ── Hotel Image ── */}
        <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
          {hotel.thumbnail && hotel.thumbnail.startsWith('http') ? (
            <Image
              src={hotel.thumbnail}
              alt={hotel.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#23096E]/10 to-[#FF3B30]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-400">مساري</span>
            </div>
          )}

          {/* Subtle bottom shadow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
            aria-label="إضافة للمفضلة"
          >
            <Heart size={15} className="text-neutral-400 hover:text-[#FF3B30] transition-colors" />
          </button>
        </div>

        {/* ── Hotel Details ── */}
        <div className="p-3.5 sm:p-4">
          {/* Hotel Name */}
          <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#23096E] transition-colors mb-1.5">
            {hotel.name}
          </h3>

          {/* Address / Location */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
            <MapPin size={13} className="shrink-0 text-[#23096E]" />
            <span className="truncate">{hotel.address || hotel.city}</span>
          </div>

          {/* Amenities Chips */}
          {topAmenities.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar py-0.5">
              {topAmenities.map((amenity: any, idx: number) => {
                const amenityName = typeof amenity?.name === 'string'
                  ? amenity.name
                  : (typeof amenity?.name === 'object' && amenity?.name !== null ? (amenity.name.ar || amenity.name.en || '') : '');
                return (
                  <div
                    key={`${amenity.id || amenityName || 'amenity'}-${idx}`}
                    className="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-200/70 flex items-center justify-center shrink-0 hover:bg-neutral-100 transition-colors"
                    title={amenityName}
                  >
                    {getAmenityIcon(amenity.iconKey || amenity.icon, amenity.name)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer: Price & Action Button ── */}
      <div className="p-3.5 sm:p-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between mt-auto">
        {/* Price */}
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 font-bold leading-none mb-0.5">تبدأ من</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-[#23096E]">
              {formatPrice(basePrice)}
            </span>
            <span className="text-[10px] text-neutral-500 font-medium">/ ليلة</span>
          </div>
        </div>

        {/* Action Button */}
        <span className="inline-flex items-center justify-center bg-[#23096E] text-white text-xs px-3.5 py-1.5 rounded-xl group-hover:bg-[#3A1C8F] transition-all font-bold shadow-sm shadow-[#23096E]/15 shrink-0">
          عرض التفاصيل
        </span>
      </div>
    </Link>
  );
}
