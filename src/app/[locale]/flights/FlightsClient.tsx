'use client';

import { useState } from 'react';
import { 
  Plane, PlaneTakeoff, Calendar, Users, 
  Search, Globe, ShieldCheck, Clock, CreditCard, Tag
} from 'lucide-react';
import Image from 'next/image';

const DEFAULT_FEATURES = [
  { title: 'أفضل أسعار التذاكر', desc: 'مقارنة شاملة لجميع خطوط الطيران لضمان أوفر سعر.', icon: Tag },
  { title: 'حجز ومتابعة فورية', desc: 'إصدار التذاكر ومتابعة التغييرات والتحديثات مباشرة عبر واتساب.', icon: Clock },
  { title: 'خيارات دفع متعددة', desc: 'سدد قيمة التذكرة بالريال اليمني، الريال السعودي، أو الدولار.', icon: CreditCard },
  { title: 'دعم سفر متواصل', desc: 'إرشادات وزن الأمتعة والمساعدة في التعديل والاسترجاع.', icon: ShieldCheck },
];

export default function FlightsClient({ 
  pageContent, 
  whatsappNumber 
}: { 
  pageContent?: any;
  whatsappNumber?: string;
}) {
  const [flightScope, setFlightScope] = useState<'yemen' | 'global'>('yemen');
  const [tripType, setTripType] = useState<'round' | 'oneway'>('round');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1 بالغ');
  const [flightClass, setFlightClass] = useState('السياحية');

  const title = pageContent?.hero?.title || 'حلّق نحو وجهتك القادمة';
  const subtitle = pageContent?.hero?.subtitle || 'اكتشف أرخص رحلات الطيران وأفضل العروض لأكثر من 1000 وجهة حول العالم.';
  const bgImage = pageContent?.hero?.bgImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !departDate) return;

    const waNum = whatsappNumber || '967777000000';

    if (flightScope === 'yemen') {
      let msg = `مرحباً، أرغب في الاستفسار عن حجز طيران:\n\n`;
      msg += `نوع الرحلة: ${tripType === 'round' ? 'ذهاب وعودة' : 'ذهاب فقط'}\n`;
      msg += `من: ${from}\n`;
      msg += `إلى: ${to}\n`;
      msg += `تاريخ الذهاب: ${departDate}\n`;
      if (tripType === 'round' && returnDate) msg += `تاريخ العودة: ${returnDate}\n`;
      msg += `المسافرون: ${passengers}\n`;
      msg += `الدرجة: ${flightClass}\n`;

      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      let msg = `مرحباً، أرغب في الاستفسار عن حجز طيران دولي:\n\n`;
      msg += `من: ${from}\nإلى: ${to}\nتاريخ السفر: ${departDate}\n`;
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <div className="bg-[#f8f8fa] min-h-screen pb-20">
      {/* ─── Hero Section ─── */}
      <div className="relative pt-24 pb-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#23096e]">
          <Image 
            src={bgImage}
            alt="Flights Hero"
            fill
            priority
            className="object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0658] via-[#23096e]/85 to-[#3A1C8F]/80 z-10" />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 lg:pt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black !text-white mb-6 leading-tight drop-shadow-lg" style={{ color: '#ffffff' }}>
            {title}
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            {subtitle}
          </p>
        </div>
      </div>

      {/* ─── Search Widget ─── */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 lg:-mt-32">
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-neutral-100/50">
          <div className="flex bg-neutral-100 rounded-xl p-1 mb-8 w-fit mx-auto lg:mx-0">
            <button
              onClick={() => setFlightScope('yemen')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                flightScope === 'yemen' ? 'bg-white text-[#23096e] shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <PlaneTakeoff size={18} /> رحلات من وإلى اليمن
            </button>
            <button
              onClick={() => setFlightScope('global')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                flightScope === 'global' ? 'bg-white text-[#23096e] shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Globe size={18} /> طيران عالمي
            </button>
          </div>

          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-neutral-700">
              <input type="radio" name="tripType" checked={tripType === 'round'} onChange={() => setTripType('round')} className="accent-[#23096e]" />
              ذهاب وعودة
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-neutral-700">
              <input type="radio" name="tripType" checked={tripType === 'oneway'} onChange={() => setTripType('oneway')} className="accent-[#23096e]" />
              اتجاه واحد
            </label>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-2">
              <div className="lg:col-span-3 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">من أين؟</p>
                <input type="text" placeholder="مدينة المغادرة" value={from} onChange={e => setFrom(e.target.value)} required className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
              </div>
              <div className="lg:col-span-3 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">إلى أين؟</p>
                <input type="text" placeholder="مدينة الوصول" value={to} onChange={e => setTo(e.target.value)} required className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
              </div>
              <div className="lg:col-span-2 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all flex flex-col justify-center">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">تاريخ الذهاب</p>
                <input type="date" value={departDate} onChange={e => setDepartDate(e.target.value)} required className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
              </div>
              {tripType === 'round' && (
                <div className="lg:col-span-2 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">تاريخ العودة</p>
                  <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
                </div>
              )}
              <div className={tripType === 'round' ? 'lg:col-span-2' : 'lg:col-span-4'}>
                <button type="submit" className="w-full h-full min-h-[64px] rounded-2xl flex items-center justify-center gap-2 text-white font-black text-lg shadow-lg shadow-[#23096e]/20" style={{ background: 'linear-gradient(135deg, #23096e, #3A1C8F)' }}>
                  <Search size={22} className="shrink-0" /> استفسر الآن
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Features ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {((pageContent?.features && pageContent.features.length > 0) ? pageContent.features : DEFAULT_FEATURES).map((f: any, idx: number) => {
            const Icon = f.icon && typeof f.icon !== 'string' ? f.icon : DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#23096e]/10 text-[#23096e] flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-black text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
