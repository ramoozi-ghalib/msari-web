'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Wifi, Coffee, Car, Waves, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Hotel } from '@/types';

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={12} />,
  pool: <Waves size={12} />,
  utensils: <Coffee size={12} />,
  parking: <Car size={12} />,
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
            star <= Math.floor(rating) ? 'text-amber-400' : 'text-neutral-300'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function HotelCard({ hotel, className }: HotelCardProps) {
  return (
    <Link href={`/hotels/${hotel.slug}`} className={cn('card group block', className)}>
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
          <div className="absolute top-3 start-3">
            <span className="badge badge-discount">
              🏷️ خصم {hotel.discount.percentage}%
            </span>
          </div>
        )}

        {/* Stars */}
        <div className="absolute top-3 end-3 flex gap-1">
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute bottom-3 end-3 w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
        >
          <Heart size={16} className="text-neutral-400 hover:text-red-500 transition-colors duration-300" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name First */}
        <h3 className="font-bold text-neutral-900 text-lg leading-snug mb-1 line-clamp-1 group-hover:text-[--brand-primary] transition-colors duration-300">
          {hotel.name}
        </h3>

        {/* Address Second */}
        <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-3 group-hover:text-neutral-600 transition-colors duration-300">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{hotel.city}، {hotel.governorate}</span>
        </div>

        {/* Details & Rating Third */}
        <div className="flex items-center gap-2 mb-3 bg-neutral-50 w-fit px-2 py-1 rounded-md">
          <StarRating rating={hotel.rating} />
          <span className="text-xs font-bold text-amber-600">{hotel.rating.toFixed(1)}</span>
          <span className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors duration-300">
            ({hotel.reviewCount} تقييم)
          </span>
        </div>

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {hotel.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity.id} className="amenity-chip">
                {AMENITY_ICONS[amenity.icon] || null}
                {amenity.name}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 group-hover:border-neutral-200 transition-colors duration-300">
          <div className="group/price">
            <span className="text-xs text-neutral-400 group-hover/price:text-neutral-500 transition-colors duration-300">يبدأ من</span>
            <div className="flex items-baseline gap-1">
              {hotel.discount && (
                <span className="text-xs text-neutral-400 line-through group-hover/price:text-neutral-500 transition-colors duration-300">
                  ${hotel.priceFrom}
                </span>
              )}
              <span className="text-xl font-black text-[--brand-primary] group-hover/price:scale-105 transition-transform duration-300 inline-block">
                ${hotel.discount
                  ? Math.round(hotel.priceFrom * (1 - hotel.discount.percentage / 100))
                  : hotel.priceFrom}
              </span>
              <span className="text-xs text-neutral-400 group-hover/price:text-neutral-500 transition-colors duration-300">/ ليلة</span>
            </div>
          </div>
          <span className="btn btn-primary btn-sm text-xs hover:shadow-lg transition-shadow duration-300">
            احجز الآن
          </span>
        </div>
      </div>
    </Link>
  );
}
