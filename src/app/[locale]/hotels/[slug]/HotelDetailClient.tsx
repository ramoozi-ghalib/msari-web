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
  Sparkles, Maximize2, CheckCircle2, Bath, CheckCheck,
  Building2, Layers, Compass, ArrowDown
} from 'lucide-react';
import type { Hotel } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

const toIconRecord = LucideIcons as unknown as Record<string, ComponentType<{ size?: number; className?: string; style?: CSSProperties; color?: string }>>;

/* ─── Default fallback slides (Unsplash Luxury Hotels) ─── */
const DEFAULT_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop', alt: 'واجهة الفندق' },
  { src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop', alt: 'جناح فندقي فاخر' },
  { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop', alt: 'غرفة نوم فندقية' },
  { src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop', alt: 'صالة الاستقبال' },
  { src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop', alt: 'المرافق والخدمات' },
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
  { name: 'واي فاي مجاني فائق السرعة', icon: 'Wifi',           color: '#23096e', category: 'GENERAL' },
  { name: 'موقف سيارات مجاني',       icon: 'Car',            color: '#16a34a', category: 'GENERAL' },
  { name: 'خدمة الغرف على مدار 24/7',  icon: 'BellRing',       color: '#d97706', category: 'ROOM' },
  { name: 'مطعم وبوفيه مأكولات',       icon: 'UtensilsCrossed', color: '#7c3aed', category: 'DINING' },
  { name: 'مصاعد حديثة وسريعة',        icon: 'ArrowUpDown',     color: '#0284c7', category: 'GENERAL' },
  { name: 'حراسة وأمان على مدار الساعة', icon: 'ShieldCheck',    color: '#059669', category: 'BUSINESS' },
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
  const [activeSection, setActiveSection] = useState('overview');

  // Search parameters for room detail navigation
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
        // User dismissed share dialog
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback failed
    }
  };

  const isValidUrl = (url: string) => Boolean(url?.startsWith('http'));
  const validImages = hotel.images?.filter(isValidUrl) || [];
  const slides = validImages.length >= 2
    ? validImages.map(src => ({ src, alt: hotel.name }))
    : validImages.length === 1
      ? [{ src: validImages[0], alt: hotel.name }, ...DEFAULT_SLIDES.slice(1)]
      : DEFAULT_SLIDES;

  const total = slides.length;
  const go = useCallback((n: number) => setSlide((n + total) % total), [total]);

  // Slideshow auto-advance on mobile carousel
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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const googleMapsUrl = hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.address || ''} ${hotel.city} اليمن`)}`;

  return (
    <div className="bg-[#F8F9FC] min-h-screen pb-24 pt-4">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── 1. BREADCRUMBS ─── */}
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

        {/* ─── 2. WORLD-CLASS PHOTO GALLERY ─── */}
        <div className="relative mb-6">
          
          {/* Desktop Mosaic / Bento Grid Gallery (hidden on mobile, visible on md+) */}
          <div className="hidden md:grid grid-cols-12 gap-2.5 h-[460px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-neutral-900 border border-neutral-100/80">
            
            {/* Main Featured Photo (Right Side in RTL) */}
            <div
              className="col-span-7 relative h-full cursor-pointer overflow-hidden group"
              onClick={() => { setSlide(0); setIsLightboxOpen(true); }}
            >
              <Image
                src={slides[0].src}
                alt={slides[0].alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority
                sizes="(max-width: 1200px) 60vw, 720px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 start-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
                <Maximize2 size={13} />
                <span>تكبير الصورة</span>
              </div>
            </div>

            {/* 4 Small Grid Photos (Left Side in RTL) */}
            <div className="col-span-5 grid grid-cols-2 gap-2.5 h-full">
              {slides.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-full cursor-pointer overflow-hidden group"
                  onClick={() => { setSlide(idx + 1); setIsLightboxOpen(true); }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1200px) 25vw, 300px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              ))}
              {/* Fill placeholders if less than 5 images */}
              {Array.from({ length: Math.max(0, 4 - slides.slice(1, 5).length) }).map((_, placeholderIdx) => (
                <div key={`ph-${placeholderIdx}`} className="relative h-full bg-gradient-to-br from-[#23096e]/10 to-[#3A1C8F]/20 flex items-center justify-center">
                  <Building2 size={28} className="text-[#23096e]/30" />
                </div>
              ))}
            </div>

            {/* Floating "View All Photos" Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-5 end-5 z-20 bg-white/95 hover:bg-white text-neutral-900 text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 border border-neutral-200/80 active:scale-95"
            >
              <Maximize2 size={14} className="text-[#23096e]" />
              <span>عرض جميع الصور ({total})</span>
            </button>
          </div>

          {/* Mobile Full Carousel (visible only on mobile) */}
          <div className="md:hidden relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-md bg-neutral-900 border border-neutral-100">
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
                  sizes="100vw"
                />
              </div>
            ))}

            {total > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); go(slide - 1); }}
                  className="absolute start-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 text-neutral-800 shadow-md flex items-center justify-center active:scale-95"
                >
                  <ChevronR size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); go(slide + 1); }}
                  className="absolute end-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 text-neutral-800 shadow-md flex items-center justify-center active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Mobile Photo Count Badge */}
                <div className="absolute top-3 start-3 z-20 bg-black/60 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  {slide + 1} / {total}
                </div>

                {/* Mobile View All Button */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 end-3 z-20 bg-white/95 text-neutral-900 text-[11px] font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Maximize2 size={12} className="text-[#23096e]" />
                  <span>الصور ({total})</span>
                </button>
              </>
            )}
          </div>

        </div>

        {/* ─── 3. HOTEL HERO TITLE & PRICING BAR (BELOW GALLERY) ─── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-neutral-100/90 mb-6">
          <div className="flex items-start justify-between gap-6 flex-col lg:flex-row">
            
            {/* Right Side: Title, Stars, Address */}
            <div className="flex-1 min-w-0">
              
              {/* Category Stars + Certified Tag */}
              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/80 px-3 py-1 rounded-full">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-900 me-0.5">
                    فندق {hotel.stars || 4} نجوم
                  </span>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCheck size={13} className="text-emerald-600" />
                  فندق معتمد وموثوق
                </span>

                {hotel.city && (
                  <span className="text-xs font-bold text-[#23096e] bg-[#23096e]/5 border border-[#23096e]/15 px-3 py-1 rounded-full">
                    {hotel.city}
                  </span>
                )}
              </div>

              {/* Main Hotel Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight mb-3">
                {hotel.name}
              </h1>

              {/* Hotel Address */}
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <MapPin size={16} className="text-[#23096e] shrink-0" />
                <span className="font-medium">{hotel.address || `${hotel.city}، الجمهورية اليمنية`}</span>
                <button
                  onClick={() => scrollToSection('location')}
                  className="text-xs font-bold text-[#23096e] hover:underline ms-2 inline-flex items-center gap-0.5"
                >
                  (عرض الخريطة)
                </button>
              </div>
            </div>

            {/* Left Side: Pricing Showcase & Actions */}
            <div className="w-full lg:w-auto shrink-0 flex items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
              
              {/* Starting Price Box */}
              <div className="text-start lg:text-end bg-gradient-to-br from-neutral-50 to-neutral-100/60 border border-neutral-200/70 px-5 py-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">تبدأ الأسعار من</span>
                <div className="flex items-baseline gap-1.5 lg:justify-end">
                  <span className="text-2xl sm:text-3xl font-black text-[#23096e]">{formatPrice(discounted)}</span>
                  <span className="text-neutral-500 text-xs font-bold">/ ليلة</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">شامل كافة الضرائب والرسوم</span>
              </div>

              {/* Action Buttons: Jump to Rooms + Share */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollToSection('rooms')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-black px-5 py-3.5 rounded-2xl text-white bg-gradient-to-r from-[#23096e] to-[#3A1C8F] hover:from-[#1c0659] hover:to-[#2e1572] transition-all shadow-md shadow-[#23096e]/20 active:scale-95"
                >
                  <span>اختر غرفتك</span>
                  <ArrowDown size={15} />
                </button>

                <button
                  onClick={handleShare}
                  title="مشاركة الفندق"
                  className="w-12 h-12 rounded-2xl bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
                >
                  {copied ? <CheckCircle2 size={20} className="text-green-600 animate-scale-in" /> : <Share2 size={19} />}
                </button>
              </div>
            </div>

          </div>

          {/* Copy Toast Message */}
          {copied && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2 animate-fade-in">
              <Check size={15} className="text-emerald-600 shrink-0" />
              تم نسخ رابط الفندق إلى الحافظة بنجاح!
            </div>
          )}
        </div>

        {/* ─── 4. STICKY SUB-NAV TABS ─── */}
        <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-neutral-200/80 mb-8 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: <Layers size={14} /> },
              { id: 'amenities', label: 'المرافق والخدمات', icon: <Sparkles size={14} /> },
              { id: 'rooms', label: 'الغرف المتاحة', icon: <BedDouble size={14} /> },
              { id: 'policies', label: 'سياسات الإقامة', icon: <Shield size={14} /> },
              { id: 'location', label: 'الموقع والوصول', icon: <Compass size={14} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeSection === tab.id
                    ? 'bg-[#23096e] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 5. VALUE PILLARS (4 FEATURE CARDS) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#23096e]/10 text-[#23096e] flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-neutral-900">تأكيد حجز فوري</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">مباشر دون انتظار</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-neutral-900">إلغاء مجاني متاح</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">مرونة قبل موعد الوصول</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-neutral-900">دفع عند الوصول</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">أو تحويل بنكي معتمد</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-neutral-900">أفضل سعر مضمون</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">أسعار مباشرة ومنافسة</p>
            </div>
          </div>
        </div>

        {/* ─── 6. MAIN CONTENT SECTIONS ─── */}
        <div className="space-y-8">

          {/* ── Overview & About ── */}
          <section id="overview" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100/90 scroll-mt-28">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#23096e]/10 text-[#23096e] flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900">نظرة عامة عن الفندق</h2>
            </div>
            <p className="text-neutral-600 leading-8 text-sm sm:text-[15px] whitespace-pre-line">
              {hotel.description || `يعد فندق ${hotel.name} من أبرز الفنادق في مدينة ${hotel.city}، حيث يقدم تجربة إقامة فاخرة تجمع بين الراحة والخدمات المتميزة لرجال الأعمال والعائلات.`}
            </p>
          </section>

          {/* ── Amenities & Services ── */}
          <section id="amenities" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100/90 scroll-mt-28">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#23096e]/10 text-[#23096e] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900">المرافق والخدمات الفندقية</h2>
                <p className="text-xs text-neutral-400 mt-0.5">تجهيزات شاملة لتجربة إقامة متكاملة ومريحة</p>
              </div>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {hotel.amenities.map((a, idx) => {
                  const category = typeof a.category === 'string' ? a.category.toUpperCase() : 'GENERAL';
                  const color = CATEGORY_COLORS[category] || '#23096e';
                  const iconName = a.icon
                    ? a.icon.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
                        .replace(/^([a-z])/, (_: string, c: string) => c.toUpperCase())
                    : 'Check';
                  return (
                    <div key={`${a.id || a.name}-${idx}`} className="flex items-center gap-3.5 p-4 rounded-2xl border border-neutral-100 bg-neutral-50/70 hover:bg-white hover:border-neutral-200/90 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: `${color}14`, color }}>
                        <DynIcon name={iconName} size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-neutral-900 truncate">{a.name}</p>
                        {a.nameEn && <p className="text-[10px] text-neutral-400 truncate mt-0.5">{a.nameEn}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
                {FALLBACK_AMENITIES.map(am => (
                  <div key={am.name} className="flex items-center gap-3.5 p-4 rounded-2xl border border-neutral-100 bg-neutral-50/70">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${am.color}14`, color: am.color }}>
                      <DynIcon name={am.icon} size={18} />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-neutral-900">{am.name}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Available Rooms Section (Luxury Horizontal Suites) ── */}
          <section id="rooms" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100/90 scroll-mt-28">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 flex items-center gap-2">
                  <BedDouble size={20} className="text-[#23096e]" />
                  الغرف والأجنحة المتاحة للحجز
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">اختر الغرفة المناسبة للاطلاع على تفاصيلها الكاملة وإتمام الحجز</p>
              </div>
              <span className="text-xs font-bold text-[#23096e] bg-[#23096e]/10 border border-[#23096e]/20 px-3.5 py-1.5 rounded-full">
                {hotel.rooms?.length || 0} غرف معتمدة
              </span>
            </div>

            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div className="space-y-4">
                {hotel.rooms.map(room => (
                  <div
                    key={room.id}
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col md:flex-row bg-white ${
                      !room.isAvailable
                        ? 'border-neutral-200 opacity-60'
                        : 'border-neutral-200/80 hover:border-[#23096e]/40 hover:shadow-[0_8px_30px_rgba(35,9,110,0.06)]'
                    }`}
                  >
                    {/* Room Photo (Full left side on desktop) */}
                    <Link
                      href={roomHref(room.id)}
                      className="w-full md:w-72 lg:w-80 aspect-[16/10] md:aspect-auto shrink-0 relative block bg-neutral-100 overflow-hidden group min-h-[220px]"
                    >
                      {room.images && room.images.length > 0 && room.images[0]?.startsWith('http') ? (
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 320px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23096e]/5 to-[#3A1C8F]/10">
                          <BedDouble size={40} className="text-[#23096e]/30" />
                        </div>
                      )}
                      
                      {/* Availability Tag */}
                      <span className={`absolute top-3.5 start-3.5 text-[11px] font-black px-3 py-1 rounded-full shadow-sm ${
                        room.isAvailable ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-white'
                      }`}>
                        {room.isAvailable ? 'متاح للحجز' : 'محجوز حالياً'}
                      </span>
                    </Link>

                    {/* Room Details & Specifications */}
                    <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                      <div>
                        {/* Title & Subtitle */}
                        <div className="flex items-start justify-between gap-3">
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
                          <p className="text-xs sm:text-sm text-neutral-500 mt-2.5 leading-6 line-clamp-2">{room.description}</p>
                        )}

                        {/* Specs Pill Grid */}
                        <div className="flex items-center flex-wrap gap-2 mt-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-xl">
                            <Users size={14} className="text-[#23096e]" />
                            حتى {room.capacity} {room.capacity === 1 ? 'ضيف' : 'ضيوف'}
                          </span>
                          {room.numberOfBeds && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-xl">
                              <BedDouble size={14} className="text-[#23096e]" />
                              {room.numberOfBeds} {room.numberOfBeds === 1 ? 'سرير' : 'أسرّة'}
                            </span>
                          )}
                          {room.numberOfBathrooms && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-xl">
                              <Bath size={14} className="text-[#23096e]" />
                              {room.numberOfBathrooms} {room.numberOfBathrooms === 1 ? 'حمام خاص' : 'حمامات'}
                            </span>
                          )}
                          {room.amenities?.slice(0, 3).map((a, idx) => (
                            <span key={`${a.id || a.name}-${idx}`} className="text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-xl">
                              {a.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Room Price & Direct Booking CTA */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <span className="text-[11px] text-neutral-400 font-bold block">السعر للّيلة الواحدة</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl sm:text-3xl font-black text-[#23096e]">
                              {formatPrice(room.pricePerNight)}
                            </span>
                            <span className="text-neutral-400 text-xs font-bold">/ ليلة</span>
                          </div>
                        </div>

                        <Link
                          href={roomHref(room.id)}
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl text-white bg-gradient-to-r from-[#23096e] to-[#3A1C8F] hover:from-[#1c0659] hover:to-[#2e1572] transition-all shadow-md shadow-[#23096e]/20 active:scale-95"
                        >
                          <span>عرض تفاصيل الغرفة والحجز</span>
                          <ArrowLeft size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 bg-neutral-50 rounded-2xl border border-neutral-100">
                <BedDouble size={40} className="mx-auto text-neutral-300 mb-2.5" />
                <p className="font-bold text-neutral-800 text-base">لا توجد غرف مدرجة حالياً في هذا الفندق</p>
                <p className="text-xs text-neutral-400 mt-1">يرجى التواصل مع خدمة العملاء أو البحث في فنادق أخرى</p>
              </div>
            )}
          </section>

          {/* ── Policies & Guidelines ── */}
          <section id="policies" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100/90 scroll-mt-28">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#23096e]/10 text-[#23096e] flex items-center justify-center">
                <Shield size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900">سياسات وإرشادات الإقامة</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {[
                { icon: <Clock size={18} />, label: 'موعد تسجيل الوصول (Check-in)', value: 'من الساعة 2:00 ظهراً', color: '#23096e' },
                { icon: <Clock size={18} />, label: 'موعد تسجيل المغادرة (Check-out)', value: 'قبل الساعة 12:00 ظهراً', color: '#d97706' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3.5 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}14`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-bold">{item.label}</p>
                    <p className="font-black text-sm text-neutral-900 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { icon: <Check size={15} />, label: 'سياسة الإلغاء والمرونة', text: 'الإلغاء المجاني متاح قبل 48 ساعة من موعد الوصول. في حال الإلغاء المتأخر قد تُحتسب رسوم ليلة واحدة.', color: '#16a34a' },
                { icon: <Users size={15} />, label: 'سياسة الأطفال والإقامة الإضافية', text: 'الأطفال دون سن 12 عاماً يقيمون مجاناً عند استخدام الأسرّة المتاحة في الغرفة. السرير الإضافي يخضع لتكلفة منفصلة.', color: '#0284c7' },
                { icon: <Check size={15} />, label: 'إثبات الهوية والوصول', text: 'يُرجى إبراز الهوية الوطنية أو جواز السفر الأصلي عند مكتب الاستقبال أثناء تسجيل الوصول.', color: '#23096e' },
              ].map(item => (
                <div key={item.label} className="flex gap-3.5 p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}14`, color: item.color }}>
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
              <div className="mt-5 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100/60">
                <h3 className="font-bold text-sm text-neutral-900 mb-2">تعليمات وسياسات إضافية خاصة بالفندق:</h3>
                <p className="text-xs sm:text-sm text-neutral-700 leading-7 whitespace-pre-line">
                  {currentLocale === 'ar' ? (hotel.policyAr || hotel.policyEn) : (hotel.policyEn || hotel.policyAr)}
                </p>
              </div>
            )}
          </section>

          {/* ── Location & Google Maps ── */}
          <section id="location" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100/90 scroll-mt-28">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#23096e]/10 text-[#23096e] flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-neutral-900">موقع الفندق وطريقة الوصول</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{hotel.city}، الجمهورية اليمنية</p>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-[#23096e] bg-[#23096e]/10 hover:bg-[#23096e]/20 px-4 py-2.5 rounded-2xl transition-colors"
              >
                <span>افتح الموقع في خرائط Google</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div
              className="rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3.5 border border-neutral-200/70 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(35, 9, 110, 0.04), rgba(58, 28, 143, 0.08))' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#23096e]/15 flex items-center justify-center text-[#23096e] shadow-sm">
                <MapPin size={32} />
              </div>
              <div>
                <p className="font-black text-base sm:text-lg text-neutral-800">{hotel.address || hotel.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{hotel.city}، الجمهورية اليمنية</p>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-xs sm:text-sm font-black px-6 py-3 rounded-2xl bg-white border border-neutral-200 text-neutral-800 hover:border-[#23096e] hover:text-[#23096e] shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>الاتجاهات والمسار عبر Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </section>

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
