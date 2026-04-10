'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Hotel, Plane, Car, Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'hotels', labelAr: 'فنادق محلية', icon: Hotel, href: '/hotels' },
  { id: 'global', labelAr: 'فنادق عالمية', icon: Hotel, href: '/hotels/international' },
  { id: 'flights', labelAr: 'رحلات طيران', icon: Plane, href: '/flights' },
  { id: 'cars', labelAr: 'خدمة السيارات', icon: Car, href: '/cars' },
];

const yemenCities = ['صنعاء', 'عدن', 'مأرب', 'المكلا', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'البيضاء'];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState('hotels');
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background Image + Brand Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-[#23096e]">
        <Image 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop"
          alt="سفر ورحلات"
          fill
          priority
          className="object-cover"
        />
        {/* Brand gradient overlay — same style as flights page */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0658]/90 via-[#23096e]/80 to-[#3A1C8F]/75 z-10" />
      </div>

      {/* Glowing circles */}
      <div className="absolute top-20 start-10 w-72 h-72 bg-[--brand-primary-light] opacity-20 rounded-full blur-3xl z-10" />
      <div className="absolute bottom-20 end-10 w-96 h-96 bg-[--brand-secondary] opacity-10 rounded-full blur-3xl z-10" />

      <div className="relative z-10 container-msari text-center pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20 animate-fade-in-up hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-default">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
          منصة السفر الأولى في اليمن
        </div>

        {/* Headline */}
        <h1 className="text-white font-black mb-5 animate-fade-in-up delay-100 uppercase hover:text-white/90 transition-colors duration-300" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.15', textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
          سفرتك القادمة تبدأ هنا
        </h1>

        <p className="text-white/75 text-lg mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200 hover:text-white/85 transition-colors duration-300" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          احجز فندقك، طيرانك، وتنقلاتك في اليمن والعالم — كل شيء في مكان واحد
        </p>

        {/* Search Box */}
        <div className="max-w-4xl mx-auto animate-fade-in-up delay-300">
          <div className="glass rounded-2xl p-2 shadow-2xl hover:shadow-3xl transition-shadow duration-500 border border-white/20">
            {/* Tabs */}
            <div className="flex gap-1 mb-3 p-1 bg-white/5 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'search-tab flex-1 text-sm',
                    activeTab === tab.id && 'active'
                  )}
                >
                  <tab.icon size={15} />
                  <span className="hidden sm:inline">{tab.labelAr}</span>
                </button>
              ))}
            </div>

            {/* Search Fields */}
            {activeTab === 'hotels' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* City Search */}
                <div className="lg:col-span-2 relative">
                  <div className="flex items-center bg-white rounded-xl px-4 gap-3 h-14 hover:shadow-lg transition-shadow duration-300 hover:scale-[1.01]">
                    <MapPin size={18} className="text-[--brand-primary] shrink-0" />
                    <div className="flex-1 text-start">
                      <label className="block text-xs text-neutral-400 font-medium">الوجهة</label>
                      <input
                        type="text"
                        placeholder="اختر مدينة..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full text-sm font-semibold text-neutral-800 placeholder-neutral-400 outline-none bg-transparent transition-colors duration-200"
                        list="cities-list"
                      />
                      <datalist id="cities-list">
                        {yemenCities.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Check In */}
                <div className="flex items-center bg-white rounded-xl px-4 gap-3 h-14 hover:shadow-lg transition-shadow duration-300 hover:scale-[1.01]">
                  <Calendar size={18} className="text-[--brand-primary] shrink-0" />
                  <div className="flex-1 text-start overflow-hidden">
                    <label className="block text-xs text-neutral-400 font-medium">تاريخ الوصول</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-sm font-semibold text-neutral-800 outline-none bg-transparent transition-colors duration-200"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Guests + Search BTN */}
                <div className="flex gap-2">
                  <div className="flex items-center bg-white rounded-xl px-3 gap-2 h-14 flex-1 hover:shadow-lg transition-shadow duration-300 hover:scale-[1.01]">
                    <Users size={18} className="text-[--brand-primary] shrink-0" />
                    <div className="text-start">
                      <label className="block text-xs text-neutral-400 font-medium">الضيوف</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="text-[--brand-primary] font-black text-lg leading-none hover:scale-110 transition-transform duration-200">−</button>
                        <span className="text-sm font-bold text-neutral-800 w-4 text-center">{guests}</span>
                        <button onClick={() => setGuests(guests + 1)} className="text-[--brand-primary] font-black text-lg leading-none hover:scale-110 transition-transform duration-200">+</button>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/hotels?city=${query}&guests=${guests}`}
                    className="btn btn-secondary h-14 px-5 text-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <Search size={18} />
                    <span className="hidden sm:inline">بحث</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'flights' && (
              <div className="flex items-center justify-center py-4">
                <Link href="/flights" className="btn btn-secondary btn-lg">
                  <Plane size={20} />
                  ابحث عن رحلات الطيران
                </Link>
              </div>
            )}

            {activeTab === 'global' && (
              <div className="flex items-center justify-center py-4">
                <Link href="/hotels/international" className="btn btn-secondary btn-lg">
                  <Hotel size={20} />
                  تصفح الفنادق العالمية
                </Link>
              </div>
            )}

            {activeTab === 'cars' && (
              <div className="flex items-center justify-center py-4">
                <Link href="/cars" className="btn btn-secondary btn-lg">
                  <Car size={20} />
                  احجز سيارة أو تاكسي
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 animate-fade-in-up delay-400">
          {[
            { value: '+50', label: 'فندق يمني' },
            { value: '+10', label: 'مدينة مغطاة' },
            { value: '4.8★', label: 'تقييم المستخدمين' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform duration-300" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{stat.value}</div>
              <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
