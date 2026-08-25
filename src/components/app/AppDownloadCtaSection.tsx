'use client';

import React from 'react';
import { Sparkles, QrCode, ShieldCheck, Download, Star } from 'lucide-react';
import { SearchAppScreen } from './AppMockupScreens';

interface Props {
  isEn?: boolean;
  data?: {
    ctaTitle?: string;
    ctaSubtitle?: string;
    googlePlayUrl?: string;
    appStoreUrl?: string;
  };
}

export default function AppDownloadCtaSection({ isEn = false, data }: Props) {
  const ctaTitle = data?.ctaTitle || (isEn ? 'Ready for a Superior Booking Experience?' : 'جاهز لتجربة حجز فندقي أسهل وأسرع؟');
  const ctaSubtitle = data?.ctaSubtitle || (isEn
    ? 'Download Msari App now for free and enjoy guaranteed bookings across Yemen with 24/7 local support.'
    : 'حمّل تطبيق مساري مجاناً الآن واستمتع بحجز فوري ومؤكد لأفضل فنادق اليمن مع دعم فني متواصل على مدار الساعة.');
  
  const googlePlayUrl = data?.googlePlayUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStoreUrl = data?.appStoreUrl || 'https://apps.apple.com';

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white container-msari px-4 sm:px-6">
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-12 lg:p-16 shadow-2xl border border-white/20"
        style={{
          background: 'linear-gradient(135deg, #1C0657 0%, #23096E 40%, #3A1C8F 100%)',
        }}
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF3B30]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#23096E]/50 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          
          {/* Content Column (Right on RTL) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6 text-center lg:text-start">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
              <span>{isEn ? 'Download Now for Free' : 'التحميل مجاني 100%'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
              {ctaTitle}
            </h2>

            <p className="text-[#F4F2F8] text-xs sm:text-sm lg:text-base font-medium max-w-2xl leading-relaxed">
              {ctaSubtitle}
            </p>

            {/* Store Buttons + QR (Compact on mobile) */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              
              <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
                {/* Google Play */}
                <a
                  href={googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 sm:gap-3.5 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-white hover:bg-[#FF3B30] text-[#23096E] hover:text-white rounded-xl sm:rounded-2xl shadow-xl font-black transition-all transform hover:-translate-y-0.5 group"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] sm:text-[10px] text-slate-500 group-hover:text-white/80 font-bold uppercase leading-none">GET IT ON</p>
                    <p className="text-xs sm:text-base font-black leading-tight">Google Play</p>
                  </div>
                </a>

                {/* App Store */}
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 sm:gap-3.5 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-white hover:bg-[#FF3B30] text-[#23096E] hover:text-white rounded-xl sm:rounded-2xl shadow-xl font-black transition-all transform hover:-translate-y-0.5 group"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-[#23096E] group-hover:text-white shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] sm:text-[10px] text-slate-500 group-hover:text-white/80 font-bold uppercase leading-none">Download on the</p>
                    <p className="text-xs sm:text-base font-black leading-tight">App Store</p>
                  </div>
                </a>
              </div>

              {/* QR Code */}
              <div className="hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5">
                <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center">
                  <QrCode className="w-full h-full text-[#23096E]" />
                </div>
                <div className="text-[10px] text-white/90 leading-tight font-extrabold max-w-[80px]">
                  {isEn ? 'Scan to Download' : 'امسح للتحميل السريع'}
                </div>
              </div>

            </div>

            {/* Micro trust row */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-[11px] text-white/80 font-bold">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.8 / 5.0 {isEn ? 'on Store' : 'على المتاجر'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? '100% Safe & Verified' : 'آمن وموثوق 100%'}</span>
              </span>
            </div>

          </div>

          {/* Phone Peek Mockup Column (Left on RTL) */}
          <div className="lg:col-span-4 hidden lg:flex justify-center relative">
            <div className="relative w-[260px] h-[480px] rounded-[40px] border-[6px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full pt-4 scale-95 origin-top">
                <SearchAppScreen isEn={isEn} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
