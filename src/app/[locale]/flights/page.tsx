'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plane, PlaneTakeoff, PlaneLanding, Calendar, Users, 
  Search, ArrowRightLeft, ShieldCheck, Clock, CreditCard, Globe
} from 'lucide-react';
import Image from 'next/image';

export default function FlightsPage() {
  const [flightScope, setFlightScope] = useState<'yemen' | 'global'>('yemen');
  const [tripType, setTripType] = useState<'round' | 'oneway'>('round');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1 بالغ');
  const [flightClass, setFlightClass] = useState('السياحية');

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !departDate) return;

    if (flightScope === 'yemen') {
      let msg = `مرحباً، أرغب في الاستفسار عن حجز طيران:\n\n`;
      msg += `نوع الرحلة: ${tripType === 'round' ? 'ذهاب وعودة' : 'ذهاب فقط'}\n`;
      msg += `من: ${from}\n`;
      msg += `إلى: ${to}\n`;
      msg += `تاريخ الذهاب: ${departDate}\n`;
      if (tripType === 'round' && returnDate) msg += `تاريخ العودة: ${returnDate}\n`;
      msg += `المسافرون: ${passengers}\n`;
      msg += `الدرجة: ${flightClass}\n`;

      const encodedMsg = encodeURIComponent(msg);
      // Replace with your actual WhatsApp business number
      window.open(`https://wa.me/967770000000?text=${encodedMsg}`, '_blank');
    } else {
      // Global flights -> redirect to internal search results (Travelpayouts API later)
      alert('سيتم توجيهك قريباً لصفحة نتائج الطيران العالمي...');
      // window.location.href = `/flights/search?from=${from}&to=${to}...`;
    }
  };

  return (
    <div className="bg-[#f8f8fa] min-h-screen pb-20">
      
      {/* ─── Hero Section ─── */}
      <div className="relative pt-24 pb-32 lg:pb-40 overflow-hidden">
        {/* Background Image (Airport/Departure Lounge) */}
        <div className="absolute inset-0 z-0 bg-[#23096e]">
          <Image 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop"
            alt="Flights Hero"
            fill
            priority
            className="object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0658] via-[#23096e]/85 to-[#3A1C8F]/80 z-10" />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 lg:pt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
            حلّق نحو وجهتك القادمة
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            اكتشف أرخص رحلات الطيران وأفضل العروض لأكثر من 1000 وجهة حول العالم.
          </p>
        </div>
      </div>

      {/* ─── Search Widget ─── */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 lg:-mt-32">
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-neutral-100/50">
          
          {/* Main Scope Tabs (Yemen vs Global) */}
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

          <div className="h-px bg-neutral-100 w-full mb-6" />

          {/* Type Tabs & Selects */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setTripType('round')}
                className={`flex items-center gap-2 font-bold text-sm transition-colors relative pb-2 ${tripType === 'round' ? 'text-[#23096e]' : 'text-neutral-500 hover:text-neutral-800'}`}>
                <ArrowRightLeft size={16} /> ذهاب وعودة
                {tripType === 'round' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#23096e] rounded-t-full" />}
              </button>
              <button 
                onClick={() => setTripType('oneway')}
                className={`flex items-center gap-2 font-bold text-sm transition-colors relative pb-2 ${tripType === 'oneway' ? 'text-[#23096e]' : 'text-neutral-500 hover:text-neutral-800'}`}>
                <Plane size={16} className="rotate-45" /> ذهاب فقط
                {tripType === 'oneway' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#23096e] rounded-t-full" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select 
                value={passengers} 
                onChange={e => setPassengers(e.target.value)}
                className="text-sm font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#23096e]"
              >
                <option>1 بالغ</option>
                <option>2 بالغين</option>
                <option>عائلة (4 أشخاص)</option>
              </select>
              <select 
                value={flightClass} 
                onChange={e => setFlightClass(e.target.value)}
                className="text-sm font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#23096e]"
              >
                <option>السياحية</option>
                <option>الأعمال</option>
                <option>الأولى</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-2">
              
              {/* Origin & Destination */}
              <div className="lg:col-span-5 relative flex flex-col md:flex-row gap-2">
                <div className="flex-1 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <PlaneTakeoff size={20} className="text-neutral-400 group-focus-within:text-[#23096e]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">من أين</p>
                      <input type="text" placeholder="مدينة أو مطار التواجد" value={from} onChange={e=>setFrom(e.target.value)} required
                        className="w-full bg-transparent outline-none text-neutral-900 font-bold placeholder-neutral-300" />
                    </div>
                  </div>
                </div>

                <button type="button" onClick={handleSwap}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[#23096e] hover:bg-neutral-50 transition-colors shadow-sm rotate-90 md:rotate-0">
                  <ArrowRightLeft size={16} />
                </button>

                <div className="flex-1 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <PlaneLanding size={20} className="text-neutral-400 group-focus-within:text-[#23096e]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">إلى أين</p>
                      <input type="text" placeholder="مدينة أو مطار الوجهة" value={to} onChange={e=>setTo(e.target.value)} required
                        className="w-full bg-transparent outline-none text-neutral-900 font-bold placeholder-neutral-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">تاريخ المغادرة</p>
                      <input type="date" value={departDate} onChange={e=>setDepartDate(e.target.value)} required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
                    </div>
                  </div>
                </div>

                {tripType === 'round' && (
                  <div className="flex-1 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">تاريخ العودة</p>
                        <input type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)} required
                          min={departDate || new Date().toISOString().split('T')[0]}
                          className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-3">
                <button type="submit" 
                  className="w-full h-full min-h-[64px] rounded-2xl flex items-center justify-center gap-2 text-white font-black transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#23096e]/20"
                  style={flightScope === 'yemen' 
                    ? { background: 'linear-gradient(135deg, #128C7E, #075E54)' } 
                    : { background: 'linear-gradient(135deg, #23096e, #3A1C8F)' }}>
                  {flightScope === 'yemen' ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      <span className="text-[15px]">استفسار وحجز عبر واتساب</span>
                    </>
                  ) : (
                    <>
                      <Search size={22} className="shrink-0" /> 
                      <span className="text-lg">البحث عن رحلات</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>

        </div>
      </div>

      {/* ─── Popular Destinations ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 mb-2">رحلات رائجة الآن</h2>
            <p className="text-neutral-500">اكتشف أرخص الوجهات التي يسافر إليها عملاؤنا حالياً.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { tag: 'صنعاء', from: 'الرياض', img: '/images/cities/sanaa.jpg' },
            { tag: 'عدن', from: 'جدة', img: '/images/cities/aden.jpg' },
            { tag: 'المكلا', from: 'عمان', img: '/images/cities/mukalla.jpg' },
          ].map((dest, i) => (
            <div key={i} className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer">
              <Image
                src={dest.img}
                alt={dest.tag}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Fallback pattern if unsplash is blocked */}
              <div className="absolute inset-0 bg-[#23096e]/60 opacity-0 group-hover:opacity-20 transition-opacity" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h3 className="text-white font-black text-2xl mb-1">{dest.tag}</h3>
                  <div className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
                    <span>من {dest.from}</span>
                    <PlaneTakeoff size={14} className="opacity-70" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-[#23096e] group-hover:border-[#23096e] transition-colors">
                  <ArrowRightLeft size={16} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Why Book With Us ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl mb-6 flex items-center justify-center text-[#23096e]"
                 style={{ background: 'linear-gradient(135deg, #23096e1a, #3A1C8F1a)' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3">حجز آمن وموثوق</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              نضمن لك أفضل الأسعار مع خيارات دفع آمنة ومتعددة تناسب جميع المسافرين في اليمن.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl mb-6 flex items-center justify-center text-[#23096e]"
                 style={{ background: 'linear-gradient(135deg, #23096e1a, #3A1C8F1a)' }}>
              <CreditCard size={32} />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3">أسعار نهائية وشفافة</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              لا توجد رسوم خفية. السعر الذي تراه هو السعر الذي تدفعه، وندعم الدفع المحلي.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl mb-6 flex items-center justify-center text-[#23096e]"
                 style={{ background: 'linear-gradient(135deg, #23096e1a, #3A1C8F1a)' }}>
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3">دعم فني 24/7</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              فريقنا متواجد على مدار الساعة لمساعدتك في أي وقت قبل أو أثناء أو بعد رحلتك.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
