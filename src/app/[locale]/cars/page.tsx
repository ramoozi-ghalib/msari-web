'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Car, MapPin, Calendar, Clock, Users,
  ShieldCheck, CheckCircle2, ChevronDown, BaggageClaim,
  Map, Star, Search
} from 'lucide-react';
import Image from 'next/image';

export default function CarsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'airport' | 'intercity'>('airport');

  // Search States (simplified for demo)
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState('1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/cars/booking');
  };

  return (
    <div className="bg-[#f8f8fa] min-h-screen pb-20">
      
      {/* ─── Hero Section ─── */}
      <div className="relative pt-24 pb-32 lg:pb-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-[#23096e]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0658] via-[#23096e]/90 to-[#3A1C8F]/80 z-10" />
          <Image 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop"
            alt="Cars Hero"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 lg:pt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-lg" style={{ color: '#ffffff' }}>
            رحلتك تبدأ بكل راحة وأمان
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-12 drop-shadow-md">
            احجز سيارة خاصة لتوصيلات المطار، أو التنقل بين المدن في رحلتك عبر اليمن.
          </p>
        </div>
      </div>

      {/* ─── Search Widget ─── */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 lg:-mt-32">
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-neutral-100/50">
          
          {/* Main Tabs */}
          <div className="flex bg-neutral-100 rounded-xl p-1 mb-8 w-fit mx-auto lg:mx-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('airport')}
              className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'airport' ? 'bg-white text-[#23096e] shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <BaggageClaim size={18} /> توصيل المطار
            </button>
            <button
              onClick={() => setActiveTab('intercity')}
              className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'intercity' ? 'bg-white text-[#23096e] shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Map size={18} /> بين المدن
            </button>
          </div>

          <div className="h-px bg-neutral-100 w-full mb-6" />

          {/* Form Content */}
          <form onSubmit={handleSearch}>
            
            {activeTab === 'airport' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-2">
                <div className="lg:col-span-3 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-neutral-400 group-focus-within:text-[#23096e]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">من المطار</p>
                      <input type="text" placeholder="اسم المطار" value={pickup} onChange={e=>setPickup(e.target.value)} required
                        className="w-full bg-transparent outline-none text-neutral-900 font-bold placeholder-neutral-300" />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-3 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-neutral-400 group-focus-within:text-[#23096e]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">إلى الفندق/العنوان</p>
                      <input type="text" placeholder="الوجهة" value={dropoff} onChange={e=>setDropoff(e.target.value)} required
                        className="w-full bg-transparent outline-none text-neutral-900 font-bold placeholder-neutral-300" />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">التاريخ</p>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} required
                    className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
                </div>
                <div className="lg:col-span-2 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group flex flex-col justify-center">
                   <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">الوقت</p>
                   <input type="time" value={time} onChange={e=>setTime(e.target.value)} required
                    className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
                </div>
                
                <div className="lg:col-span-2">
                  <button type="submit" 
                    className="w-full h-full min-h-[64px] rounded-2xl flex items-center justify-center gap-2 text-white font-black text-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#23096e]/20"
                    style={{ background: 'linear-gradient(135deg, #23096e, #3A1C8F)' }}>
                    <Search size={22} className="shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'intercity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-2">
                <div className="lg:col-span-4 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-neutral-400 group-focus-within:text-[#23096e]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">من مدينة</p>
                      <input type="text" placeholder="مثال: عدن" value={pickup} onChange={e=>setPickup(e.target.value)} required
                        className="w-full bg-transparent outline-none text-neutral-900 font-bold placeholder-neutral-300" />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-neutral-400 group-focus-within:text-[#23096e]" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">إلى مدينة</p>
                      <input type="text" placeholder="مثال: صنعاء" value={dropoff} onChange={e=>setDropoff(e.target.value)} required
                        className="w-full bg-transparent outline-none text-neutral-900 font-bold placeholder-neutral-300" />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-neutral-50 rounded-2xl border border-neutral-200 p-3.5 focus-within:border-[#23096e] focus-within:bg-white transition-all group flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">تاريخ الرحلة</p>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} required
                    className="w-full bg-transparent outline-none text-neutral-900 font-bold" />
                </div>
                
                <div className="lg:col-span-2">
                  <button type="submit" 
                    className="w-full h-full min-h-[64px] rounded-2xl flex items-center justify-center gap-2 text-white font-black text-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#23096e]/20"
                    style={{ background: 'linear-gradient(135deg, #23096e, #3A1C8F)' }}>
                    <Search size={22} className="shrink-0" /> ابحث
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>

      {/* ─── Fleet Section ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 mb-2">السيارات المتوفرة</h2>
            <p className="text-neutral-500">اختر من بين مجموعة واسعة من السيارات التي تناسب جميع ميزانياتك واحتياجاتك.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { tag: 'اقتصادية', desc: 'تويوتا يارس، هيونداي أكسنت أو ما شابه', cap: 4, bags: 2, price: 35, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600' },
            { tag: 'عائلية SUV', desc: 'تويوتا برادو، فورد إكسبلورر أو ما شابه', cap: 7, bags: 4, price: 80, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600' },
            { tag: 'أعمال', desc: 'تويوتا كامري، هوندا أكورد أو ما شابه', cap: 4, bags: 3, price: 55, img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600' },
            { tag: 'فان نقل', desc: 'تويوتا هايس 14 راكب أو ما شابه', cap: 14, bags: 10, price: 120, img: 'https://images.unsplash.com/photo-1619682817481-e994891bf1e5?auto=format&fit=crop&q=80&w=600' },
          ].map((car, idx) => (
            <Link href="/cars/booking" key={idx} className="bg-white rounded-3xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow group cursor-pointer flex flex-col overflow-hidden">
              {/* Car Image */}
              <div className="h-40 w-full relative overflow-hidden bg-neutral-100">
                <Image 
                  src={car.img}
                  alt={car.tag}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-black text-[#23096e] mb-1">{car.tag}</h3>
                <p className="text-sm font-medium text-neutral-500 mb-5 min-h-[40px]">{car.desc}</p>
                
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-neutral-100/60 mt-auto">
                  <div className="flex items-center gap-1.5 text-sm text-neutral-600 font-bold">
                    <Users size={16} className="text-neutral-400" /> {car.cap} ركاب
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-neutral-600 font-bold">
                    <BaggageClaim size={16} className="text-neutral-400" /> {car.bags} حقائب
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 font-bold mb-1">الأسعار تبدأ من</p>
                    <p className="text-2xl font-black text-neutral-900">${car.price} <span className="text-xs text-neutral-500 font-medium">/ يوم</span></p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-[#23096e] group-hover:bg-[#23096e] group-hover:text-white group-hover:border-[#23096e] transition-all relative overflow-hidden">
                    <Car size={18} className="relative z-10" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
