'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Wifi, Utensils, Car, Waves, Heart, Share2,
  Calendar, Users, Check, ArrowRight, BedDouble,
  ChevronLeft, ChevronRight as ChevronR, Clock,
  Shield, Zap, CreditCard, Sofa, Wind, Tv, ArrowLeft
} from 'lucide-react';
import type { Hotel, Room } from '@/types';

/* ─── Slide placeholder backgrounds ─── */
const FALLBACK_SLIDES = [
  { bg: 'linear-gradient(135deg,#23096e,#3A1C8F)' },
  { bg: 'linear-gradient(135deg,#1a0654,#23096e)' },
  { bg: 'linear-gradient(135deg,#2d1580,#3A1C8F)' },
];

const AMENITY_CFG: Record<string, { icon: React.ReactNode; color: string }> = {
  wifi:     { icon: <Wifi size={18}/>,     color: '#23096e' },
  pool:     { icon: <Waves size={18}/>,    color: '#0284c7' },
  utensils: { icon: <Utensils size={18}/>, color: '#d97706' },
  parking:  { icon: <Car size={18}/>,      color: '#16a34a' },
  tv:       { icon: <Tv size={18}/>,       color: '#8b5cf6' },
  wind:     { icon: <Wind size={18}/>,     color: '#0ea5e9' },
  waves:    { icon: <Waves size={18}/>,    color: '#0284c7' },
  sofa:     { icon: <Sofa size={18}/>,     color: '#f59e0b' },
};

interface Props {
  hotel: Hotel;
  room: Room;
}

export default function RoomDetailClient({ hotel, room }: Props) {
  const [slide, setSlide]     = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]   = useState(Math.min(2, room.capacity || 2));

  const slides = room.images?.length ? room.images.map(src => ({ bg: `url(${src})`, isImage: true })) : FALLBACK_SLIDES;
  const total = slides.length;
  const go = useCallback((n: number) => setSlide((n + total) % total), [total]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => go(slide + 1), 5000);
    return () => clearInterval(t);
  }, [slide, go, total]);

  const discounted = room.pricePerNight || 0;
  const priceToPay = hotel.discount
    ? Math.round(discounted * (1 - hotel.discount.percentage / 100))
    : discounted;

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;

  return (
    <div className="bg-[#f8f8fa] min-h-screen pb-20 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Link */}
        <Link href={`/hotels/${hotel.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#23096e] hover:text-[#3A1C8F] transition-colors mb-6 bg-white px-4 py-2 rounded-full shadow-sm">
          <ArrowRight size={16} /> العودة للفندق
        </Link>

        {/* ── TWO-COLUMN layout: left content + right booking ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="flex-1 min-w-0 space-y-6 w-full">

            {/* Room Heading */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-neutral-900 mb-2">{room.name}</h1>
                  <p className="text-neutral-500 font-medium">{room.nameEn}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${room.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {room.isAvailable ? 'متاح للحجز' : 'غير متاح حالياً'}
                </div>
              </div>
            </div>

            {/* Gallery (Slideshow inside card for room) */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-neutral-100">
              <div className="relative w-full h-[400px] sm:h-[450px] rounded-xl overflow-hidden group bg-neutral-100">
                {slides.map((s, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500"
                    style={s.isImage ? { opacity: i === slide ? 1 : 0 } : { background: s.bg, opacity: i === slide ? 1 : 0 }}
                  >
                    {s.isImage ? (
                      <Image src={s.bg.replace('url(', '').replace(')', '')} alt={room.name} fill className="object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <BedDouble size={36} className="text-white/80" />
                      </div>
                    )}
                  </div>
                ))}
                
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
                    {/* Dots */}
                    <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                      {slides.map((_, i) => (
                        <button key={i} onClick={() => go(i)}
                          className={`rounded-full transition-all duration-300 ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description & Specs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-black text-neutral-900 mb-4">وصف الغرفة</h2>
              <p className="text-neutral-500 leading-8 text-[15px] mb-8">{room.description}</p>

              <h2 className="text-lg font-black text-neutral-900 mb-4 pt-4 border-t border-neutral-100">تفاصيل المساحة والسعة</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center justify-center flex-col sm:flex-row gap-3 bg-neutral-50 rounded-xl px-5 py-4 border border-neutral-100 flex-1 min-w-[200px]">
                  <Users size={20} className="text-[#23096e]" />
                  <span className="text-sm font-bold text-neutral-800 text-center">تتسع لحتى {room.capacity} {room.capacity === 1 ? 'ضيف' : 'ضيوف'}</span>
                </div>
                <div className="flex items-center justify-center flex-col sm:flex-row gap-3 bg-neutral-50 rounded-xl px-5 py-4 border border-neutral-100 flex-1 min-w-[200px]">
                  <BedDouble size={20} className="text-[#23096e]" />
                  <span className="text-sm font-bold text-neutral-800 text-center">سرير مريح</span>
                </div>
                {room.name.includes('جناح') && (
                  <div className="flex items-center justify-center flex-col sm:flex-row gap-3 bg-neutral-50 rounded-xl px-5 py-4 border border-neutral-100 w-full">
                    <Sofa size={20} className="text-[#23096e]" />
                    <span className="text-sm font-bold text-neutral-800 text-center">جناح مقسم: غرفة معيشة + غرفة نوم</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities Specific to Room */}
            {room.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-100">
                <h2 className="text-lg font-black text-neutral-900 mb-5">تجهيزات الغرفة</h2>
                <div className="grid grid-cols-2 gap-4">
                  {room.amenities.map(a => {
                    const cfg = AMENITY_CFG[a.icon] ?? { icon: <Check size={18}/>, color: '#23096e' };
                    return (
                      <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50 hover:border-[#23096e]/20 transition-colors">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: `${cfg.color}14`, color: cfg.color }}>
                          {cfg.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-neutral-800">{a.name}</p>
                          <p className="text-xs text-neutral-400">{a.nameEn}</p>
                        </div>
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
                  <span className="text-4xl font-black" style={{ color:'#23096e' }}>${priceToPay}</span>
                  <span className="text-neutral-400 text-sm">/ ليلة</span>
                </div>
                {hotel.discount && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-neutral-400 line-through text-sm">${discounted}</span>
                    <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full shadow-sm" style={{ background:'#ff3b30' }}>
                      خصم حصري للفندق {hotel.discount.percentage}%
                    </span>
                  </div>
                )}
              </div>

              <div className="px-6 py-5 space-y-4 border-b border-neutral-100 bg-[#f8f8fa]/50">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 focus-within:border-[#23096e] transition-colors bg-white shadow-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'#23096e12', color:'#23096e' }}>
                    <Calendar size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">الوصول</p>
                    <input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full text-sm font-bold text-neutral-800 outline-none bg-transparent mt-0.5" />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 focus-within:border-[#23096e] transition-colors bg-white shadow-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'#23096e12', color:'#23096e' }}>
                    <Clock size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">المغادرة</p>
                    <input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full text-sm font-bold text-neutral-800 outline-none bg-transparent mt-0.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'#23096e12', color:'#23096e' }}>
                      <Users size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">الضيوف</p>
                      <p className="text-sm font-bold text-neutral-800 mt-0.5">{guests} ضيف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setGuests(g=>Math.max(1,g-1))}
                      className="w-7 h-7 rounded-lg border border-neutral-200 font-black text-base flex items-center justify-center hover:border-[#23096e] hover:text-[#23096e] hover:bg-[#23096e]/5 transition-colors leading-none">
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-black">{guests}</span>
                    <button onClick={() => setGuests(g=>Math.min(room.capacity || 2,g+1))}
                      className="w-7 h-7 rounded-lg border border-neutral-200 font-black text-base flex items-center justify-center hover:border-[#23096e] hover:text-[#23096e] hover:bg-[#23096e]/5 transition-colors leading-none disabled:opacity-30">
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3 border-b border-neutral-100 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>${priceToPay} × {nights} {nights===1?'ليلة':'ليالٍ'}</span>
                  <span className="font-semibold text-neutral-800">${priceToPay * nights}</span>
                </div>
                {hotel.discount && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>خصم {hotel.discount.percentage}%</span>
                    <span className="font-semibold">− ${(discounted - priceToPay) * nights}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base border-t border-neutral-100 pt-3 mt-2">
                  <span className="text-neutral-900">الإجمالي</span>
                  <span style={{ color:'#23096e' }}>${priceToPay * nights}</span>
                </div>
              </div>

              <div className="px-6 py-5 bg-white">
                <Link
                  href={room.isAvailable
                    ? `/booking?hotel=${hotel.slug}&room=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&nights=${nights}`
                    : '#'}
                  className={`flex items-center justify-center gap-2 w-full text-white font-black text-base py-4 rounded-xl transition-all shadow-md ${
                    room.isAvailable
                      ? 'hover:opacity-90 hover:-translate-y-0.5'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={room.isAvailable ? { background:'linear-gradient(135deg,#23096e,#3A1C8F)' } : { background: '#9ca3af' }}>
                  {room.isAvailable ? 'احجز هذه الغرفة' : 'غير متاح'}
                  {room.isAvailable && <ArrowRight size={17} />}
                </Link>
                <p className="text-center text-xs text-neutral-400 mt-4">تسعيرة نهائية لا توجد رسوم خفية</p>
                
                <div className="mt-5 space-y-2.5">
                  {['إلغاء مجاني قبل 24 ساعة', 'تأكيد فوري للحجز', 'دفع عند الوصول أو بالبطاقة'].map(f=>(
                    <div key={f} className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                      <Check size={14} className="text-green-500 shrink-0" />
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
