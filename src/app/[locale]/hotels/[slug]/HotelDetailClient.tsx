'use client';

import { useState, useEffect, useCallback, type ComponentType, type CSSProperties } from 'react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import {
  MapPin, Star, Share2, Users, Check, X,
  ChevronLeft, ChevronRight as ChevronR,
  Shield, BedDouble, ExternalLink, Maximize2, CheckCircle2,
  Navigation
} from 'lucide-react';
import type { Hotel } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import HotelCard from '@/components/ui/HotelCard';

const toIconRecord = LucideIcons as unknown as Record<string, ComponentType<{ size?: number; className?: string; style?: CSSProperties; color?: string }>>;

/* ─── Default slides (Unsplash) ─── */
const DEFAULT_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop', alt: 'واجهة الفندق' },
  { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop', alt: 'غرفة الفندق' },
];

/* ─── Dynamic Lucide icon mapping ─── */
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

const DynIcon = ({ name, size = 14 }: { name: string; size?: number }) => {
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

/**
 * Parses policy text into discrete bullet points:
 * - Breaks sentences on dots (.)
 * - Separates check-in / check-out into individual lines
 */
function parsePolicyLines(rawText?: string): string[] {
  if (!rawText || !rawText.trim()) {
    return [
      'تسجيل الوصول: من الساعة 02:00 ظهراً.',
      'تسجيل المغادرة: حتى الساعة 12:00 ظهراً.',
      'تطبق الشروط والأحكام العامة المعتمدة للفندق عند تسجيل الوصول والإقامة.'
    ];
  }

  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result: string[] = [];

  for (const line of rawLines) {
    // Separate inline check-in and check-out mentions
    const normalized = line
      .replace(/([،,;])\s*(تسجيل المغادرة|وقت المغادرة|Check-out|Checkout)/gi, '.\n$2')
      .replace(/(تسجيل الوصول|وقت الوصول|Check-in|Checkin)/gi, '\n$1');

    const subSegments = normalized.split(/\n+/).map(s => s.trim()).filter(Boolean);
    for (const sub of subSegments) {
      // Split on period followed by space
      const sentenceParts = sub.split(/(?<=\.)\s+/).map(p => p.trim()).filter(Boolean);
      for (let part of sentenceParts) {
        part = part.replace(/^[-•*–]\s*/, '').trim();
        if (part) {
          result.push(part);
        }
      }
    }
  }

  return result.length > 0 ? result : [rawText];
}

interface Props {
  hotel: Hotel;
  nearbyHotels?: Hotel[];
}

export default function HotelDetailClient({ hotel, nearbyHotels = [] }: Props) {
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
        // Fallback
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

  // Slideshow auto-advance
  useEffect(() => {
    if (total <= 1 || isLightboxOpen) return;
    const t = setInterval(() => go(slide + 1), 6000);
    return () => clearInterval(t);
  }, [slide, go, total, isLightboxOpen]);

  const { formatPrice } = useCurrency();

  const roomHref = (roomId: string) => {
    const params = new URLSearchParams();
    if (cityParam) params.set('city', cityParam);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    return `/${currentLocale}/hotels/${hotel.slug}/rooms/${roomId}?${params.toString()}`;
  };

  const googleMapsUrl = hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.address || ''} ${hotel.city} اليمن`)}`;
  
  const rawPolicy = currentLocale === 'ar' ? (hotel.policyAr || hotel.policyEn) : (hotel.policyEn || hotel.policyAr);
  const policyLines = parsePolicyLines(rawPolicy);

  return (
    <div className="bg-[#F8F9FC] min-h-screen pb-20">

      {bookingError && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium">
            {bookingError}
          </div>
        </div>
      )}

      {/* ─── 1. FULL-WIDTH IMAGE SLIDER ─── */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] max-h-[560px] overflow-hidden group bg-neutral-900">
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
              className="object-contain sm:object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}

        {total > 1 && (
          <>
            <button
              onClick={() => go(slide - 1)}
              className="absolute start-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-lg flex items-center justify-center transition-all hover:scale-105"
              title="السابق"
            >
              <ChevronR size={22} />
            </button>
            <button
              onClick={() => go(slide + 1)}
              className="absolute end-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-lg flex items-center justify-center transition-all hover:scale-105"
              title="التالي"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Photo Counter Badge */}
            <div className="absolute top-4 start-4 z-20 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              {slide + 1} / {total}
            </div>

            {/* View Full Photos Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 end-4 z-20 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-1.5 transition-all"
            >
              <Maximize2 size={13} />
              <span>الصور ({total})</span>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none">
              <div className="flex gap-1.5 pointer-events-auto">
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

        {/* Top Share Button */}
        <div className="absolute top-4 end-4 z-20">
          <button
            onClick={handleShare}
            title="مشاركة الفندق"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition-all"
          >
            {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Share2 size={17} />}
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Copy Toast Message */}
        {copied && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 text-xs font-bold rounded-xl border border-green-200 flex items-center gap-2 animate-fade-in">
            <Check size={14} className="text-green-600 shrink-0" />
            تم نسخ رابط الفندق إلى الحافظة بنجاح!
          </div>
        )}

        {/* ─── 2. HOTEL NAME & OPPOSITE STARS ROW + ABOUT UNDER IT ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          
          {/* Row 1: Name on right + Stars opposite on left */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
              {hotel.name}
            </h1>

            {/* Stars Only (Opposite in the same row) */}
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>

          {/* Row 2: Address with MapPin */}
          <div className="flex items-center gap-1.5 text-neutral-500 text-sm mt-2">
            <MapPin size={15} className="text-[#23096e] shrink-0" />
            <span>{hotel.address || `${hotel.city}، اليمن`}</span>
          </div>

          {/* Row 3: About Hotel directly underneath */}
          {hotel.description && (
            <div className="mt-5 pt-5 border-t border-neutral-100">
              <h2 className="text-base font-black text-neutral-900 mb-2">عن الفندق</h2>
              <p className="text-neutral-600 leading-7 text-sm whitespace-pre-line">
                {hotel.description}
              </p>
            </div>
          )}
        </div>

        {/* ─── 3. AMENITIES SECTION ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-black text-neutral-900 mb-4">المرافق والخدمات</h2>
          
          {hotel.amenities && hotel.amenities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {hotel.amenities.map((a, idx) => {
                const category = typeof a.category === 'string' ? a.category.toUpperCase() : 'GENERAL';
                const color = CATEGORY_COLORS[category] || '#23096e';
                const iconName = a.icon
                  ? a.icon.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
                      .replace(/^([a-z])/, (_: string, c: string) => c.toUpperCase())
                  : 'Check';
                return (
                  <div key={`${a.id || a.name}-${idx}`} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-100 bg-neutral-50">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}14`, color }}>
                      <DynIcon name={iconName} size={14} />
                    </div>
                    <span className="font-bold text-xs text-neutral-800 truncate">{a.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
              {FALLBACK_AMENITIES.map(am => (
                <div key={am.name} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-100 bg-neutral-50">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${am.color}14`, color: am.color }}>
                    <DynIcon name={am.icon} size={14} />
                  </div>
                  <span className="font-bold text-xs text-neutral-800">{am.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── 4. AVAILABLE ROOMS SECTION ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-black text-neutral-900 mb-4">الغرف المتاحة</h2>

          {hotel.rooms && hotel.rooms.length > 0 ? (
            <div className="space-y-4">
              {hotel.rooms.map(room => (
                <div
                  key={room.id}
                  className="rounded-2xl border border-neutral-200 overflow-hidden flex flex-col sm:flex-row bg-white hover:border-[#23096e]/30 transition-colors"
                >
                  {/* Room Thumbnail */}
                  <Link
                    href={roomHref(room.id)}
                    className="sm:w-56 h-44 sm:h-auto shrink-0 relative block bg-neutral-100 overflow-hidden group"
                  >
                    {room.images && room.images.length > 0 && room.images[0]?.startsWith('http') ? (
                      <Image
                        src={room.images[0]}
                        alt={room.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 224px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23096e]/5 to-[#3A1C8F]/10">
                        <BedDouble size={36} className="text-[#23096e]/30" />
                      </div>
                    )}
                  </Link>

                  {/* Room Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <Link
                        href={roomHref(room.id)}
                        className="font-black text-lg text-neutral-900 hover:text-[#23096e] transition-colors block"
                      >
                        {room.name}
                      </Link>
                      {room.nameEn && <p className="text-xs text-neutral-400 font-medium mt-0.5">{room.nameEn}</p>}

                      {/* Basic Specs */}
                      <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium mt-3">
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-[#23096e]" />
                          حتى {room.capacity} {room.capacity === 1 ? 'ضيف' : 'ضيوف'}
                        </span>
                        {room.numberOfBeds && (
                          <span className="flex items-center gap-1">
                            <BedDouble size={14} className="text-[#23096e]" />
                            {room.numberOfBeds} {room.numberOfBeds === 1 ? 'سرير' : 'أسرّة'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price in official red (#FF3B30) & Subtle-rounded rectangular button */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-medium">السعر / ليلة</span>
                        <span className="text-xl sm:text-2xl font-black text-[#FF3B30]">
                          {formatPrice(room.pricePerNight)}
                        </span>
                      </div>

                      {/* Square button with very subtle corners (rounded-[4px]) */}
                      <Link
                        href={roomHref(room.id)}
                        className="h-10 px-5 rounded-[4px] bg-[#23096E] hover:bg-[#1a0654] text-white text-xs sm:text-sm font-bold flex items-center justify-center transition-all duration-200 shadow-sm shrink-0"
                      >
                        عرض الغرفة
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-neutral-50 rounded-xl border border-neutral-100">
              <BedDouble size={36} className="mx-auto text-neutral-300 mb-2" />
              <p className="font-bold text-neutral-700 text-sm">لا توجد غرف مدرجة حالياً</p>
            </div>
          )}
        </div>

        {/* ─── 5. HOTEL POLICIES WITH BULLET POINT LINE BREAKS ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-6">
          <h2 className="text-lg font-black text-neutral-900 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-[#23096e]" /> سياسة الفندق
          </h2>

          <div className="p-4 bg-neutral-50/80 rounded-xl border border-neutral-100 space-y-2.5">
            {policyLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700 leading-6">
                <span className="text-[#23096e] font-black text-base leading-5 select-none shrink-0">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 6. MAP CARD WITH CLICKABLE STATIC MAP VISUAL ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mb-8">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <MapPin size={18} className="text-[#23096e]" />
              الموقع
            </h2>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#23096e] hover:underline"
            >
              افتح في خرائط Google
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Clickable Map Display Card */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-neutral-200 block relative group cursor-pointer shadow-inner"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(35, 9, 110, 0.06) 0%, rgba(35, 9, 110, 0.12) 100%), linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, #f8fafc 1px)`,
              backgroundSize: '100% 100%, 32px 32px, 32px 32px'
            }}
          >
            {/* Map Roads & Geography Stylized Graphic */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50,120 Q150,80 350,140 T750,100 T1150,130" stroke="#cbd5e1" strokeWidth="8" fill="none" />
                <path d="M100,-50 Q160,180 200,380 T260,580" stroke="#cbd5e1" strokeWidth="6" fill="none" />
                <path d="M400,-50 Q360,180 380,380 T420,580" stroke="#cbd5e1" strokeWidth="10" fill="none" />
                <path d="M-50,220 Q250,260 550,200 T1150,240" stroke="#cbd5e1" strokeWidth="6" fill="none" />
              </svg>
            </div>

            {/* Center Map Pin with Pulse */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#FF3B30]/15 animate-ping absolute inset-0" />
                <div className="w-16 h-16 rounded-2xl bg-[#23096E] text-white shadow-xl flex items-center justify-center relative transition-transform duration-300 group-hover:scale-110">
                  <MapPin size={30} className="text-[#FF3B30]" />
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-lg border border-neutral-200/80 text-center max-w-sm">
                <p className="font-black text-sm text-neutral-900">{hotel.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{hotel.address || `${hotel.city}، اليمن`}</p>
              </div>

              <span className="inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl bg-[#23096E] text-white shadow-md transition-transform duration-200 group-hover:scale-105">
                <Navigation size={13} />
                افتح في خرائط Google
              </span>
            </div>
          </a>
        </div>

        {/* ─── 7. NEARBY HOTELS SECTION (CLOSEST 3 HOTELS) ─── */}
        {nearbyHotels && nearbyHotels.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900">الفنادق القريبة</h2>
              <Link
                href={`/${currentLocale}/hotels?city=${encodeURIComponent(hotel.city)}`}
                className="text-xs font-bold text-[#23096e] hover:underline"
              >
                عرض كل فنادق {hotel.city}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbyHotels.map(nearby => (
                <HotelCard key={nearby.id} hotel={nearby} />
              ))}
            </div>
          </div>
        )}

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
