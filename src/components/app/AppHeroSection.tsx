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
import { 
  SearchAppScreen, 
  HotelDetailsAppScreen, 
  IPhone17ProMaxFrame, 
  SamsungNote24UltraFrame 
} from './AppMockupScreens';

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
  };
}

export default function AppHeroSection({ isEn = false, data }: Props) {
  const badge = data?.badge || (isEn ? 'Msari Smart Travel App' : 'تطبيق مساري الذكي للجوال');
  const title = data?.title || (isEn ? 'Your Entire Journey in Yemen & Beyond — In One Smart App' : 'سفرك وفنادقك في جيبك — حمّل تطبيق مساري الآن');
  const subtitle = data?.subtitle || (isEn
    ? 'Book the best hotels in Yemen with instant confirmation, flexible local payments, and compare global hotels, flights, and car rentals effortlessly.'
    : 'احجز أفضل فنادق اليمن بتأكيد فوري ودفع محلي ميسر (المحافظ الإلكترونية، تحويل بنكي، كاش عند الوصول)، وقارن أسعار الفنادق وتذاكر الطيران والسيارات بضغطة زر.');
  
  const ratingVal = data?.rating ? data.rating.replace('★', '').trim() : '4.8';
  const downloadsVal = (data?.downloads && !data.downloads.includes('50,000') && !data.downloads.includes('50000')) 
    ? data.downloads.replace('تحميل', '').replace('Downloads', '').replace('مستخدم', '').replace('Users', '').trim() 
    : '5000+';
  const googlePlayUrl = data?.googlePlayUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStoreUrl = data?.appStoreUrl || 'https://apps.apple.com';

  const titlePart1 = title.split('—')[0] || title;
  const titlePart2 = title.split('—')[1] || '';

  // Device model switcher: iPhone 17 vs Samsung Note 24 Ultra
  const [deviceModel, setDeviceModel] = useState<'iphone17' | 'note24'>('iphone17');
  const [activeScreen, setActiveScreen] = useState<'search' | 'details'>('search');

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-24 bg-[#F4F2F8] text-[#0A0912] selection:bg-[#23096E] selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-10 right-1/4 w-[500px] h-[500px] bg-[#23096E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Content Column (Right on RTL) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-start">
            
            {/* Top Pill Badge (Removed V2.0 tag) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 border border-[#23096E]/15 text-[#23096E] text-xs sm:text-sm font-extrabold shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF3B30]" />
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <Heading level={1} variant="brand" className="tracking-tight text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
              {titlePart1}
              {titlePart2 && (
                <span className="block text-[#FF3B30] mt-1 sm:mt-2">
                  {titlePart2}
                </span>
              )}
            </Heading>

            {/* Subtitle */}
            <p className="text-[#423861] text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-semibold">
              {subtitle}
            </p>

            {/* Ratings & Downloads Social Proof Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-1">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-sm">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[#23096E] text-xs font-black">{ratingVal}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black text-[#23096E] bg-[#23096E]/10 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#23096E]/20">
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF3B30]" />
                <span>{downloadsVal}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                <span>{isEn ? '100% Free' : 'مجاني 100%'}</span>
              </div>
            </div>

            {/* Store Download Buttons & QR Code */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              
              {/* Badges Container (Compact on mobile) */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
                
                {/* Official Google Play Store Button (Compact on Mobile) */}
                <a
                  href={googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 sm:gap-3.5 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-xl sm:rounded-2xl shadow-lg shadow-[#23096E]/20 transition-all duration-300 transform hover:-translate-y-0.5 border border-white/10 group"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] sm:text-[10px] text-white/80 font-bold uppercase tracking-wider">GET IT ON</p>
                    <p className="text-xs sm:text-base font-black text-white leading-tight">Google Play</p>
                  </div>
                </a>

                {/* Official Apple App Store Button (Compact on Mobile) */}
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 sm:gap-3.5 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-xl sm:rounded-2xl shadow-lg shadow-[#23096E]/20 transition-all duration-300 transform hover:-translate-y-0.5 border border-white/10 group"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-white shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] sm:text-[10px] text-white/80 font-bold uppercase tracking-wider">Download on the</p>
                    <p className="text-xs sm:text-base font-black text-white leading-tight">App Store</p>
                  </div>
                </a>

              </div>

              {/* QR Code Box for Desktop */}
              <div className="hidden xl:flex items-center gap-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-md hover:border-[#23096E]/30 transition-all">
                <div className="relative w-12 h-12 bg-[#23096E] rounded-xl p-1 flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded bg-[#FF3B30] text-white flex items-center justify-center text-[8px] font-black border border-white">
                      م
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#0A0912] leading-tight font-extrabold max-w-[90px]">
                  {isEn ? 'Scan to Download' : 'امسح للتحميل المباشر'}
                </div>
              </div>

            </div>

            {/* Local Yemeni Payment & Security Assurances */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-[11px] sm:text-xs text-[#423861] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>خيارات دفع متعددة (محافظ، تحويل، كاش)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#23096E]" />
                <span>تأكيد حجز فوري ومباشر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF3B30]" />
                <span>متوافق مع آيفون وسامسونج</span>
              </div>
            </div>

          </div>

          {/* Interactive Mockup Showcase (Left Column on RTL) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative mt-4 lg:mt-0">
            
            {/* Ambient Halo behind phone */}
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 bg-gradient-to-tr from-[#23096E]/20 to-[#FF3B30]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Device Switcher (iPhone 17 vs Samsung Note 24 Ultra) */}
            <div className="flex items-center gap-2 mb-3 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm z-20">
              <button
                onClick={() => setDeviceModel('iphone17')}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  deviceModel === 'iphone17'
                    ? 'bg-[#23096E] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEn ? 'iPhone 17 Pro' : 'آيفون ١٧ برو'}
              </button>
              <button
                onClick={() => setDeviceModel('note24')}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  deviceModel === 'note24'
                    ? 'bg-[#23096E] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEn ? 'Samsung Note 24' : 'سامسونج نوت ٢٤'}
              </button>
            </div>

            {/* Device Render */}
            <div className="relative flex items-center justify-center scale-90 sm:scale-100 origin-top">
              {deviceModel === 'iphone17' ? (
                <IPhone17ProMaxFrame className="transition-transform duration-500 hover:scale-[1.02]">
                  {activeScreen === 'search' ? (
                    <SearchAppScreen isEn={isEn} />
                  ) : (
                    <HotelDetailsAppScreen isEn={isEn} />
                  )}
                </IPhone17ProMaxFrame>
              ) : (
                <SamsungNote24UltraFrame className="transition-transform duration-500 hover:scale-[1.02]">
                  {activeScreen === 'search' ? (
                    <SearchAppScreen isEn={isEn} />
                  ) : (
                    <HotelDetailsAppScreen isEn={isEn} />
                  )}
                </SamsungNote24UltraFrame>
              )}

              {/* Floating Live Highlights Badges */}
              <div className="absolute -top-3 -start-6 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xl z-20 hidden sm:flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-8 h-8 rounded-xl bg-[#FF3B30] text-white flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <p className="text-[9px] text-slate-500 font-bold">{isEn ? 'Booking Speed' : 'سرعة التأكيد'}</p>
                  <p className="text-xs font-black text-[#23096E]">{isEn ? '< 60 Seconds' : 'أقل من دقيقة'}</p>
                </div>
              </div>

              <div className="absolute -bottom-3 -end-5 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xl z-20 hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <BadgePercent className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <p className="text-[9px] text-slate-500 font-bold">{isEn ? 'Best Rate' : 'ضمان السعر'}</p>
                  <p className="text-xs font-black text-slate-900">{isEn ? 'Direct Hotel Rate' : 'سعر مباشر وبدون وسيط'}</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
