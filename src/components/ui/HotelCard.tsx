'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useParams } from 'next/navigation';
import { 
  MapPin, Wifi, Coffee, Car, Waves, Heart, Shield, Tv, Dumbbell, Bell, Check,
  ShoppingCart, Shirt, ArrowUpDown, Presentation, Home, Star, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Hotel } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { Badge } from '@/components/ui/Badge';

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
    return <Wifi size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('park') || t.includes('car') || t.includes('موقف') || t.includes('سيار') || t.includes('مركب')) {
    return <Car size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('room_service') || t.includes('room service') || t.includes('bell') || t.includes('خدمة الغرف') || t.includes('خدمة غرف') || t.includes('غرفة')) {
    return <Bell size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('pool') || t.includes('swim') || t.includes('wave') || t.includes('مسبح') || t.includes('سباحة')) {
    return <Waves size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('restaur') || t.includes('food') || t.includes('utensil') || t.includes('مطعم') || t.includes('طعام') || t.includes('أكل')) {
    return <Coffee size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('grocery') || t.includes('shop') || t.includes('بقالة') || t.includes('سوبرماركت') || t.includes('محل')) {
    return <ShoppingCart size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('laundry') || t.includes('wash') || t.includes('shirt') || t.includes('مغسلة') || t.includes('كوي') || t.includes('تنظيف')) {
    return <Shirt size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('elevator') || t.includes('lift') || t.includes('مصعد')) {
    return <ArrowUpDown size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('meeting') || t.includes('conference') || t.includes('presentation') || t.includes('قاعة') || t.includes('قاعات') || t.includes('تدريب')) {
    return <Presentation size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('majlis') || t.includes('terrace') || t.includes('rooftop') || t.includes('طيرمانات') || t.includes('طيرمانة') || t.includes('مجلس')) {
    return <Home size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('location') || t.includes('center') || t.includes('وسط المدينة') || t.includes('موقع') || t.includes('خريطة')) {
    return <MapPin size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('cafe') || t.includes('coffee') || t.includes('كافيه') || t.includes('مقهى') || t.includes('شاي') || t.includes('cafeteria') || t.includes('كافتيريا')) {
    return <Coffee size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('secur') || t.includes('guard') || t.includes('shield') || t.includes('أمان') || t.includes('حراسة') || t.includes('حماية')) {
    return <Shield size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('tv') || t.includes('television') || t.includes('تلفاز') || t.includes('تلفزيون') || t.includes('شاشة')) {
    return <Tv size={13} className="text-[var(--brand-primary)]" />;
  }
  if (t.includes('gym') || t.includes('fitness') || t.includes('sport') || t.includes('جيم') || t.includes('رياضة') || t.includes('لياقة') || t.includes('dumbbell')) {
    return <Dumbbell size={13} className="text-[var(--brand-primary)]" />;
  }

  return <Check size={12} className="text-[var(--brand-primary)]" />;
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

  // Get top 5 amenities from hotel.amenities
  const topAmenities = (hotel.amenities || []).slice(0, 5);

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
    <Link 
      href={cardHref} 
      className={cn(
        'group block bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        className
      )}
    >
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
          <div className="w-full h-full bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--brand-secondary)]/20" />
        )}

        {/* Discount Badge */}
        {hotel.discount && (
          <div className="absolute top-3 start-3 z-10">
            <span className="px-2.5 py-1 rounded-xl bg-[var(--brand-accent)] text-white text-[11px] font-black shadow-md">
              خصم {hotel.discount.percentage}%
            </span>
          </div>
        )}

        {/* Verified Instant Confirmation Badge */}
        <div className="absolute bottom-3 start-3 z-10">
          <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold inline-flex items-center gap-1 border border-white/20">
            <Check size={11} className="text-emerald-400" />
            <span>تأكيد فوري</span>
          </span>
        </div>

        {/* Wishlist Icon */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
          aria-label="إضافة للمفضلة"
        >
          <Heart size={15} className="text-neutral-500 hover:text-[var(--brand-accent)] transition-colors" />
        </button>
      </div>

      {/* ── Content Container ── */}
      <div className="p-5">
        
        {/* Title and Category Stars Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors">
            {hotel.name}
          </h3>

          {/* Hotel Category Stars Only (No Review Rating) */}
          <div className="flex items-center gap-0.5 shrink-0" title={`فندق ${starsCount} نجوم`}>
            {Array.from({ length: starsCount }).map((_, i) => (
              <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        {/* Location with Pin */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
          <MapPin size={13} className="shrink-0 text-[var(--brand-primary)]" />
          <span className="truncate">{hotel.address}</span>
        </div>

        {/* ── Amenities: Clean Icon Chips Only (No cluttered long text) ── */}
        {topAmenities.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 py-1 border-t border-neutral-100/80">
            {topAmenities.map((amenity: any, idx: number) => {
              const amenityName = typeof amenity?.name === 'string'
                ? amenity.name
                : (typeof amenity?.name === 'object' && amenity?.name !== null ? (amenity.name.ar || amenity.name.en || '') : '');
              return (
                <div
                  key={`${amenity.id || amenityName || 'amenity'}-${idx}`}
                  className="w-7 h-7 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                  title={amenityName}
                >
                  {getAmenityIcon(amenity.iconKey || amenity.icon, amenity.name)}
                </div>
              );
            })}
            <span className="text-[10px] text-neutral-400 font-semibold ms-1">مرافق معتمدة</span>
          </div>
        )}

        {/* ── Price and Action Row ── */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div>
            <div className="text-[10px] text-neutral-400 font-bold">يبدأ من</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-[var(--brand-accent)]">
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

          <span className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-sm group-hover:bg-[var(--brand-secondary)] transition-colors">
            عرض الفندق
          </span>
        </div>

      </div>
    </Link>
  );
}
