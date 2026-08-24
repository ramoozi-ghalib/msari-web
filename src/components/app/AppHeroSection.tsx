'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Smartphone, 
  QrCode, 
  Download, 
  Zap, 
  BadgePercent,
  CheckCircle2
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import { SearchAppScreen, HotelDetailsAppScreen } from './AppMockupScreens';

interface Props {
  isEn?: boolean;
  data?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    downloads?: string;
    rating?: string;
    googlePlayUrl?: string;
    appStoreUrl?: string;
    heroPhoneImage1?: string;
    heroPhoneImage2?: string;
  };
}

export default function AppHeroSection({ isEn = false, data }: Props) {
  const badge = data?.badge || (isEn ? 'Msari Smart Travel App' : 'تطبيق مساري الذكي للجوال');
  const title = data?.title || (isEn ? 'Your Entire Journey in Yemen & Beyond — In One Smart App' : 'سفرك وفنادقك في جيبك — حمّل تطبيق مساري الآن');
  const subtitle = data?.subtitle || (isEn
    ? 'Book the best hotels in Yemen with instant confirmation, local payment methods (Kuraimi, Jeeb, Cash), and compare global hotels, flights, and car rentals effortlessly.'
    : 'احجز أفضل فنادق اليمن بتأكيد فوري ودفع محلي ميسر (كريمي، جيب، كاش عند الوصول)، وقارن أسعار الفنادق العالمية ورحلات الطيران والسيارات بضغطة زر واحدة.');
  
  const ratingVal = data?.rating || '4.8';
  const downloadsVal = data?.downloads || '+10,000';
  const googlePlayUrl = data?.googlePlayUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStoreUrl = data?.appStoreUrl || 'https://apps.apple.com';

  const titlePart1 = title.split('—')[0] || title;
  const titlePart2 = title.split('—')[1] || '';

  const [activeScreenTab, setActiveScreenTab] = useState<'search' | 'details'>('search');

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-[#F4F2F8] text-[#0A0912] selection:bg-[#23096E] selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] bg-[#23096E]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#3A1C8F]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="container-msari relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Content Column (Right on RTL) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#23096E]/15 text-[#23096E] text-xs sm:text-sm font-extrabold shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
              <Sparkles className="w-4 h-4 text-[#FF3B30]" />
              <span>{badge}</span>
              <span className="px-2 py-0.5 bg-[#23096E] text-white rounded-full text-[10px] font-black">
                {isEn ? 'V2.0 New' : 'النسخة الجديدة 2.0'}
              </span>
            </div>

            {/* Main Headline */}
            <Heading level={1} variant="brand" className="tracking-tight text-3xl sm:text-4xl lg:text-5xl font-black">
              {titlePart1}
              {titlePart2 && (
                <span className="block text-[#FF3B30] mt-2">
                  {titlePart2}
                </span>
              )}
            </Heading>

            {/* Subtitle */}
            <p className="text-[#423861] text-base sm:text-lg max-w-2xl leading-relaxed font-semibold">
              {subtitle}
            </p>

            {/* Ratings & Downloads Social Proof Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[#23096E] text-xs font-black">{ratingVal}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-black text-[#23096E] bg-[#23096E]/10 px-3.5 py-1.5 rounded-full border border-[#23096E]/20">
                <Download className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>{downloadsVal} {isEn ? 'Downloads on Google Play' : 'تحميل نشط'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEn ? '100% Free' : 'تطبيق مجاني 100%'}</span>
              </div>
            </div>

            {/* Store Download Buttons & QR Code */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              
              {/* Badges Container */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 w-full sm:w-auto">
                
                {/* Official Google Play Store Button */}
                <a
                  href={googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-3.5 px-6 py-3.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-2xl shadow-xl shadow-[#23096E]/25 transition-all duration-300 transform hover:-translate-y-1 border border-white/10 group"
                >
                  <svg className="w-8 h-8 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">GET IT ON</p>
                    <p className="text-base font-black text-white leading-tight">Google Play</p>
                  </div>
                </a>

                {/* Official Apple App Store Button */}
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-3.5 px-6 py-3.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-2xl shadow-xl shadow-[#23096E]/25 transition-all duration-300 transform hover:-translate-y-1 border border-white/10 group"
                >
                  <svg className="w-8 h-8 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Download on the</p>
                    <p className="text-base font-black text-white leading-tight">App Store</p>
                  </div>
                </a>

              </div>

              {/* QR Code Container for Desktop */}
              <div className="hidden xl:flex items-center gap-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-lg shadow-[#23096E]/5 hover:border-[#23096E]/30 transition-all">
                <div className="relative w-14 h-14 bg-[#23096E] rounded-xl p-1.5 flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded bg-[#FF3B30] text-white flex items-center justify-center text-[9px] font-black border border-white">
                      م
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#0A0912] leading-snug font-extrabold max-w-[100px]">
                  {isEn ? 'Scan with Camera to Download' : 'امسح بالكاميرا للتحميل المباشر'}
                </div>
              </div>

            </div>

            {/* Local Yemeni Payment & Security Assurances */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#423861] font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isEn ? 'Yemeni Local Payments (Kuraimi, Jeeb, Cash)' : 'دفع محلي يمني (كريمي، جيب، كاش)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#23096E]" />
                <span>{isEn ? 'Instant Booking Confirmation' : 'تأكيد حجز فوري ومباشر'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#FF3B30]" />
                <span>{isEn ? 'Offline Booking Voucher' : 'قسيمة حجز رقمية على الجوال'}</span>
              </div>
            </div>

          </div>

          {/* Interactive 3D Phone Mockup Showcase (Left Column on RTL) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Ambient Halo behind phone */}
            <div className="absolute w-80 h-80 bg-gradient-to-tr from-[#23096E]/25 to-[#FF3B30]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Phone Screen Toggle Selector */}
            <div className="flex items-center gap-2 mb-4 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-md z-20">
              <button
                onClick={() => setActiveScreenTab('search')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  activeScreenTab === 'search'
                    ? 'bg-[#23096E] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEn ? 'Search Screen' : 'شاشة البحث والاستكشاف'}
              </button>
              <button
                onClick={() => setActiveScreenTab('details')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  activeScreenTab === 'details'
                    ? 'bg-[#23096E] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEn ? 'Hotel & Amenities' : 'شاشة تفاصيل الفندق'}
              </button>
            </div>

            {/* Dual Phone Presentation */}
            <div className="relative flex items-center justify-center">
              
              {/* Main Realistic iPhone Device Frame */}
              <div className="relative w-[300px] sm:w-[320px] h-[600px] sm:h-[630px] rounded-[48px] border-[10px] border-slate-900 bg-slate-950 shadow-2xl shadow-[#23096E]/30 overflow-hidden z-10 transition-transform duration-500 hover:scale-[1.02]">
                
                {/* Dynamic Island Notch */}
                <div className="absolute top-2.5 inset-x-0 h-6 bg-black rounded-full z-30 w-28 mx-auto flex items-center justify-between px-3 border border-white/10 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/10" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
                </div>

                {/* Display Screen Content */}
                <div className="w-full h-full pt-6">
                  {activeScreenTab === 'search' ? (
                    <SearchAppScreen isEn={isEn} />
                  ) : (
                    <HotelDetailsAppScreen isEn={isEn} />
                  )}
                </div>

                {/* Home Indicator Bar */}
                <div className="absolute bottom-1.5 inset-x-0 w-32 h-1 bg-white/40 rounded-full mx-auto z-30 pointer-events-none" />
              </div>

              {/* Floating Live Highlights Badges Around Phone */}
              <div className="absolute -top-4 -start-8 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xl z-20 hidden sm:flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-9 h-9 rounded-xl bg-[#FF3B30] text-white flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <p className="text-[10px] text-slate-500 font-bold">{isEn ? 'Booking Speed' : 'سرعة التأكيد'}</p>
                  <p className="text-xs font-black text-[#23096E]">{isEn ? '< 60 Seconds' : 'أقل من دقيقة'}</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -end-6 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xl z-20 hidden sm:flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <BadgePercent className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <p className="text-[10px] text-slate-500 font-bold">{isEn ? 'Best Rate' : 'ضمان السعر'}</p>
                  <p className="text-xs font-black text-slate-900">{isEn ? 'Direct & Transparent' : 'مباشر وبدون وسيط'}</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
