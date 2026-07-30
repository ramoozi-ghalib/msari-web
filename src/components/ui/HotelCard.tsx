'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useParams } from 'next/navigation';
import { 
  MapPin, Wifi, Coffee, Car, Waves, Heart, Shield, Tv, Dumbbell, Bell, Check,
  ShoppingCart, Shirt, ArrowUpDown, Presentation, Home, HelpCircle, Star
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
 * Supports all Firestore specific keys: wifi, parking, room_service, restaurant, cafeteria, security, grocery, laundry, majlis_terrace, elevator, central_location, meeting_room, cafe, etc.
 */
function getAmenityIcon(iconKey?: string, name?: any) {
  const key = (typeof iconKey === 'string' ? iconKey : '').toLowerCase();
  const label = (typeof name === 'string' ? name : (typeof name === 'object' && name !== null ? (name.ar || name.en || '') : '')).toLowerCase();
  const t = `${key} ${label}`;

  if (t.includes('wifi') || t.includes('internet') || t.includes('إنترنت') || t.includes('انترنت') || t.includes('واي')) {
    return <Wifi size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('park') || t.includes('car') || t.includes('موقف') || t.includes('سيار') || t.includes('مركب')) {
    return <Car size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('room_service') || t.includes('room service') || t.includes('bell') || t.includes('خدمة الغرف') || t.includes('خدمة غرف') || t.includes('غرفة')) {
    return <Bell size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('pool') || t.includes('swim') || t.includes('wave') || t.includes('مسبح') || t.includes('سباحة')) {
    return <Waves size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('restaur') || t.includes('food') || t.includes('utensil') || t.includes('مطعم') || t.includes('طعام') || t.includes('أكل')) {
    return <Coffee size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('grocery') || t.includes('shop') || t.includes('بقالة') || t.includes('سوبرماركت') || t.includes('محل')) {
    return <ShoppingCart size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('laundry') || t.includes('wash') || t.includes('shirt') || t.includes('مغسلة') || t.includes('كوي') || t.includes('تنظيف')) {
    return <Shirt size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('elevator') || t.includes('lift') || t.includes('مصعد')) {
    return <ArrowUpDown size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('meeting') || t.includes('conference') || t.includes('presentation') || t.includes('قاعة') || t.includes('قاعات') || t.includes('تدريب')) {
    return <Presentation size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('majlis') || t.includes('terrace') || t.includes('rooftop') || t.includes('طيرمانات') || t.includes('طيرمانة') || t.includes('مجلس')) {
    return <Home size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('location') || t.includes('center') || t.includes('وسط المدينة') || t.includes('موقع') || t.includes('خريطة')) {
    return <MapPin size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('cafe') || t.includes('coffee') || t.includes('كافيه') || t.includes('مقهى') || t.includes('شاي') || t.includes('cafeteria') || t.includes('كافتيريا')) {
    return <Coffee size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('secur') || t.includes('guard') || t.includes('shield') || t.includes('أمان') || t.includes('حراسة') || t.includes('حماية')) {
    return <Shield size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('tv') || t.includes('television') || t.includes('تلفاز') || t.includes('تلفزيون') || t.includes('شاشة')) {
    return <Tv size={12} className="text-[#23096e] shrink-0" />;
  }
  if (t.includes('gym') || t.includes('fitness') || t.includes('sport') || t.includes('جيم') || t.includes('رياضة') || t.includes('لياقة') || t.includes('dumbbell')) {
    return <Dumbbell size={12} className="text-[#23096e] shrink-0" />;
  }

  // Generic fallback
  return <Check size={10} className="text-[#23096e] shrink-0" />;
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

  // Get top 4 amenities from hotel.amenities (each hotel has its own unique list)
  const topAmenities = (hotel.amenities || []).slice(0, 4);

  // Calculate base price
  const roomPrices = (hotel.rooms || []).map(r => r.pricePerNight).filter(p => typeof p === 'number' && p > 0);
  const basePrice = (hotel.priceFrom && hotel.priceFrom > 0)
    ? hotel.priceFrom
    : (roomPrices.length > 0 ? Math.min(...roomPrices) : 35);

  const finalPrice = hotel.discount
    ? Math.round(basePrice * (1 - hotel.discount.percentage / 100))
    : basePrice;

  const starsCount = Math.min(Math.max(Number(hotel.stars) || 5, 1), 5);

  return (
    <Link href={cardHref} className={cn('card group block bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300', className)}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-neutral-200 overflow-hidden">
        {hotel.thumbnail && hotel.thumbnail.startsWith('http') ? (
          <Image
            src={hotel.thumbnail}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#23096e22] to-[#3A1C8F33]" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Discount Badge */}
        {hotel.discount && (
          <div className="absolute top-3 start-3 z-10">
            <span className="bg-[#FF3B30] text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
              🏷️ خصم {hotel.discount.percentage}%
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-3 end-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110 shadow-md"
        >
          <Heart size={16} className="text-neutral-400 hover:text-[#FF3B30] transition-colors duration-300" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Stars Row */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-[#0A0912] text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-[#23096E] transition-colors duration-300">
            {hotel.name}
          </h3>
          {/* Star Rating on Left */}
          <div className="flex items-center gap-0.5 shrink-0" title={`${starsCount} نجوم`}>
            {Array.from({ length: starsCount }).map((_, i) => (
              <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3 group-hover:text-neutral-600 transition-colors duration-300">
          <MapPin size={13} className="shrink-0 text-[#23096e]" />
          <span className="truncate">{hotel.address}</span>
        </div>

        {/* Hotel Amenities — unique per hotel, from Firestore */}
        {topAmenities.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar py-0.5">
            {topAmenities.map((amenity: any, idx: number) => {
              const amenityName = typeof amenity?.name === 'string'
                ? amenity.name
                : (typeof amenity?.name === 'object' && amenity?.name !== null ? (amenity.name.ar || amenity.name.en || '') : '');
              return (
                <span
                  key={`${amenity.id || amenityName || 'amenity'}-${idx}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100/80 border border-neutral-200/40 text-[10px] font-semibold text-neutral-600 shrink-0"
                  title={amenityName}
                >
                  {getAmenityIcon(amenity.iconKey || amenity.icon, amenity.name)}
                  <span>{amenityName}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Action Button & Price Section */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 group-hover:border-neutral-200 transition-colors duration-300">
          {/* Price on the Right */}
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-semibold leading-none mb-0.5">تبدأ من</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-[#FF3B30]">
                {formatPrice(finalPrice)}
              </span>
              {hotel.discount && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(basePrice)}
                </span>
              )}
              <span className="text-[10px] text-neutral-400 font-medium">/ ليلة</span>
            </div>
          </div>

          {/* Book Now Button on the Left */}
          <span className="btn btn-primary btn-sm text-xs px-4 py-1.5 rounded-xl hover:shadow-lg transition-shadow duration-300 font-bold shrink-0">
            احجز الآن
          </span>
        </div>
      </div>
    </Link>
  );
}
