'use client';

import React from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Wifi, 
  Coffee, 
  Tv, 
  Wind, 
  Calendar, 
  User, 
  Phone, 
  Download,
  Clock,
  Sparkles,
  ChevronLeft,
  Share2,
  Heart
} from 'lucide-react';

/**
 * Screen 1: Search & Discover Hotels
 */
export function SearchAppScreen({ isEn = false }: { isEn?: boolean }) {
  return (
    <div className="w-full h-full bg-[#0F0A2A] text-white p-4 flex flex-col justify-between select-none font-sans overflow-hidden text-start">
      {/* Top App Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF3B30] flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#FF3B30]/30">
              م
            </div>
            <div>
              <p className="text-[10px] text-slate-300 font-bold">{isEn ? 'Welcome to' : 'مرحباً بك في'}</p>
              <h4 className="text-xs font-black text-white">{isEn ? 'Msari App' : 'تطبيق مساري'}</h4>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isEn ? 'Live Rates' : 'أسعار مباشرة'}
          </span>
        </div>

        {/* Search Box Widget */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 space-y-2">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-2.5 py-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
            <span className="font-bold text-white text-[11px] truncate">
              {isEn ? 'Aden — Khor Maksar, Yemen' : 'عدن — خور مكسر، اليمن'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1.5 text-slate-200">
              <Calendar className="w-3 h-3 text-[#3A1C8F] shrink-0" />
              <span className="font-semibold">{isEn ? '24 - 27 Aug' : '٢٤ - ٢٧ أغسطس'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1.5 text-slate-200">
              <User className="w-3 h-3 text-[#3A1C8F] shrink-0" />
              <span className="font-semibold">{isEn ? '2 Guests, 1 Room' : '٢ ضيوف، ١ غرفة'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Cards Feed */}
      <div className="space-y-2.5 my-2">
        {/* Card 1 */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-2.5 flex gap-2.5 items-center hover:bg-white/15 transition-colors">
          <div className="relative w-20 h-20 rounded-xl bg-gradient-to-tr from-[#23096E] to-[#3A1C8F] overflow-hidden shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_0.jpg?alt=media&token=2b00ded4-8b95-4efe-bc46-62e0ebdb178e')" }} />
            <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded bg-black/60 text-amber-300 text-[9px] font-black flex items-center gap-0.5 backdrop-blur-xs">
              ★ 4.8
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-black text-white truncate">{isEn ? 'Coral Aden Hotel' : 'فندق كورال عدن'}</h5>
            <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#FF3B30]" />
              {isEn ? 'Diplomatic District' : 'حي السفارات، خور مكسر'}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-emerald-400 font-bold">{isEn ? 'Instant Booking' : 'تأكيد فوري'}</span>
              <div className="text-end">
                <span className="text-xs font-black text-[#FF3B30]">$85</span>
                <span className="text-[8px] text-slate-300 block">{isEn ? '/night' : '/ليلة'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-2.5 flex gap-2.5 items-center">
          <div className="relative w-20 h-20 rounded-xl bg-gradient-to-tr from-[#23096E] to-[#3A1C8F] overflow-hidden shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_0.jpg?alt=media&token=7fa51dd1-b3b3-4f05-8968-3f596a77d542')" }} />
            <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded bg-black/60 text-amber-300 text-[9px] font-black flex items-center gap-0.5 backdrop-blur-xs">
              ★ 4.9
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-black text-white truncate">{isEn ? 'Horizon Aden Luxury' : 'فندق هورايزن الفاخر'}</h5>
            <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#FF3B30]" />
              {isEn ? 'Abyan Coast Beach' : 'ساحل أبين، إطلالة بحرية'}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-amber-400 font-bold">{isEn ? 'Best Deal' : 'أفضل عرض'}</span>
              <div className="text-end">
                <span className="text-xs font-black text-[#FF3B30]">$60</span>
                <span className="text-[8px] text-slate-300 block">{isEn ? '/night' : '/ليلة'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-[#1C1542] border border-white/10 rounded-2xl py-2 px-4 flex items-center justify-around text-slate-400 text-[10px]">
        <div className="flex flex-col items-center text-[#FF3B30] font-black">
          <Search className="w-4 h-4" />
          <span>{isEn ? 'Explore' : 'استكشف'}</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <Heart className="w-4 h-4" />
          <span>{isEn ? 'Saved' : 'المفضلة'}</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <Calendar className="w-4 h-4" />
          <span>{isEn ? 'Bookings' : 'حجوزاتي'}</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <User className="w-4 h-4" />
          <span>{isEn ? 'Profile' : 'حسابي'}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Screen 2: Hotel Details & Room Selection
 */
export function HotelDetailsAppScreen({ isEn = false }: { isEn?: boolean }) {
  return (
    <div className="w-full h-full bg-[#0F0A2A] text-white p-4 flex flex-col justify-between select-none font-sans overflow-hidden text-start">
      {/* Top Visual Image */}
      <div className="relative h-44 rounded-2xl overflow-hidden border border-white/15">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_1.jpg?alt=media&token=d33cdf0e-18fb-4dbe-ac1c-0ad1bbb78ef7')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A2A] via-transparent to-black/50" />
        
        <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-center z-10">
          <span className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </span>
          <div className="flex gap-2">
            <span className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
              <Share2 className="w-3.5 h-3.5" />
            </span>
            <span className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[#FF3B30]">
              <Heart className="w-3.5 h-3.5 fill-[#FF3B30]" />
            </span>
          </div>
        </div>

        <div className="absolute bottom-2.5 inset-x-3">
          <div className="flex items-center gap-1 text-amber-400 text-[10px] font-black">
            <span>★★★★★</span>
            <span className="text-white text-[10px]">4.9 (128 {isEn ? 'Reviews' : 'تقييم'})</span>
          </div>
          <h4 className="text-sm font-black text-white mt-0.5">{isEn ? 'Horizon Royal Suite — Sea View' : 'جناح هورايزن الملكي — إطلالة بحرية'}</h4>
        </div>
      </div>

      {/* Amenities Badges */}
      <div className="my-2 space-y-2">
        <p className="text-[10px] text-slate-300 font-bold">{isEn ? 'Key Amenities & Services' : 'المرافق والخدمات المتوفرة'}</p>
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="bg-white/10 border border-white/10 rounded-xl p-1.5 flex flex-col items-center">
            <Wifi className="w-3.5 h-3.5 text-[#FF3B30] mb-0.5" />
            <span className="text-[8px] font-bold">{isEn ? 'Free WiFi' : 'واي فاي'}</span>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-xl p-1.5 flex flex-col items-center">
            <Wind className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
            <span className="text-[8px] font-bold">{isEn ? '24/7 Power' : 'كهرباء دائم'}</span>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-xl p-1.5 flex flex-col items-center">
            <Coffee className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span className="text-[8px] font-bold">{isEn ? 'Breakfast' : 'إفطار مجاني'}</span>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-xl p-1.5 flex flex-col items-center">
            <Tv className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
            <span className="text-[8px] font-bold">{isEn ? 'Smart TV' : 'تلفزيون ذكي'}</span>
          </div>
        </div>
      </div>

      {/* Room Choice Card */}
      <div className="bg-white/10 border border-white/15 rounded-2xl p-2.5 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="text-xs font-black text-white">{isEn ? 'Executive Deluxe Room' : 'غرفة ديلوكس تنفيذية'}</h6>
            <p className="text-[9px] text-slate-300">{isEn ? 'King Bed · City & Sea Panorama' : 'سرير ملكي · إطلالة بانورامية'}</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
            {isEn ? 'Instant Confirmation' : 'تأكيد فوري'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <span className="text-[10px] text-slate-300 font-semibold">{isEn ? 'Includes all taxes' : 'شامل الرسوم والضرائب'}</span>
          <div className="text-end">
            <span className="text-xs font-black text-[#FF3B30]">$60</span>
            <span className="text-[8px] text-slate-400 ms-1">(150,000 YER)</span>
          </div>
        </div>
      </div>

      {/* Book Button */}
      <div className="pt-2">
        <button className="w-full py-2.5 rounded-xl bg-[#FF3B30] text-white text-center font-black text-xs shadow-lg shadow-[#FF3B30]/30 flex items-center justify-center gap-2">
          <span>{isEn ? 'Continue to Instant Booking' : 'متابعة الحجز الفوري'}</span>
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Screen 3: Yemeni Payment & Instant Confirmation
 */
export function PaymentAppScreen({ isEn = false }: { isEn?: boolean }) {
  return (
    <div className="w-full h-full bg-[#0F0A2A] text-white p-4 flex flex-col justify-between select-none font-sans overflow-hidden text-start">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          </span>
          <h4 className="text-xs font-black text-white">{isEn ? 'Secure Local Payment' : 'طريقة الدفع المحلية الآمنة'}</h4>
        </div>
        <p className="text-[10px] text-slate-300">{isEn ? 'Choose your preferred payment method in Yemen' : 'اختر وسيلة الدفع المناسبة لك في اليمن'}</p>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-2 my-2">
        {/* Method 1: Kuraimi */}
        <div className="p-2.5 rounded-2xl bg-white/15 border-2 border-[#FF3B30] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shadow-inner">
              كريمي
            </div>
            <div>
              <p className="text-xs font-black text-white">{isEn ? 'Kuraimi Jawwal / M-Floos' : 'الكريمي جوال / إم فلوس'}</p>
              <p className="text-[9px] text-slate-300">{isEn ? 'Instant deduction with instant confirmation' : 'خصم مباشر مع تأكيد حجز فوري'}</p>
            </div>
          </div>
          <span className="w-4 h-4 rounded-full bg-[#FF3B30] flex items-center justify-center text-white text-[9px] font-black">
            ✓
          </span>
        </div>

        {/* Method 2: Jeeb / Wallets */}
        <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-black text-[10px] flex items-center justify-center">
              جيب
            </div>
            <div>
              <p className="text-xs font-black text-white">{isEn ? 'Jeeb & Local Electronic Wallets' : 'محفظة جيب والمحافظ الإلكترونية'}</p>
              <p className="text-[9px] text-slate-300">{isEn ? 'CAC Bank, Floosak, etc.' : 'بنك القطيبي، فلوسك، ون باي'}</p>
            </div>
          </div>
          <span className="w-4 h-4 rounded-full border border-white/30" />
        </div>

        {/* Method 3: Pay at Hotel Cash */}
        <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center">
              كاش
            </div>
            <div>
              <p className="text-xs font-black text-white">{isEn ? 'Pay upon Hotel Check-in' : 'الدفع كاش عند الوصول للفندق'}</p>
              <p className="text-[9px] text-slate-300">{isEn ? 'Book now and pay at reception' : 'احجز الآن وادفع في الاستقبال'}</p>
            </div>
          </div>
          <span className="w-4 h-4 rounded-full border border-white/30" />
        </div>
      </div>

      {/* Invoice Summary Box */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-1.5 text-[10px]">
        <div className="flex justify-between text-slate-300">
          <span>{isEn ? 'Subtotal (3 Nights)' : 'الإجمالي (٣ ليالٍ)'}</span>
          <span className="font-bold text-white">$180</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>{isEn ? 'Booking Fee' : 'رسوم الخدمة والتأكيد'}</span>
          <span className="text-emerald-400 font-bold">{isEn ? 'FREE' : 'مجاناً 0$'}</span>
        </div>
        <div className="flex justify-between font-black text-white pt-1.5 border-t border-white/10 text-xs">
          <span>{isEn ? 'Total Payable' : 'المبلغ المطلوب سداده'}</span>
          <span className="text-[#FF3B30] text-sm font-black">$180 (450,000 YER)</span>
        </div>
      </div>

      {/* Confirm CTA */}
      <div className="pt-2">
        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30] text-white text-center font-black text-xs shadow-xl flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>{isEn ? 'Confirm & Secure Booking Now' : 'تأكيد الحجز الفوري برقم مرجعي'}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Screen 4: Digital Booking Confirmation Details
 */
export function BookingConfirmationAppScreen({ isEn = false }: { isEn?: boolean }) {
  return (
    <div className="w-full h-full bg-[#0F0A2A] text-white p-4 flex flex-col justify-between select-none font-sans overflow-hidden text-start">
      {/* Header with Success Badge */}
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-black text-white">{isEn ? 'Booking Confirmed Successfully!' : 'تم تأكيد حجزك بنجاح!'}</h4>
        <p className="text-[9px] text-slate-300">{isEn ? 'Reference No:' : 'رقم تأكيد الحجز:'} <span className="font-mono text-amber-300 font-black">MSR-984210</span></p>
      </div>

      {/* Booking Details Card */}
      <div className="relative bg-white text-slate-950 rounded-2xl p-3.5 shadow-2xl my-2 space-y-3">
        <div className="flex justify-between items-start border-b border-slate-200 pb-2">
          <div>
            <span className="px-2 py-0.5 rounded-full bg-[#23096E] text-white text-[8px] font-black">
              {isEn ? 'Official Confirmation' : 'تأكيد حجز رسمي'}
            </span>
            <h5 className="text-xs font-black text-slate-900 mt-1">{isEn ? 'Horizon Luxury Aden Hotel' : 'فندق هورايزن الفاخر — عدن'}</h5>
            <p className="text-[9px] text-slate-600 font-semibold">{isEn ? 'Executive Room · 2 Adults' : 'غرفة تنفيذية · ٢ بالغين'}</p>
          </div>
          
          <div className="w-11 h-11 bg-slate-100 rounded-lg p-1 flex items-center justify-center border border-slate-200 shrink-0">
            <QrCode className="w-full h-full text-slate-900" />
          </div>
        </div>

        {/* Dates & Times */}
        <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div>
            <p className="text-slate-500 font-bold">{isEn ? 'Check-in Date' : 'تاريخ الوصول'}</p>
            <p className="font-black text-slate-900">{isEn ? '24 Aug 2026 (2:00 PM)' : '٢٤ أغسطس (٢:٠٠ ظهراً)'}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold">{isEn ? 'Check-out Date' : 'تاريخ المغادرة'}</p>
            <p className="font-black text-slate-900">{isEn ? '27 Aug 2026 (12:00 PM)' : '٢٧ أغسطس (١٢:٠٠ ظهراً)'}</p>
          </div>
        </div>

        {/* Guaranteed Status */}
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-700">
          <span className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isEn ? 'Guaranteed via Msari Platform' : 'حجز مؤكد ومضمون عبر مساري'}
          </span>
          <span className="font-black text-[#23096E]">$180.00</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button className="py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black border border-white/20 flex items-center justify-center gap-1">
          <Download className="w-3 h-3 text-[#FF3B30]" />
          <span>{isEn ? 'Save Details PDF' : 'حفظ تفاصيل الحجز PDF'}</span>
        </button>
        <button className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center gap-1 shadow-md">
          <Phone className="w-3 h-3" />
          <span>{isEn ? 'Direct Hotel Chat' : 'محادثة الفندق واتساب'}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * 📱 Device Frame 1: iPhone 17 Pro Max
 * Features: Smooth rounded titanium chassis, Dynamic Island Pill, Ultra-narrow bezels, Home Indicator.
 */
export function IPhone17ProMaxFrame({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`relative w-[290px] sm:w-[320px] h-[590px] sm:h-[630px] rounded-[50px] border-[7px] border-slate-800 bg-slate-950 shadow-2xl shadow-[#23096E]/30 overflow-hidden ring-1 ring-white/20 ${className}`}>
      {/* Dynamic Island Pill Notch */}
      <div className="absolute top-2.5 inset-x-0 h-5 bg-black rounded-full z-30 w-28 mx-auto flex items-center justify-between px-3 border border-white/10 shadow-md">
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-white/10" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
      </div>

      {/* Screen Inner Viewport */}
      <div className="w-full h-full pt-5">
        {children}
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="absolute bottom-1.5 inset-x-0 w-32 h-1 bg-white/40 rounded-full mx-auto z-30 pointer-events-none" />
    </div>
  );
}

/**
 * 📱 Device Frame 2: Samsung Galaxy Note 24 Ultra
 * Features: Iconic sharp rectangular boxy corners, Infinity-O center hole-punch camera, Ultra-thin symmetric bezels.
 */
export function SamsungNote24UltraFrame({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`relative w-[290px] sm:w-[320px] h-[590px] sm:h-[630px] rounded-[22px] border-[6px] border-[#18181B] bg-slate-950 shadow-2xl shadow-[#FF3B30]/20 overflow-hidden ring-1 ring-slate-700/50 ${className}`}>
      {/* Center Infinity-O Punch-hole Camera */}
      <div className="absolute top-2 inset-x-0 z-30 flex justify-center pointer-events-none">
        <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1C1542] border border-blue-900/60" />
        </div>
      </div>

      {/* Screen Inner Viewport */}
      <div className="w-full h-full pt-4">
        {children}
      </div>

      {/* Subtle Android Navigation gesture cue */}
      <div className="absolute bottom-1 inset-x-0 w-24 h-0.5 bg-white/30 rounded-full mx-auto z-30 pointer-events-none" />
    </div>
  );
}
