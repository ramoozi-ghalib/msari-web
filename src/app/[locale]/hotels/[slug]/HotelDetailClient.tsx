'use client';

import { useState, useEffect, useCallback, type ComponentType, type CSSProperties } from 'react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import {
  MapPin, Star, Share2, Users, Check, ArrowLeft,
  ChevronLeft, ChevronRight as ChevronR, Clock, X,
  Shield, Zap, CreditCard, BedDouble, ExternalLink,
  Sparkles, Maximize2, CheckCircle2, Bath
} from 'lucide-react';
import type { Hotel } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

const toIconRecord = LucideIcons as unknown as Record<string, ComponentType<{ size?: number; className?: string; style?: CSSProperties; color?: string }>>;

/* ─── Default slides (Unsplash) ─── */
const DEFAULT_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop', alt: 'واجهة الفندق' },
  { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop', alt: 'غرفة الفندق' },
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
  GENERAL: '#23096e', WELLNESS: '#0284c7', DINING: '#d97706',
  SPORT: '#16a34a', BUSINESS: '#7c3aed', ROOM: '#db2777',
};

/* ─── Fallback amenities ─── */
const FALLBACK_AMENITIES = [
  { name: 'واي فاي مجاني',     icon: 'Wifi',           color: '#23096e' },
  { name: 'موقف سيارات',       icon: 'Car',            color: '#16a34a' },
  { name: 'خدمة الغرف',        icon: 'BellRing',       color: '#d97706' },
  { name: 'مطعم',              icon: 'UtensilsCrossed', color: '#7c3aed' },
  { name: 'مصعد',              icon: 'ArrowUpDown',     color: '#0284c7' },
  { name: 'حراسة أمنية',       icon: 'ShieldCheck',    color: '#059669' },
];

interface Props {
  hotel: Hotel;
}

export default function HotelDetailClient({ hotel }: Props) {
  const searchParams = useSearchParams();
  const { locale } = useParams();
  const currentLocale = (locale as string) || 'ar';

  const [slide, setSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Preserve search parameters for room detail navigation
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';
  const cityParam = searchParams.get('city') || hotel.city;
  const bookingError = searchParams.get('bookingError') || '';

  // Handle Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${hotel.name} | مساري`,
      text: `احجز إقامتك في ${hotel.name} بمدينة ${hotel.city} بأفضل الأسعار عبر مساري`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const isValidUrl = (url: string) => Boolean(url?.startsWith('http'));
  const validImages = hotel.images?.filter(isValidUrl) || [];
  const slides = validImages.length
    ? validImages.map(src => ({ src, alt: hotel.name }))
    : DEFAULT_SLIDES;
  const total = slides.length;
  const go = useCallback((n: number) => setSlide((n + total) % total), [total]);

  // Slideshow auto-advance (only when lightbox is closed)
  useEffect(() => {
    if (total <= 1 || isLightboxOpen) return;
    const t = setInterval(() => go(slide + 1), 6000);
    return () => clearInterval(t);
  }, [slide, go, total, isLightboxOpen]);

  const { formatPrice } = useCurrency();
  const discounted = hotel.discount
    ? Math.round(hotel.priceFrom * (1 - hotel.discount.percentage / 100))
    : hotel.priceFrom;

  const roomHref = (roomId: string) => {
    const params = new URLSearchParams();
    if (cityParam) params.set('city', cityParam);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    return `/${currentLocale}/hotels/${hotel.slug}/rooms/${roomId}?${params.toString()}`;
  };

  const googleMapsUrl = hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.address || ''} ${hotel.city} اليمن`)}`;

  return (
    <div className="bg-[#F8F9FC] min-h-screen pb-20 pt-6">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-4 overflow-x-auto whitespace-nowrap pb-1">
          <Link href={`/${currentLocale}`} className="hover:text-[#23096e] transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} className="text-neutral-400 shrink-0" />
          <Link href={`/${currentLocale}/hotels`} className="hover:text-[#23096e] transition-colors">فنادق اليمن</Link>
          {hotel.city && (
            <>
              <ChevronLeft size={12} className="text-neutral-400 shrink-0" />
              <Link href={`/${currentLocale}/hotels?city=${encodeURIComponent(hotel.city)}`} className="hover:text-[#23096e] transition-colors">
                {hotel.city}
              </Link>
            </>
          )}
          <ChevronLeft size={12} className="text-neutral-400 shrink-0" />
          <span className="text-neutral-900 font-bold truncate max-w-xs">{hotel.name}</span>
        </nav>

        {/* ─── Booking Error Alert ─── */}
        {bookingError && (
          <div role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium">
            {bookingError}
          </div>
        )}

        {/* ─── 1. GALLERY AT TOP ─── */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-neutral-100 bg-neutral-900 mb-6 aspect-[16/10] sm:aspect-[21/9] max-h-[540px] group">
          {slides.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 cursor-pointer"
              style={{ opacity: i === slide ? 1 : 0, pointerEvents: i === slide ? 'auto' : 'none' }}
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          ))}

          {/* Navigation Controls */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(slide - 1); }}
                className="absolute start-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all hover:scale-105"
                title="الصورة السابقة"
              >
                <ChevronR size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(slide + 1); }}
                className="absolute end-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all hover:scale-105"
                title="الصورة التالية"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Photo Count Badge */}
              <div className="absolute top-4 start-4 z-20 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <span>{slide + 1} / {total}</span>
              </div>

              {/* View All Photos Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 end-4 z-20 bg-white/95 hover:bg-white text-neutral-900 text-xs font-black px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <Maximize2 size={14} className="text-[#23096e]" />
                عرض جميع الصور ({total})
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none">
                <div className="flex gap-1.5 pointer-events-auto bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-xs">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); go(i); }}
                      className={`rounded-full transition-all duration-300 ${i === slide ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── 2. HOTEL HEADER & BASIC INFO (UNDER GALLERY) ─── */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-100 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {/* Hotel Name & Category Stars */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
                  {hotel.name}
                </h1>
                {/* Hotel Category Stars Only */}
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-800 me-0.5">
                    فندق {hotel.stars || 4} نجوم
                  </span>
                </div>
              </div>

              {/* Location Address */}
              <div className="flex items-center gap-1.5 text-neutral-500 text-sm mt-2">
                <MapPin size={15} className="text-[#23096e] shrink-0" />
                <span>{hotel.address || `${hotel.city}، اليمن`}</span>
              </div>
            </div>

            {/* Price Preview & Share Button */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-start bg-neutral-50 border border-neutral-100 px-4 py-2 rounded-xl">
                <span className="text-[10px] font-bold text-neutral-400 block">يبدأ السعر من</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-[#23096e]">{formatPrice(discounted)}</span>
                  <span className="text-neutral-400 text-xs">/ ليلة</span>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                title="مشاركة الفندق"
                className="w-11 h-11 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-600 animate-scale-in" /> : <Share2 size={18} />}
              </button>
            </div>
          </div>

          {/* Copy Toast Alert */}
          {copied && (
            <div className="mt-3 p-2.5 bg-green-50 text-green-800 text-xs font-bold rounded-xl border border-green-200 flex items-center gap-2 animate-fade-in">
              <Check size={14} className="text-green-600 shrink-0" />
              تم نسخ رابط الفندق إلى الحافظة بنجاح!
            </div>
          )}
        </div>

        {/* ─── 3. QUICK HIGHLIGHTS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="flex items-center gap-2.5 bg-white rounded-xl p-3.5 shadow-sm border border-neutral-100">
            <div className="w-9 h-9 rounded-lg bg-[#23096e]/10 text-[#23096e] flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-neutral-900">تأكيد فوري</p>
              <p className="text-[11px] text-neutral-400">حجز مباشر ومؤكد</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white rounded-xl p-3.5 shadow-sm border border-neutral-100">
            <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-neutral-900">إلغاء مجاني</p>
              <p className="text-[11px] text-neutral-400">مرونة قبل الوصول</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white rounded-xl p-3.5 shadow-sm border border-neutral-100">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-neutral-900">دفع عند الوصول</p>
              <p className="text-[11px] text-neutral-400">أو تحويل بنكي معتمد</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white rounded-xl p-3.5 shadow-sm border border-neutral-100">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-neutral-900">أفضل سعر</p>
              <p className="text-[11px] text-neutral-400">أسعار حصرية ومنافسة</p>
            </div>
          </div>
        </div>

        {/* ─── 4. MAIN CONTENT SECTIONS ─── */}
        <div className="space-y-8">

          {/* About Hotel */}
          {hotel.description && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 mb-3">عن الفندق</h2>
              <p className="text-neutral-600 leading-8 text-sm sm:text-[15px] whitespace-pre-line">
                {hotel.description}
              </p>
            </div>
          )}

          {/* Amenities & Services */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 mb-5">المرافق والخدمات المتاحة</h2>
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {hotel.amenities.map((a, idx) => {
                  const category = typeof a.category === 'string' ? a.category.toUpperCase() : 'GENERAL';
                  const color = CATEGORY_COLORS[category] || '#23096e';
                  const iconName = a.icon
                    ? a.icon.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
                        .replace(/^([a-z])/, (_: string, c: string) => c.toUpperCase())
                    : 'Check';
                  return (
                    <div key={`${a.id || a.name}-${idx}`} className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/80 hover:bg-neutral-50 hover:border-neutral-200 transition-colors">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}14`, color }}>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {FALLBACK_AMENITIES.map(am => (
                  <div key={am.name} className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/80">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${am.color}14`, color: am.color }}>
                      <DynIcon name={am.icon} size={18} />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-neutral-800">{am.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. AVAILABLE ROOMS AS HORIZONTAL ROW CARDS (LIST LAYOUT) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900">الغرف المتاحة للحجز</h2>
                <p className="text-xs text-neutral-500 mt-0.5">اختر الغرفة المناسبة للاطلاع على كافة تفاصيلها ومتابعة الحجز</p>
              </div>
              <span className="text-xs font-bold text-[#23096e] bg-[#23096e]/10 px-3 py-1.5 rounded-full">
                {hotel.rooms?.length || 0} غرف معتمدة
              </span>
            </div>

            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div className="space-y-4">
                {hotel.rooms.map(room => (
                  <div
                    key={room.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col md:flex-row bg-white ${
                      !room.isAvailable
                        ? 'border-neutral-200 opacity-60'
                        : 'border-neutral-200/80 hover:border-[#23096e]/40 hover:shadow-md'
                    }`}
                  >
                    {/* Room Thumbnail (Horizontal on Desktop) */}
                    <Link
                      href={roomHref(room.id)}
                      className="w-full md:w-64 lg:w-72 aspect-[16/10] md:aspect-auto shrink-0 relative block bg-neutral-100 overflow-hidden group min-h-[190px]"
                    >
                      {room.images && room.images.length > 0 && room.images[0]?.startsWith('http') ? (
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23096e]/5 to-[#3A1C8F]/10">
                          <BedDouble size={36} className="text-[#23096e]/30" />
                        </div>
                      )}
                      
                      {/* Availability Tag */}
                      <span className={`absolute top-3 start-3 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                        room.isAvailable ? 'bg-green-600 text-white' : 'bg-neutral-800 text-white'
                      }`}>
                        {room.isAvailable ? 'متاح للحجز' : 'محجوز حالياً'}
                      </span>
                    </Link>

                    {/* Room Details & Actions */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        {/* Title & Name */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <Link
                              href={roomHref(room.id)}
                              className="font-black text-lg sm:text-xl text-neutral-900 hover:text-[#23096e] transition-colors"
                            >
                              {room.name}
                            </Link>
                            {room.nameEn && <p className="text-xs text-neutral-400 font-medium mt-0.5">{room.nameEn}</p>}
                          </div>
                        </div>

                        {room.description && (
                          <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-6 line-clamp-2">{room.description}</p>
                        )}

                        {/* Specs & Features Badges */}
                        <div className="flex items-center flex-wrap gap-2 mt-3.5">
                          <span className="flex items-center gap-1.5 text-xs text-neutral-700 bg-neutral-50 border border-neutral-200/70 px-2.5 py-1.5 rounded-lg">
                            <Users size={14} className="text-[#23096e]" />
                            حتى {room.capacity} {room.capacity === 1 ? 'ضيف' : 'ضيوف'}
                          </span>
                          {room.numberOfBeds && (
                            <span className="flex items-center gap-1.5 text-xs text-neutral-700 bg-neutral-50 border border-neutral-200/70 px-2.5 py-1.5 rounded-lg">
                              <BedDouble size={14} className="text-[#23096e]" />
                              {room.numberOfBeds} {room.numberOfBeds === 1 ? 'سرير' : 'أسرّة'}
                            </span>
                          )}
                          {room.numberOfBathrooms && (
                            <span className="flex items-center gap-1.5 text-xs text-neutral-700 bg-neutral-50 border border-neutral-200/70 px-2.5 py-1.5 rounded-lg">
                              <Bath size={14} className="text-[#23096e]" />
                              {room.numberOfBathrooms} {room.numberOfBathrooms === 1 ? 'حمام' : 'حمامات'}
                            </span>
                          )}
                          {room.amenities?.slice(0, 3).map((a, idx) => (
                            <span key={`${a.id || a.name}-${idx}`} className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200/70 px-2.5 py-1.5 rounded-lg">
                              {a.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Room Price & Action Button */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <span className="text-[10px] text-neutral-400 font-bold block">السعر / ليلة</span>
                          <span className="text-xl sm:text-2xl font-black text-[#23096e]">
                            {formatPrice(room.pricePerNight)}
                          </span>
                        </div>

                        <Link
                          href={roomHref(room.id)}
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#23096e] to-[#3A1C8F] hover:from-[#1d075c] hover:to-[#2e1572] transition-all shadow-sm hover:shadow active:scale-[0.98]"
                        >
                          عرض تفاصيل الغرفة والحجز
                          <ArrowLeft size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-100">
                <BedDouble size={36} className="mx-auto text-neutral-300 mb-2" />
                <p className="font-bold text-neutral-700 text-sm">لا توجد غرف مدرجة حالياً في هذا الفندق</p>
                <p className="text-xs text-neutral-400 mt-1">يرجى مراجعة إدارة الفندق أو البحث في فنادق أخرى</p>
              </div>
            )}
          </div>

          {/* 6. Hotel Policies */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 mb-5 flex items-center gap-2">
              <Shield size={20} className="text-[#23096e]" /> سياسات وإرشادات الإقامة
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {[
                { icon: <Clock size={16} />, label: 'موعد تسجيل الوصول (Check-in)', value: 'من الساعة 2:00 ظهراً', color: '#23096e' },
                { icon: <Clock size={16} />, label: 'موعد تسجيل المغادرة (Check-out)', value: 'قبل الساعة 12:00 ظهراً', color: '#d97706' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-4 bg-neutral-50/80 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}14`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">{item.label}</p>
                    <p className="font-bold text-sm text-neutral-900 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { icon: <Check size={14} />, label: 'سياسة الإلغاء والمرونة', text: 'الإلغاء المجاني متاح قبل 48 ساعة من موعد الوصول. في حال الإلغاء المتأخر قد تُحتسب رسوم ليلة واحدة.', color: '#16a34a' },
                { icon: <Users size={14} />, label: 'سياسة الأطفال والإقامة الإضافية', text: 'الأطفال دون سن 12 عاماً يقيمون مجاناً عند استخدام الأسرّة المتاحة في الغرفة. السرير الإضافي يخضع لتكلفة منفصلة.', color: '#0284c7' },
                { icon: <Check size={14} />, label: 'إثبات الهوية والوصول', text: 'يُرجى إبراز الهوية الوطنية أو جواز السفر الأصلي عند مكتب الاستقبال أثناء تسجيل الوصول.', color: '#23096e' },
              ].map(item => (
                <div key={item.label} className="flex gap-3 p-4 bg-neutral-50/80 rounded-xl border border-neutral-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}14`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-neutral-900">{item.label}</p>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-6 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {(hotel.policyAr || hotel.policyEn) && (
              <div className="mt-5 p-5 bg-indigo-50/40 rounded-xl border border-indigo-100/60">
                <h3 className="font-bold text-sm text-neutral-900 mb-2">تعليمات وسياسات إضافية خاصة بالفندق:</h3>
                <p className="text-xs sm:text-sm text-neutral-700 leading-7 whitespace-pre-line">
                  {currentLocale === 'ar' ? (hotel.policyAr || hotel.policyEn) : (hotel.policyEn || hotel.policyAr)}
                </p>
              </div>
            )}
          </div>

          {/* 7. Location & Google Maps */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 flex items-center gap-2">
                <MapPin size={20} className="text-[#23096e]" />
                موقع الفندق
              </h2>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#23096e] bg-[#23096e]/10 hover:bg-[#23096e]/20 px-3.5 py-2 rounded-xl transition-colors"
              >
                افتح الموقع في خرائط Google
                <ExternalLink size={13} />
              </a>
            </div>

            <div
              className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 border border-neutral-200/70 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(35, 9, 110, 0.04), rgba(58, 28, 143, 0.08))' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#23096e]/15 flex items-center justify-center text-[#23096e] shadow-sm">
                <MapPin size={28} />
              </div>
              <div>
                <p className="font-black text-base text-neutral-800">{hotel.address || hotel.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{hotel.city}، الجمهورية اليمنية</p>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-800 hover:border-[#23096e] hover:text-[#23096e] shadow-sm transition-all"
              >
                الاتجاهات عبر Google Maps
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* ─── Lightbox Modal for Fullscreen Gallery ─── */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{hotel.name}</span>
              <span className="text-xs text-white/60">• صورة {slide + 1} من {total}</span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="إغلاق المعرض"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Active Image */}
          <div
            className="relative flex-1 w-full max-w-5xl mx-auto my-4 flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-h-[75vh]">
              <Image
                src={slides[slide].src}
                alt={slides[slide].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {total > 1 && (
              <>
                <button
                  onClick={() => go(slide - 1)}
                  className="absolute start-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all"
                  title="السابق"
                >
                  <ChevronR size={24} />
                </button>
                <button
                  onClick={() => go(slide + 1)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all"
                  title="التالي"
                >
                  <ChevronLeft size={24} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          {total > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto py-2 z-10 max-w-3xl mx-auto px-4"
              onClick={e => e.stopPropagation()}
            >
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    i === slide ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={s.src} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
