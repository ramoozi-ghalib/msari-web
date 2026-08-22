'use client';

import { useState, useEffect, useCallback, type ComponentType, type CSSProperties } from 'react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import {
  MapPin, Star, Heart, Share2, Calendar, Users, Check, ArrowRight,
  ChevronLeft, ChevronRight as ChevronR, Clock, X,
  Shield, Zap, CreditCard, BedDouble, LogIn, ChevronRight,
  Grid, Sparkles, AlertCircle
} from 'lucide-react';
import type { Hotel } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { Badge } from '@/components/ui/Badge';

const toIconRecord = LucideIcons as unknown as Record<string, ComponentType<{ size?: number; className?: string; style?: CSSProperties; color?: string }>>;

/* ─── Default slides (Unsplash) ─── */
const DEFAULT_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop', alt: 'Hotel exterior' },
  { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop', alt: 'Hotel room' },
];

/* ─── Dynamic Lucide icon ─── */
const ICON_MAPPING: Record<string, string> = {
  grocery: 'ShoppingBag',
  cafe: 'Coffee',
  security: 'Shield',
  room_service: 'Bell',
  parking: 'Car',
  laundry: 'Shirt',
  wifi: 'Wifi',
  elevator: 'ArrowUpDown',
  majlis_terrace: 'Sofa',
  tv: 'Tv',
  pool: 'Waves',
  restaurant: 'Utensils',
  reception: 'Key',
  gym: 'Dumbbell',
};

const DynIcon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const mappedName = ICON_MAPPING[name.toLowerCase()] || name;
  const pascal = mappedName
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/^([a-z])/, (_, c: string) => c.toUpperCase());
  const Icon = toIconRecord[pascal] ?? toIconRecord[mappedName] ?? toIconRecord[name] ?? LucideIcons.Check;
  return <Icon size={size} />;
};

/* ─── Category color map ─── */
const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: '#23096e',
  WELLNESS: '#0284c7',
  DINING: '#d97706',
  SPORT: '#16a34a',
  BUSINESS: '#7c3aed',
  ROOM: '#db2777',
};

/* ─── Fallback amenities (shown if hotel has none in DB) ─── */
const FALLBACK_AMENITIES = [
  { name: 'واي فاي مجاني',     icon: 'Wifi',           color: '#23096e' },
  { name: 'موقف سيارات',       icon: 'Car',            color: '#16a34a' },
  { name: 'خدمة الغرف',        icon: 'BellRing',       color: '#d97706' },
  { name: 'مطعم',              icon: 'UtensilsCrossed', color: '#7c3aed' },
  { name: 'مصعد',              icon: 'ArrowUpDown',     color: '#0284c7' },
  { name: 'حراسة أمنية',       icon: 'ShieldCheck',    color: '#059669' },
];

interface Props { hotel: Hotel }

export default function HotelDetailClient({ hotel }: Props) {
  const searchParams = useSearchParams();
  const { locale } = useParams();
  const currentLocale = (locale as string) || 'ar';

  const [slide, setSlide] = useState(0);
  const [fav, setFav] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = Number(searchParams.get('guests'));
  const bookingError = searchParams.get('bookingError') || '';

  const [checkIn, setCheckIn] = useState(checkInParam);
  const [checkOut, setCheckOut] = useState(checkOutParam);
  const [guests, setGuests] = useState(() => {
    const parsedGuests = guestsParam;
    return Number.isFinite(parsedGuests) && parsedGuests > 0 ? parsedGuests : 2;
  });

  const cityParam = searchParams.get('city') || hotel.city;

  const isValidUrl = (url: string) => Boolean(url?.startsWith('http'));
  const validImages = hotel.images?.filter(isValidUrl) || [];
  const slides = validImages.length
    ? validImages.map(src => ({ src, alt: hotel.name }))
    : DEFAULT_SLIDES;
  const total = slides.length;

  const go = useCallback((n: number) => setSlide((n + total) % total), [total]);

  // Autoplay for mobile carousel
  useEffect(() => {
    if (total <= 1 || isLightboxOpen) return;
    const t = setInterval(() => go(slide + 1), 6000);
    return () => clearInterval(t);
  }, [slide, go, total, isLightboxOpen]);

  const { formatPrice } = useCurrency();
  const discounted = hotel.discount
    ? Math.round(hotel.priceFrom * (1 - hotel.discount.percentage / 100))
    : hotel.priceFrom;

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;

  const hasRequiredBookingData = Boolean(checkIn && checkOut && guests >= 1);

  const roomHref = (roomId: string) => {
    const params = new URLSearchParams();
    params.set('city', cityParam);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    return `/${currentLocale}/hotels/${hotel.slug}/rooms/${roomId}?${params.toString()}`;
  };

  const bookingHref = (roomId?: string) => {
    if (!hasRequiredBookingData) return '#';
    const params = new URLSearchParams();
    params.set('city', cityParam);
    params.set('hotel', hotel.slug);
    params.set('hotelId', hotel.id);
    if (roomId) params.set('room', roomId);
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    params.set('nights', String(nights));
    return `/${currentLocale}/booking?${params.toString()}`;
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: hotel.name,
          text: `احجز إقامتك في ${hotel.name} عبر مساري`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const starCount = Math.min(5, Math.max(1, Number(hotel.stars) || 4));

  return (
    <div className="bg-[#F8F9FC] min-h-screen pb-24">

      {/* ── 1. Top Navigation & Breadcrumbs ── */}
      <div className="bg-white border-b border-neutral-200/70 pt-20 sm:pt-24 pb-3.5">
        <div className="container-msari flex items-center justify-between gap-4 flex-wrap">
          {/* Breadcrumb Trail */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium overflow-x-auto no-scrollbar py-1">
            <Link href="/" className="hover:text-[#23096E] transition-colors shrink-0">
              الرئيسية
            </Link>
            <ChevronLeft size={13} className="text-neutral-300 shrink-0" />
            <Link href={`/${currentLocale}/hotels`} className="hover:text-[#23096E] transition-colors shrink-0">
              فنادق اليمن
            </Link>
            {hotel.city && (
              <>
                <ChevronLeft size={13} className="text-neutral-300 shrink-0" />
                <Link href={`/${currentLocale}/hotels?city=${encodeURIComponent(hotel.city)}`} className="hover:text-[#23096E] transition-colors shrink-0">
                  {hotel.city}
                </Link>
              </>
            )}
            <ChevronLeft size={13} className="text-neutral-300 shrink-0" />
            <span className="text-neutral-900 font-bold truncate max-w-[200px] sm:max-w-none">
              {hotel.name}
            </span>
          </nav>

          {/* Action Buttons: Favorite & Share */}
          <div className="flex items-center gap-2 shrink-0 ms-auto">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:border-[#23096E] hover:text-[#23096E] text-xs font-bold transition-colors bg-white shadow-2xs relative"
              title="مشاركة الفندق"
            >
              <Share2 size={14} />
              <span>{copiedShare ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFav(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                fav 
                  ? 'border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30]' 
                  : 'border-neutral-200 text-neutral-700 hover:border-[#FF3B30] hover:text-[#FF3B30] bg-white'
              }`}
              title="حفظ في المفضلة"
            >
              <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
              <span>{fav ? 'محفوظ' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>

      {bookingError && (
        <div className="container-msari pt-4">
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-amber-600" />
            <span>{bookingError}</span>
          </div>
        </div>
      )}

      {/* ── 2. Hotel Title & Header Block ── */}
      <div className="container-msari pt-6 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            {/* Classification & Name */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
                {hotel.name}
              </h1>
              {/* Hotel Category Stars Only */}
              <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-xl shadow-2xs" title={`فندق مصنف ${starCount} نجوم`}>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: starCount }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-black text-amber-800 ms-1">
                  {starCount} نجوم
                </span>
              </div>
            </div>

            {/* Address & Quick Jump Link */}
            <div className="flex items-center gap-2 text-neutral-600 text-xs sm:text-sm flex-wrap">
              <MapPin size={15} className="text-[#23096E] shrink-0" />
              <span>{hotel.address || `${hotel.city}، اليمن`}</span>
              <span className="text-neutral-300">•</span>
              <a
                href="#hotel-map"
                className="text-[#23096E] font-bold hover:underline transition-all"
              >
                عرض الموقع على الخريطة
              </a>
            </div>
          </div>

          {/* Quick Badges / Discount */}
          {hotel.discount && (
            <div className="flex items-center gap-2 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl px-4 py-2 text-[#FF3B30] font-black text-sm shadow-2xs">
              <Sparkles size={16} />
              <span>خصم {hotel.discount.percentage}% متاح لفترة محدودة</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. High-End Photo Gallery ── */}
      <div className="container-msari mb-8">
        {/* Desktop Bento Grid (lg+) */}
        <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-3 h-[460px] rounded-3xl overflow-hidden relative shadow-sm">
          {/* Main Large Photo (Span 2 cols, 2 rows) */}
          <div
            onClick={() => openLightbox(0)}
            className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden bg-neutral-900"
          >
            <Image
              src={slides[0].src}
              alt={slides[0].alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Thumbnail 1 */}
          <div
            onClick={() => openLightbox(1 % total)}
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-neutral-900"
          >
            <Image
              src={slides[1 % total].src}
              alt={slides[1 % total].alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Thumbnail 2 */}
          <div
            onClick={() => openLightbox(2 % total)}
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-neutral-900"
          >
            <Image
              src={slides[2 % total].src}
              alt={slides[2 % total].alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Thumbnail 3 */}
          <div
            onClick={() => openLightbox(3 % total)}
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-neutral-900"
          >
            <Image
              src={slides[3 % total].src}
              alt={slides[3 % total].alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Thumbnail 4 with "View All Photos" Button */}
          <div
            onClick={() => openLightbox(4 % total)}
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-neutral-900"
          >
            <Image
              src={slides[4 % total].src}
              alt={slides[4 % total].alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <button
                type="button"
                className="flex items-center gap-2 bg-white/95 text-neutral-900 px-4 py-2 rounded-xl text-xs font-black shadow-lg backdrop-blur-xs group-hover:scale-105 transition-all"
              >
                <Grid size={14} />
                <span>عرض جميع الصور ({total})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slider (< lg) */}
        <div className="lg:hidden relative aspect-[16/10] rounded-3xl overflow-hidden bg-neutral-900 shadow-sm">
          {slides.map((s, i) => (
            <div
              key={i}
              onClick={() => openLightbox(i)}
              className="absolute inset-0 transition-opacity duration-500 cursor-pointer"
              style={{ opacity: i === slide ? 1 : 0, pointerEvents: i === slide ? 'auto' : 'none' }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          ))}

          {total > 1 && (
            <>
              {/* Slider Arrows */}
              <button
                type="button"
                onClick={() => go(slide - 1)}
                className="absolute start-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 text-neutral-800 shadow-md flex items-center justify-center"
                aria-label="Previous image"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => go(slide + 1)}
                className="absolute end-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 text-neutral-800 shadow-md flex items-center justify-center"
                aria-label="Next image"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Photo Counter Pill */}
              <div className="absolute top-3 end-3 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Grid size={12} />
                <span>{slide + 1} / {total}</span>
              </div>

              {/* Dots */}
              <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => go(i)}
                    className={`rounded-full transition-all ${
                      i === slide ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 4. Main Body: Content & Booking Card ── */}
      <div className="container-msari">
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* ─── Left Main Content (70%) ─── */}
          <div className="flex-1 min-w-0 space-y-6 w-full">

            {/* Quick Guarantees Pill Badges */}
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-2xs border border-neutral-200/70 text-xs font-bold text-neutral-800">
                <div className="w-6 h-6 rounded-full bg-[#23096E]/10 flex items-center justify-center text-[#23096E]">
                  <Zap size={13} />
                </div>
                <span>تأكيد فوري للحجز</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-2xs border border-neutral-200/70 text-xs font-bold text-neutral-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Shield size={13} />
                </div>
                <span>إلغاء مجاني متاح</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-2xs border border-neutral-200/70 text-xs font-bold text-neutral-800">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <CreditCard size={13} />
                </div>
                <span>دفع آمن ومرن</span>
              </div>
            </div>

            {/* About Hotel */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-neutral-200/80">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 mb-3">عن الفندق</h2>
              <p className="text-neutral-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {hotel.description || `يتميز فندق ${hotel.name} بموقع استراتيجي في ${hotel.city}، مع تقديم أفضل خدمات الضيافة والغرف المجهزة بأعلى معايير الراحة لضمان إقامة مميزة لا تُنسى.`}
              </p>
            </div>

            {/* Amenities Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-neutral-200/80">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-black text-neutral-900">المرافق والخدمات</h2>
                <span className="text-xs text-neutral-400 font-bold">
                  {(hotel.amenities?.length || FALLBACK_AMENITIES.length)} مرفق متوفر
                </span>
              </div>

              {hotel.amenities && hotel.amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities.map((a, idx) => {
                    const category = typeof a.category === 'string' ? a.category.toUpperCase() : 'GENERAL';
                    const color = CATEGORY_COLORS[category] || '#23096e';
                    const iconName = a.icon
                      ? a.icon.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
                          .replace(/^([a-z])/, (_: string, c: string) => c.toUpperCase())
                      : 'Check';
                    return (
                      <div
                        key={`${a.id || a.name}-${idx}`}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/70 hover:bg-white hover:border-[#23096E]/20 transition-all group"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          <DynIcon name={iconName} size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-neutral-800 truncate">{a.name}</p>
                          {a.nameEn && <p className="text-[10px] text-neutral-400 truncate">{a.nameEn}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FALLBACK_AMENITIES.map((am, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/70 hover:bg-white transition-all"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${am.color}15`, color: am.color }}
                      >
                        <DynIcon name={am.icon} size={18} />
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-neutral-800">{am.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Available Rooms Section ─── */}
            <div id="hotel-rooms" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-neutral-200/80 scroll-mt-28">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-neutral-900">الغرف المتاحة</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">اختر الغرفة المناسبة لمتابعة تفاصيل الحجز</p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#23096E]/10 text-[#23096E]">
                  {hotel.rooms?.length || 0} غرف
                </span>
              </div>

              {hotel.rooms && hotel.rooms.length > 0 ? (
                <div className="space-y-4">
                  {hotel.rooms.map(room => {
                    const roomPrice = room.pricePerNight || hotel.priceFrom;
                    const discountedRoomPrice = hotel.discount
                      ? Math.round(roomPrice * (1 - hotel.discount.percentage / 100))
                      : roomPrice;

                    return (
                      <div
                        key={room.id}
                        className={`rounded-2xl border-2 transition-all overflow-hidden ${
                          !room.isAvailable
                            ? 'border-neutral-100 opacity-60 bg-neutral-50/50'
                            : 'border-neutral-100 hover:border-[#23096E]/40 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Room Image Thumbnail */}
                          <Link
                            href={roomHref(room.id)}
                            className="sm:w-48 h-40 sm:h-auto shrink-0 relative bg-neutral-100 block group"
                          >
                            {room.images && room.images.length > 0 && room.images[0]?.startsWith('http') ? (
                              <Image
                                src={room.images[0]}
                                alt={room.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(min-width: 640px) 192px, 100vw"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-[#23096E]/5">
                                <BedDouble size={28} className="text-[#23096E]/40" />
                                <span className="text-[10px] font-bold">صورة الغرفة</span>
                              </div>
                            )}
                          </Link>

                          {/* Room Details & Actions */}
                          <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                                <div>
                                  <Link
                                    href={roomHref(room.id)}
                                    className="font-black text-base sm:text-lg text-neutral-900 hover:text-[#23096E] transition-colors"
                                  >
                                    {room.name}
                                  </Link>
                                  {room.nameEn && (
                                    <span className="text-xs text-neutral-400 font-medium ms-2">
                                      ({room.nameEn})
                                    </span>
                                  )}
                                </div>

                                <span
                                  className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                                    room.isAvailable
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                      : 'bg-neutral-100 text-neutral-400'
                                  }`}
                                >
                                  {room.isAvailable ? 'متاح للحجز' : 'غير متوفر'}
                                </span>
                              </div>

                              {room.description && (
                                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-3">
                                  {room.description}
                                </p>
                              )}

                              {/* Capacity & Amenities Tags */}
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100/80 px-3 py-1 rounded-xl font-bold">
                                  <Users size={13} className="text-[#23096E]" />
                                  <span>يتسع لـ {room.capacity} {room.capacity === 1 ? 'ضيف' : 'ضيوف'}</span>
                                </span>

                                {room.amenities?.slice(0, 3).map((a, idx) => (
                                  <span
                                    key={`${a.id || a.name}-${idx}`}
                                    className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200/60 px-2.5 py-1 rounded-xl font-medium"
                                  >
                                    {a.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Room Pricing & Action Link */}
                            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 flex-wrap gap-3">
                              <div>
                                <span className="text-[11px] text-neutral-400 font-bold block">السعر للغرفة</span>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl sm:text-2xl font-black text-[#FF3B30]">
                                    {formatPrice(discountedRoomPrice)}
                                  </span>
                                  <span className="text-xs text-neutral-500 font-bold">/ ليلة</span>
                                  {hotel.discount && (
                                    <span className="text-xs text-neutral-400 line-through ms-1">
                                      {formatPrice(roomPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Link
                                href={roomHref(room.id)}
                                className="flex items-center gap-1.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-[#23096E]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <span>تفاصيل الغرفة والحجز</span>
                                <ArrowRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-neutral-200 rounded-2xl">
                  <BedDouble size={36} className="mx-auto text-neutral-300 mb-2" />
                  <p className="text-neutral-500 text-sm font-bold">لا توجد غرف مدخلة حالياً لهذا الفندق</p>
                </div>
              )}
            </div>

            {/* ─── Hotel Policy Section ─── */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-neutral-200/80">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 mb-5 flex items-center gap-2">
                <Shield size={20} className="text-[#23096E]" />
                <span>سياسات الفندق والإقامة</span>
              </h2>

              {/* Check-in / Check-out Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                <div className="flex items-center gap-3 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                  <div className="w-10 h-10 rounded-xl bg-[#23096E]/10 text-[#23096E] flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500 font-bold">تسجيل الوصول</p>
                    <p className="font-black text-sm text-neutral-900 mt-0.5">من الساعة 2:00 ظهراً</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <LogIn size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500 font-bold">تسجيل المغادرة</p>
                    <p className="font-black text-sm text-neutral-900 mt-0.5">حتى الساعة 12:00 ظهراً</p>
                  </div>
                </div>
              </div>

              {/* Additional Guidelines */}
              <div className="space-y-3">
                <div className="flex gap-3 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={16} />
                  </div>
                  <div>
                    <p className="font-black text-xs sm:text-sm text-neutral-900">سياسة الإلغاء</p>
                    <p className="text-xs text-neutral-600 leading-relaxed mt-0.5">
                      الإلغاء المجاني متاح قبل 48 ساعة من تاريخ الوصول المحدد. بعد ذلك قد تُحتسب رسوم الليلة الأولى.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="font-black text-xs sm:text-sm text-neutral-900">إقامة الأطفال</p>
                    <p className="text-xs text-neutral-600 leading-relaxed mt-0.5">
                      الأطفال دون سن 12 سنة يقيمون مجاناً عند مشاركة الأسرّة المتوفرة مع الوالدين.
                    </p>
                  </div>
                </div>
              </div>

              {(hotel.policyAr || hotel.policyEn) && (
                <div className="mt-4 p-4 bg-[#23096E]/5 rounded-2xl border border-[#23096E]/10">
                  <h3 className="font-bold text-xs text-[#23096E] mb-1">تعليمات خاصة بالفندق:</h3>
                  <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                    {currentLocale === 'ar' 
                      ? (hotel.policyAr || hotel.policyEn) 
                      : (hotel.policyEn || hotel.policyAr)}
                  </p>
                </div>
              )}
            </div>

            {/* ─── Location & Map ─── */}
            <div id="hotel-map" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-neutral-200/80 scroll-mt-28">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#23096E]" />
                <span>الموقع والوصول</span>
              </h2>

              <div className="rounded-2xl h-56 flex flex-col items-center justify-center gap-3 border border-neutral-200/70 bg-gradient-to-br from-neutral-50 via-indigo-50/20 to-neutral-100 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#23096E] text-white flex items-center justify-center shadow-lg shadow-[#23096E]/30">
                  <MapPin size={26} />
                </div>
                <div>
                  <p className="font-black text-base text-neutral-900">{hotel.name}</p>
                  <p className="text-xs text-neutral-600 mt-1 max-w-md">
                    {hotel.address || `${hotel.city}، الجمهورية اليمنية`}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* ─── Right Column: Sticky Booking Widget on Desktop ─── */}
          <div className="w-full xl:w-88 shrink-0 xl:sticky xl:top-24">
            <div className="bg-white rounded-3xl shadow-xl border border-neutral-200/80 overflow-hidden">
              {/* Header Gradient Stripe */}
              <div className="h-1.5 bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30]" />

              {/* Price Display */}
              <div className="p-6 border-b border-neutral-100">
                <span className="text-xs text-neutral-400 font-bold block mb-1">يبدأ السعر من</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#FF3B30]">
                    {formatPrice(discounted)}
                  </span>
                  <span className="text-xs text-neutral-500 font-bold">/ ليلة واحدة</span>
                </div>

                {hotel.discount && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-neutral-400 line-through font-bold">
                      {formatPrice(hotel.priceFrom)}
                    </span>
                    <span className="text-[11px] font-black text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 rounded-full">
                      وفرت {formatPrice(hotel.priceFrom - discounted)}
                    </span>
                  </div>
                )}
              </div>

              {/* Stay Inputs (Check-in, Check-out, Guests) */}
              <div className="p-6 space-y-3.5 border-b border-neutral-100 bg-neutral-50/50">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Check-in */}
                  <div className="bg-white p-2.5 rounded-2xl border border-neutral-200/80 focus-within:border-[#23096E] transition-all">
                    <label className="block text-[10px] font-black text-neutral-400 mb-0.5">تاريخ الوصول</label>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#23096E] shrink-0" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={e => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-xs font-bold text-neutral-900 outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="bg-white p-2.5 rounded-2xl border border-neutral-200/80 focus-within:border-[#23096E] transition-all">
                    <label className="block text-[10px] font-black text-neutral-400 mb-0.5">تاريخ المغادرة</label>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#23096E] shrink-0" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full text-xs font-bold text-neutral-900 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="bg-white p-2.5 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#23096E] shrink-0" />
                    <div>
                      <span className="block text-[10px] font-black text-neutral-400">الضيوف</span>
                      <span className="text-xs font-bold text-neutral-900">{guests} نزلاء</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuests(g => Math.max(1, g - 1))}
                      className="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-black text-xs flex items-center justify-center text-neutral-800 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-xs font-black text-neutral-900">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests(g => g + 1)}
                      className="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-black text-xs flex items-center justify-center text-neutral-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-6 space-y-2 border-b border-neutral-100 text-xs sm:text-sm">
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>{formatPrice(discounted)} × {nights} {nights === 1 ? 'ليلة' : 'ليالٍ'}</span>
                  <span className="font-bold text-neutral-900">{formatPrice(discounted * nights)}</span>
                </div>
                {hotel.discount && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>خصم خاص ({hotel.discount.percentage}%)</span>
                    <span>− {formatPrice((hotel.priceFrom - discounted) * nights)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base border-t border-neutral-100 pt-3 mt-2 text-neutral-900">
                  <span>الإجمالي التقديري</span>
                  <span className="text-[#23096E]">{formatPrice(discounted * nights)}</span>
                </div>
              </div>

              {/* CTA Action */}
              <div className="p-6">
                <a
                  href="#hotel-rooms"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#hotel-rooms')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full h-12 bg-gradient-to-r from-[#23096E] to-[#3A1C8F] hover:from-[#1A0654] hover:to-[#23096E] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#23096E]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>اختر الغرفة المناسبة</span>
                  <ArrowRight size={16} />
                </a>

                <p className="text-center text-[11px] text-neutral-400 font-medium mt-3">
                  تأكيد الحجز الفوري وإمكانية الدفع عند الوصول
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 5. Fullscreen Lightbox Image Modal ── */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-fade-in">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="text-neutral-300">{hotel.name}</span>
              <span>•</span>
              <span className="text-neutral-400">{lightboxIndex + 1} من {total}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Main Image & Arrows */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + total) % total)}
                  className="absolute start-2 sm:start-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all"
                >
                  <ChevronRight size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % total)}
                  className="absolute end-2 sm:end-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
              </>
            )}

            <div className="relative w-full max-w-5xl h-[65vh] sm:h-[75vh]">
              <Image
                src={slides[lightboxIndex].src}
                alt={slides[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Lightbox Thumbnail Strip */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-3xl mx-auto no-scrollbar">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    idx === lightboxIndex ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={s.src} alt={s.alt} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
