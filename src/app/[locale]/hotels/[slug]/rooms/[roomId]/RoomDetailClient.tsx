'use client';

import { useState, useEffect, useCallback, type ComponentType, type CSSProperties } from 'react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import {
  Calendar, Users, Check, ArrowRight, BedDouble,
  ChevronLeft, ChevronRight as ChevronR, Clock,
  Bath, Maximize2, DoorOpen
} from 'lucide-react';
import type { Hotel, Room } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

const toIconRecord = LucideIcons as unknown as Record<string, ComponentType<{ size?: number; className?: string; style?: CSSProperties; color?: string }>>;

/* ─── Dynamic Lucide icon mapping ─── */
const ICON_MAPPING: Record<string, string> = {
  grocery: 'ShoppingBag',
  cafe: 'Coffee',
  security: 'Shield',
  room_service: 'Bell',
  parking: 'Car',
  laundry: 'Shirt',
  wifi: 'Wifi',
  internet: 'Wifi',
  elevator: 'ArrowUpDown',
  majlis_terrace: 'Sofa',
  tv: 'Tv',
  smart_tv: 'Tv',
  pool: 'Waves',
  restaurant: 'UtensilsCrossed',
  reception: 'Key',
  gym: 'Dumbbell',
  air_conditioning: 'Wind',
  ac: 'Wind',
  wind: 'Wind',
  fridge: 'Coffee',
  mini_fridge: 'Coffee',
  wardrobe: 'Shirt',
  city_view: 'Eye',
  hair_dryer: 'Wind',
  electric_kettle: 'Coffee',
  bathtub: 'Bath',
  bath: 'Bath',
  bathroom: 'Bath',
  safe: 'ShieldCheck',
  iron: 'Shirt',
};

const DynIcon = ({ name, size = 15 }: { name: string; size?: number }) => {
  const mappedName = ICON_MAPPING[name?.toLowerCase()] || name || 'Check';
  const pascal = mappedName
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/^([a-z])/, (_, c: string) => c.toUpperCase());
  const Icon = toIconRecord[pascal] ?? toIconRecord[mappedName] ?? toIconRecord[name] ?? LucideIcons.Check;
  return <Icon size={size} />;
};

/* ─── Default fallback slides ─── */
const FALLBACK_SLIDES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop'
];

interface Props {
  hotel: Hotel;
  room: Room;
}

export default function RoomDetailClient({ hotel, room }: Props) {
  const searchParams = useSearchParams();
  const { locale } = useParams();
  const currentLocale = (locale as string) || 'ar';

  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = Number(searchParams.get('guests'));
  const bookingError = searchParams.get('bookingError') || '';

  const [slide, setSlide] = useState(0);
  const [checkIn, setCheckIn] = useState(checkInParam);
  const [checkOut, setCheckOut] = useState(checkOutParam);
  const [guests, setGuests] = useState(() => {
    const parsedGuests = guestsParam;
    const baseGuests = Number.isFinite(parsedGuests) && parsedGuests > 0 ? parsedGuests : 2;
    return Math.min(baseGuests, room.capacity || 2);
  });

  const cityParam = searchParams.get('city') || hotel.city;
  const { formatPrice } = useCurrency();

  const validImages = room.images?.filter(img => typeof img === 'string' && img.startsWith('http')) || [];
  const slides = validImages.length ? validImages : (hotel.images?.filter(img => typeof img === 'string' && img.startsWith('http')) || FALLBACK_SLIDES);
  const total = slides.length;
  const go = useCallback((n: number) => setSlide((n + total) % total), [total]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => go(slide + 1), 5500);
    return () => clearInterval(t);
  }, [slide, go, total]);

  const discounted = room.pricePerNight || 0;
  const priceToPay = hotel.discount
    ? Math.round(discounted * (1 - hotel.discount.percentage / 100))
    : discounted;

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;

  const hasRequiredBookingData = Boolean(checkIn && checkOut && guests >= 1);

  const hotelBackHref = () => {
    const params = new URLSearchParams();
    if (cityParam) params.set('city', cityParam);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    return `/${currentLocale}/hotels/${hotel.slug}?${params.toString()}`;
  };

  const bookingHref = () => {
    if (!hasRequiredBookingData) return '#';
    const params = new URLSearchParams();
    if (cityParam) params.set('city', cityParam);
    params.set('hotel', hotel.slug);
    params.set('hotelId', hotel.id);
    params.set('room', room.id);
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    params.set('nights', String(nights));
    return `/${currentLocale}/booking?${params.toString()}`;
  };

  return (
    <div className="bg-[#F8F9FC] min-h-screen pb-20 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {bookingError && (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium mb-6">
            {bookingError}
          </div>
        )}

        {/* Back Link */}
        <Link
          href={hotelBackHref()}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#23096e] hover:text-[#1a0654] transition-colors mb-6 bg-white px-4 py-2 rounded-full shadow-sm border border-neutral-100"
        >
          <ArrowRight size={16} /> العودة لفندق {hotel.name}
        </Link>

        {/* ── TWO-COLUMN layout: left content + right booking ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="flex-1 min-w-0 space-y-6 w-full">

            {/* 1. GALLERY (TOP) */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[460px] bg-neutral-900 group">
                {slides.map((src, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                    style={{ opacity: i === slide ? 1 : 0 }}
                  >
                    <Image
                      src={src}
                      alt={`${room.name} - ${i + 1}`}
                      fill
                      className="object-contain sm:object-cover"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority={i === 0}
                    />
                  </div>
                ))}

                {total > 1 && (
                  <>
                    <button
                      onClick={() => go(slide - 1)}
                      className="absolute start-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-lg flex items-center justify-center transition-all hover:scale-105"
                      title="السابق"
                    >
                      <ChevronR size={20} />
                    </button>
                    <button
                      onClick={() => go(slide + 1)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-lg flex items-center justify-center transition-all hover:scale-105"
                      title="التالي"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="absolute top-3 end-3 z-20 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {slide + 1} / {total}
                    </div>
                    {/* Dots */}
                    <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center">
                      <div className="flex gap-1.5">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => go(i)}
                            className={`rounded-full transition-all duration-300 ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. ROOM NAME & DESCRIPTION (DIRECTLY UNDER GALLERY) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
              
              {/* Room Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-neutral-100">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-1">{room.name}</h1>
                  {room.nameEn && <p className="text-neutral-400 text-xs sm:text-sm font-medium">{room.nameEn}</p>}
                </div>
                <div className={`px-3.5 py-1 rounded-full text-xs font-bold ${room.isAvailable ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-red-50 text-red-700 border border-red-200/50'}`}>
                  {room.isAvailable ? 'متاح للحجز' : 'غير متاح'}
                </div>
              </div>

              {/* Description: "الوصف" */}
              <div className="pt-5">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 mb-2">الوصف</h2>
                <p className="text-neutral-600 leading-7 text-sm whitespace-pre-line">
                  {room.description || `استمتع بإقامة مريحة في ${room.name} بفندق ${hotel.name} مع أرقى الخدمات ومستوى راحة متكامل.`}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-neutral-100">
                {/* 1. Capacity */}
                <div className="flex items-center gap-2.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="w-8 h-8 rounded-lg bg-[#23096E]/10 text-[#23096E] flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-medium">السعة</div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-900">{room.capacity} {room.capacity === 1 ? 'نزيل' : 'نزلاء'}</div>
                  </div>
                </div>

                {/* 2. Beds */}
                <div className="flex items-center gap-2.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="w-8 h-8 rounded-lg bg-[#23096E]/10 text-[#23096E] flex items-center justify-center shrink-0">
                    <BedDouble size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-medium">الأسرة</div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-900">
                      {room.numberOfBeds && room.numberOfBeds > 1 ? `${room.numberOfBeds} أسرة` : '1 سرير'}
                    </div>
                  </div>
                </div>

                {/* 3. Bathrooms */}
                <div className="flex items-center gap-2.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="w-8 h-8 rounded-lg bg-[#23096E]/10 text-[#23096E] flex items-center justify-center shrink-0">
                    <Bath size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-medium">دورات المياه</div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-900">
                      {room.numberOfBathrooms && room.numberOfBathrooms > 1 ? `${room.numberOfBathrooms} حمامات` : '1 حمام خاص'}
                    </div>
                  </div>
                </div>

                {/* 4. Rooms or Area */}
                {room.numberOfRooms && room.numberOfRooms > 1 ? (
                  <div className="flex items-center gap-2.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <div className="w-8 h-8 rounded-lg bg-[#23096E]/10 text-[#23096E] flex items-center justify-center shrink-0">
                      <DoorOpen size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">الغرف</div>
                      <div className="text-xs sm:text-sm font-bold text-neutral-900">{room.numberOfRooms} غرف نوم</div>
                    </div>
                  </div>
                ) : room.area ? (
                  <div className="flex items-center gap-2.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <div className="w-8 h-8 rounded-lg bg-[#23096E]/10 text-[#23096E] flex items-center justify-center shrink-0">
                      <Maximize2 size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">المساحة</div>
                      <div className="text-xs sm:text-sm font-bold text-neutral-900">{room.area} م²</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <div className="w-8 h-8 rounded-lg bg-[#23096E]/10 text-[#23096E] flex items-center justify-center shrink-0">
                      <DoorOpen size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 font-medium">الغرف</div>
                      <div className="text-xs sm:text-sm font-bold text-neutral-900">غرفة واحدة</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. AMENITIES: "تجهيزات ومرافق" (API DATA) */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 mb-4">تجهيزات ومرافق</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {room.amenities.map((a, idx) => {
                    const iconName = a.icon || a.name || 'Check';
                    return (
                      <div key={a.id || idx} className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-100 bg-neutral-50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-[#23096E]/10 text-[#23096E]">
                          <DynIcon name={iconName} size={15} />
                        </div>
                        <span className="font-bold text-xs text-neutral-800 truncate">{a.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* ═══ RIGHT COLUMN: Booking widget ═══ */}
          <div className="w-full lg:w-80 shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
              <div className="h-1.5" style={{ background:'linear-gradient(to right,#23096e,#3A1C8F,#ff3b30)' }} />
              
              <div className="px-6 pt-6 pb-5 border-b border-neutral-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#FF3B30]">{formatPrice(priceToPay)}</span>
                  <span className="text-neutral-400 text-sm">/ ليلة</span>
                </div>
                {hotel.discount && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-neutral-400 line-through text-sm">{formatPrice(discounted)}</span>
                    <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full shadow-sm" style={{ background:'#ff3b30' }}>
                      خصم {hotel.discount.percentage}%
                    </span>
                  </div>
                )}
              </div>

              <div className="px-5 py-5 space-y-3.5 border-b border-neutral-100 bg-[#f8f8fa]/50">
                
                {/* Check In & Check Out SIDE BY SIDE ON BOTH MOBILE & DESKTOP */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Check In */}
                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 focus-within:border-[#23096e] transition-colors bg-white shadow-sm">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#23096e]/10 text-[#23096e]">
                      <Calendar size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">الوصول</p>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={e => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-[11px] sm:text-xs font-bold text-neutral-800 outline-none bg-transparent mt-0.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Check Out */}
                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 focus-within:border-[#23096e] transition-colors bg-white shadow-sm">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#23096e]/10 text-[#23096e]">
                      <Clock size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">المغادرة</p>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full text-[11px] sm:text-xs font-bold text-neutral-800 outline-none bg-transparent mt-0.5 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests Counter */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-3.5 py-2.5 bg-white shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#23096e]/10 text-[#23096e]">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">الضيوف</p>
                      <p className="text-xs font-bold text-neutral-800 mt-0.5">{guests} ضيف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setGuests(g => Math.max(1, g - 1))}
                      className="w-7 h-7 rounded-lg border border-neutral-200 font-black text-sm flex items-center justify-center hover:border-[#23096e] hover:text-[#23096e] hover:bg-[#23096e]/5 transition-colors leading-none"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-xs font-black">{guests}</span>
                    <button
                      onClick={() => setGuests(g => Math.min(room.capacity || 2, g + 1))}
                      className="w-7 h-7 rounded-lg border border-neutral-200 font-black text-sm flex items-center justify-center hover:border-[#23096e] hover:text-[#23096e] hover:bg-[#23096e]/5 transition-colors leading-none disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="px-6 py-4 space-y-2.5 border-b border-neutral-100 text-sm">
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>{formatPrice(priceToPay)} × {nights} {nights === 1 ? 'ليلة' : 'ليالٍ'}</span>
                  <span className="font-bold text-neutral-800">{formatPrice(priceToPay * nights)}</span>
                </div>
                {hotel.discount && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>خصم {hotel.discount.percentage}%</span>
                    <span className="font-bold">− {formatPrice((discounted - priceToPay) * nights)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm sm:text-base border-t border-neutral-100 pt-2.5 mt-1">
                  <span className="text-neutral-900">الإجمالي</span>
                  <span className="text-[#FF3B30]">{formatPrice(priceToPay * nights)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 py-5 bg-white">
                {!hasRequiredBookingData && (
                  <p className="text-center text-xs text-amber-600 mb-3">
                    اختر تاريخ الوصول والمغادرة للمتابعة.
                  </p>
                )}
                <Link
                  href={room.isAvailable ? bookingHref() : '#'}
                  className={`flex items-center justify-center gap-2 w-full font-black text-sm py-3.5 rounded-xl transition-all ${
                    room.isAvailable
                      ? hasRequiredBookingData
                        ? 'text-white bg-[#23096E] hover:bg-[#1a0654] shadow-md hover:-translate-y-0.5'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed pointer-events-none'
                      : 'opacity-50 cursor-not-allowed bg-neutral-300 text-neutral-500'
                  }`}
                >
                  {room.isAvailable ? 'حجز الغرفة' : 'غير متاح'}
                  {room.isAvailable && hasRequiredBookingData && <ArrowRight size={16} />}
                </Link>
                
                <div className="mt-4 space-y-2">
                  {['إلغاء مجاني قبل 24 ساعة', 'دفع عند الوصول أو تحويل بنكي', 'تأكيد فوري للحجز'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                      <Check size={13} className="text-green-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
