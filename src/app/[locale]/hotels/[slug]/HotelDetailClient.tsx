'use client';

import { useState, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Star, Heart, Share2, Calendar, Users, Check, ArrowRight,
  ChevronLeft, ChevronRight as ChevronR, Clock, X,
  Shield, Zap, CreditCard, BedDouble, LogIn
} from 'lucide-react';
import type { Hotel } from '@/types';

/* ─── Default slides (Unsplash) ─── */
const DEFAULT_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop', alt: 'Hotel exterior' },
  { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop', alt: 'Hotel room' },
];

/* ─── Dynamic Lucide icon ─── */
const DynIcon = ({ name, size = 18 }: { name: string; size?: number }) => {
  // Convert kebab-case or lowercase to PascalCase
  const pascal = name
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/^([a-z])/, (_, c: string) => c.toUpperCase());
  const Icon = (LucideIcons as any)[pascal] ?? (LucideIcons as any)[name] ?? LucideIcons.Check;
  return <Icon size={size} />;
};

/* ─── Category color map ─── */
const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: '#23096e', WELLNESS: '#0284c7', DINING: '#d97706',
  SPORT: '#16a34a', BUSINESS: '#7c3aed', ROOM: '#db2777',
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

/* ─── Sample reviews ─── */
const SAMPLE_REVIEWS = [
  { name: 'أحمد العمري', initial: 'أ', rating: 5, date: 'مارس 2025', text: 'فندق رائع، الغرف نظيفة جداً والموظفون محترفون ومتعاونون. سأعود بالتأكيد!' },
  { name: 'سارة محمد', initial: 'س', rating: 4, date: 'فبراير 2025', text: 'تجربة ممتازة بشكل عام. الإفطار كان لذيذاً والموقع مركزي جداً.' },
];

interface Props { hotel: Hotel }

export default function HotelDetailClient({ hotel }: Props) {
  const [slide, setSlide] = useState(0);
  const [fav, setFav] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const isValidUrl = (url: string) => Boolean(url?.startsWith('http'));
  const validImages = hotel.images?.filter(isValidUrl) || [];
  const slides = validImages.length
    ? validImages.map(src => ({ src, alt: hotel.name }))
    : DEFAULT_SLIDES;
  const total = slides.length;
  const go = useCallback((n: number) => setSlide((n + total) % total), [total]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => go(slide + 1), 5000);
    return () => clearInterval(t);
  }, [slide, go, total]);

  const discounted = hotel.discount
    ? Math.round(hotel.priceFrom * (1 - hotel.discount.percentage / 100))
    : hotel.priceFrom;

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;

  return (
    <div className="bg-[#f8f8fa] min-h-screen">

      {/* ─── IMAGE SLIDER ─── */}
      <div className="relative w-full h-[480px] overflow-hidden group">
        {slides.map((s, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === slide ? 1 : 0 }}>
            {s.src.includes('msari.net') ? (
              <img src={s.src} alt={s.alt} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
            ) : (
              <Image src={s.src} alt={s.alt} fill className="object-cover" priority={i === 0} sizes="100vw" />
            )}
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

        <div className="absolute bottom-8 start-0 end-0 px-6 sm:px-12 z-10">
          <div className="flex items-center gap-1.5 mb-3">
            {Array(hotel.stars).fill(0).map((_, i) => (
              <Star key={i} size={15} fill="#facc15" className="text-yellow-400" />
            ))}
            {hotel.discount && (
              <span className="ms-2 text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">
                خصم {hotel.discount.percentage}%
              </span>
            )}
          </div>
          <h1 className="text-white text-3xl sm:text-4xl font-black mb-2 leading-tight drop-shadow-md">
            {hotel.name}
          </h1>
          <div className="flex items-center gap-1.5 text-white/75 text-sm">
            <MapPin size={14} className="text-white/60" />
            {hotel.address}، {hotel.city}، اليمن
          </div>
        </div>

        {total > 1 && (
          <>
            <button onClick={() => go(slide - 1)}
              className="absolute start-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <ChevronR size={20} />
            </button>
            <button onClick={() => go(slide + 1)}
              className="absolute end-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => go(i)}
                  className={`rounded-full transition-all duration-300 ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-20 end-4 z-20 flex gap-2">
          <button onClick={() => setFav(f => !f)}
            className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${fav ? 'bg-red-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}>
            <Heart size={17} fill={fav ? 'currentColor' : 'none'} />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm flex items-center justify-center">
            <Share2 size={17} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8 items-start flex-col xl:flex-row">

          {/* ─── LEFT COLUMN ─── */}
          <div className="flex-1 min-w-0 space-y-6 w-full">

            {/* Quick badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-neutral-100">
                <Star size={15} fill="#facc15" className="text-yellow-400" />
                <span className="text-sm font-bold text-neutral-800">{hotel.rating} / 5</span>
                <span className="text-sm text-neutral-400">({hotel.reviewCount} تقييم)</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-neutral-100">
                <Zap size={15} className="text-[#23096e]" />
                <span className="text-sm font-medium text-neutral-700">تأكيد فوري</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-neutral-100">
                <Shield size={15} className="text-green-500" />
                <span className="text-sm font-medium text-neutral-700">إلغاء مجاني</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-neutral-100">
                <CreditCard size={15} className="text-blue-500" />
                <span className="text-sm font-medium text-neutral-700">دفع عند الوصول</span>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-black text-neutral-900 mb-4">عن الفندق</h2>
              <p className="text-neutral-500 leading-8 text-[15px]">{hotel.description}</p>
            </div>

            {/* ─── AMENITIES (always visible) ─── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-black text-neutral-900 mb-5">المرافق والخدمات</h2>
              {hotel.amenities && hotel.amenities.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {hotel.amenities.map(a => {
                    const color = CATEGORY_COLORS[(a as any).category || 'GENERAL'] || '#23096e';
                    const iconName = a.icon
                      ? a.icon.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
                          .replace(/^([a-z])/, (_: string, c: string) => c.toUpperCase())
                      : 'Check';
                    return (
                      <div key={a.id} className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 bg-neutral-50 hover:border-neutral-200 transition-colors">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18`, color }}>
                          <DynIcon name={iconName} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-neutral-800">{a.name}</p>
                          {a.nameEn && <p className="text-xs text-neutral-400">{a.nameEn}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FALLBACK_AMENITIES.map(am => (
                    <div key={am.name} className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 bg-neutral-50">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${am.color}18`, color: am.color }}>
                        <DynIcon name={am.icon} />
                      </div>
                      <p className="font-semibold text-sm text-neutral-800">{am.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── ROOMS ─── */}
            {hotel.rooms && hotel.rooms.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                <h2 className="text-lg font-black text-neutral-900 mb-5">الغرف المتاحة</h2>
                <div className="space-y-4">
                  {hotel.rooms.map(room => (
                    <div key={room.id}
                      className={`rounded-2xl border-2 transition-colors overflow-hidden ${!room.isAvailable ? 'border-neutral-100 opacity-60' : 'border-neutral-100 hover:border-[#23096e]/30'}`}>
                      <div className="flex flex-col sm:flex-row">
                        <Link href={`/hotels/${hotel.slug}/rooms/${room.id}`}
                          className="sm:w-44 h-36 sm:h-auto shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity relative"
                          style={{ background: 'linear-gradient(135deg,#23096e12,#3A1C8F1a)' }}>
                          {room.images && room.images.length > 0 && room.images[0]?.startsWith('http') ? (
                            <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                          ) : (
                            <BedDouble size={32} style={{ color: '#23096e', opacity: 0.35 }} />
                          )}
                        </Link>
                        <div className="flex-1 p-5 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/hotels/${hotel.slug}/rooms/${room.id}`}
                                  className="font-black text-neutral-900 hover:text-[#23096e] hover:underline transition-colors text-lg">
                                  {room.name}
                                </Link>
                                <span className="text-xs text-neutral-400 font-medium">{room.nameEn}</span>
                              </div>
                              <p className="text-sm text-neutral-500 mt-1 leading-6 line-clamp-2">{room.description}</p>
                            </div>
                            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${room.isAvailable ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-400'}`}>
                              {room.isAvailable ? 'متاح' : 'محجوز'}
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-full">
                              <Users size={12} />
                              حتى {room.capacity} {room.capacity === 1 ? 'ضيف' : 'ضيوف'}
                            </span>
                            {room.amenities?.slice(0, 3).map(a => (
                              <span key={a.id} className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-full">
                                {a.name}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 flex-wrap gap-4">
                            <div>
                              <span className="text-xs text-neutral-400">السعر / ليلة</span>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-2xl font-black" style={{ color: '#23096e' }}>${room.pricePerNight}</span>
                              </div>
                            </div>
                            <Link
                              href={room.isAvailable
                                ? `/booking?hotel=${hotel.slug}&room=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&nights=${nights}`
                                : '#'}
                              className={`flex items-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-xl transition-all ${room.isAvailable
                                  ? 'text-white hover:opacity-90 hover:-translate-y-0.5 shadow-sm'
                                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed pointer-events-none'
                                }`}
                              style={room.isAvailable ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
                              {room.isAvailable ? 'اختر هذه الغرفة' : 'غير متاح'}
                              {room.isAvailable && <ArrowRight size={15} />}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── HOTEL POLICY (always visible) ─── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-black text-neutral-900 mb-5 flex items-center gap-2">
                <Shield size={18} style={{ color: '#23096e' }} /> سياسة الفندق
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {[
                  { icon: <Clock size={16} />, label: 'وقت تسجيل الدخول', value: 'من الساعة 2:00 م', color: '#23096e' },
                  { icon: <LogIn size={16} />, label: 'وقت المغادرة', value: 'قبل الساعة 12:00 م', color: '#d97706' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
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
                  { icon: <X size={14} />, label: 'سياسة الإلغاء', text: 'الإلغاء المجاني متاح قبل 48 ساعة من الوصول. بعد ذلك تُحتسب رسوم ليلة كاملة.', color: '#ef4444' },
                  { icon: <Users size={14} />, label: 'سياسة الأطفال', text: 'الأطفال دون 12 سنة مجانيون عند استخدام الأسرّة الموجودة. السرير الإضافي بتكلفة إضافية.', color: '#0284c7' },
                  { icon: <Check size={14} />, label: 'تعليمات الوصول', text: 'يُرجى تقديم بطاقة الهوية أو جواز السفر عند تسجيل الوصول.', color: '#16a34a' },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}14`, color: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-neutral-900">{item.label}</p>
                      <p className="text-sm text-neutral-500 leading-6 mt-0.5">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ─── RIGHT: BOOKING SIDEBAR ─── */}
          <div className="w-full xl:w-80 shrink-0 xl:sticky xl:top-24 mt-8 xl:mt-0">
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
              <div className="h-1.5" style={{ background: 'linear-gradient(to right,#23096e,#3A1C8F,#ff3b30)' }} />
              <div className="px-6 pt-5 pb-5 border-b border-neutral-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black" style={{ color: '#23096e' }}>${discounted}</span>
                  <span className="text-neutral-400 text-sm">/ ليلة</span>
                </div>
                {hotel.discount && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-neutral-400 line-through text-sm">${hotel.priceFrom}</span>
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: '#ff3b30' }}>
                      وفّرت ${hotel.priceFrom - discounted}
                    </span>
                  </div>
                )}
              </div>

              <div className="px-6 py-5 space-y-3 border-b border-neutral-100">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 focus-within:border-[#23096e] transition-colors bg-white">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#23096e12', color: '#23096e' }}>
                    <Calendar size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">الوصول</p>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full text-sm font-bold text-neutral-800 outline-none bg-transparent mt-0.5" />
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 focus-within:border-[#23096e] transition-colors bg-white">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#23096e12', color: '#23096e' }}>
                    <Clock size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">المغادرة</p>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full text-sm font-bold text-neutral-800 outline-none bg-transparent mt-0.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#23096e12', color: '#23096e' }}>
                      <Users size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">الضيوف</p>
                      <p className="text-sm font-bold text-neutral-800 mt-0.5">{guests} ضيف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                      className="w-7 h-7 rounded-lg border border-neutral-200 font-black text-base flex items-center justify-center hover:border-[#23096e] hover:text-[#23096e] transition-colors leading-none">
                      −
                    </button>
                    <span className="w-4 text-center text-sm font-black">{guests}</span>
                    <button onClick={() => setGuests(g => g + 1)}
                      className="w-7 h-7 rounded-lg border border-neutral-200 font-black text-base flex items-center justify-center hover:border-[#23096e] hover:text-[#23096e] transition-colors leading-none">
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 space-y-2 border-b border-neutral-100 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>${discounted} × {nights} {nights === 1 ? 'ليلة' : 'ليالٍ'}</span>
                  <span className="font-semibold text-neutral-800">${discounted * nights}</span>
                </div>
                {hotel.discount && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>خصم {hotel.discount.percentage}%</span>
                    <span className="font-semibold">− ${(hotel.priceFrom - discounted) * nights}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base border-t border-neutral-100 pt-2.5 mt-2">
                  <span className="text-neutral-900">الإجمالي</span>
                  <span style={{ color: '#23096e' }}>${discounted * nights}</span>
                </div>
              </div>

              <div className="px-6 py-5">
                <Link href={`/booking?hotel=${hotel.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&nights=${nights}`}
                  className="flex items-center justify-center gap-2 w-full text-white font-black text-base py-3.5 rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-md"
                  style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}>
                  احجز الآن
                  <ArrowRight size={17} />
                </Link>
                <p className="text-center text-xs text-neutral-400 mt-3">لن يُخصم أي مبلغ الآن</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                  {['إلغاء مجاني', 'تأكيد فوري', 'دفع آمن', 'دعم 24/7'].map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Check size={11} className="text-green-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAP ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mt-6">
          <h2 className="text-lg font-black text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin size={18} style={{ color: '#23096e' }} />
            الموقع على الخريطة
          </h2>
          <div className="rounded-xl h-48 flex flex-col items-center justify-center gap-3 border border-neutral-100"
            style={{ background: 'linear-gradient(135deg,#23096e08,#3A1C8F0d)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#23096e14' }}>
              <MapPin size={24} style={{ color: '#23096e' }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-neutral-700">{hotel.address}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{hotel.city}، اليمن</p>
            </div>
          </div>
        </div>

        {/* ─── REVIEWS ─── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 mt-6">
          <h2 className="text-lg font-black text-neutral-900 mb-6">تقييمات النزلاء</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            <div className="shrink-0 w-full md:w-48 h-32 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}>
              <span className="text-5xl font-black leading-none">{hotel.rating}</span>
              <span className="text-white/70 text-sm mt-2 font-medium">ممتاز</span>
            </div>
            <div className="flex-1 w-full space-y-3">
              {[['الموقع', 95], ['النظافة', 90], ['الخدمة', 88], ['القيمة', 85]].map(([l, v]) => (
                <div key={l} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-700 w-24 shrink-0">{l}</span>
                  <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${v}%`, background: 'linear-gradient(to right,#23096e,#3A1C8F)' }} />
                  </div>
                  <span className="text-sm font-black w-8 text-end" style={{ color: '#23096e' }}>
                    {(Number(v) / 20).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={i} className="p-5 rounded-2xl border border-neutral-100 bg-neutral-50 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 border-b border-neutral-100 pb-4">
                  <div className="w-12 h-12 rounded-full text-white text-base font-black flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}>
                    {r.initial}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-neutral-900">{r.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {Array(5).fill(0).map((_, j) => (
                          <Star key={j} size={13} fill={j < r.rating ? '#facc15' : 'none'} className="text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-400">{r.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 leading-7">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
