'use client';

import Image from 'next/image';
import { QrCode, Smartphone, Sparkles, Star, ShieldCheck } from 'lucide-react';
import Heading from '@/components/ui/Heading';

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
  const badge = data?.badge || (isEn ? 'Msari Mobile Smart App' : 'تطبيق مساري الذكي للجوال');
  const title = data?.title || (isEn ? 'Your Entire Journey in Your Pocket — Download Msari App Now' : 'سفرك بأكمله في جيبك — حمّل تطبيق مساري الآن');
  const subtitle = data?.subtitle || (isEn
    ? 'Book the best hotels in Yemen, compare global hotel rates, flights, and car rentals effortlessly with a single tap.'
    : 'احجز أفضل فنادق اليمن وقارن أسعار الفنادق العالمية ورحلات الطيران والسيارات بسهولة بضغطة زر واحدة.');
  
  const ratingVal = data?.rating || '4.0';
  const downloadsVal = data?.downloads || '5000+';
  const googlePlayUrl = data?.googlePlayUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStoreUrl = data?.appStoreUrl || 'https://apps.apple.com';

  const titlePart1 = title.split('—')[0] || title;
  const titlePart2 = title.split('—')[1] || '';

  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-[#F4F2F8] text-[#0A0912] surface-page">
      {/* Background Ambient Brand Color Soft Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#23096E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Right Column: Hero Content & Store Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs sm:text-sm font-extrabold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#FF3B30]" />
              <span>{badge}</span>
            </div>

            {/* Governance Main Headline */}
            <Heading level={1} variant="brand">
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

            {/* Golden Rating Stars & Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[#23096E] text-sm font-black">{ratingVal} / 5.0</span>
              <span className="text-slate-300 text-sm">|</span>
              <span className="text-[#5c4f82] text-sm font-bold">
                {isEn ? `User Rating (${downloadsVal} Downloads)` : `تقييم المستخدمين (${downloadsVal} تحميل)`}
              </span>
            </div>

            {/* Store Buttons & QR Box Container */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              
              {/* Badges Column */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                
                {/* Official Google Play Store Colored Badge */}
                <a
                  href={googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 px-6 py-3.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-2xl shadow-xl shadow-[#23096E]/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/10"
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

                {/* Official Apple App Store Badge */}
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 px-6 py-3.5 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-2xl shadow-xl shadow-[#23096E]/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/10"
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

              {/* QR Code Container */}
              <div className="hidden xl:flex items-center gap-3 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-lg">
                <div className="relative w-16 h-16 bg-[#23096E] rounded-xl p-1.5 flex items-center justify-center">
                  <QrCode className="w-full h-full text-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded bg-[#FF3B30] text-white flex items-center justify-center text-[10px] font-black border border-white">
                      م
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#0A0912] max-w-[110px] leading-snug font-extrabold">
                  {isEn ? 'Scan QR Code to Download' : 'امسح الرمز بالكاميرا للتحميل المباشر'}
                </div>
              </div>

            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#423861] font-bold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                <span>{isEn ? '100% Secure Booking' : 'حجز آمن 100%'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4.5 h-4.5 text-[#23096E]" />
                <span>{isEn ? 'iOS & Android Compatible' : 'متوافق مع أندرويد و iOS'}</span>
              </div>
            </div>

          </div>

          {/* Left Column: Premium 3D Phone Mockups Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            
            {/* Ambient Backlight Halo */}
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 bg-[#23096E]/20 rounded-full blur-3xl" />

            {/* Dual Phone Frames */}
            <div className="relative flex items-center justify-center">
              
              {/* Secondary Back Phone */}
              <div className="relative w-56 sm:w-64 h-[440px] sm:h-[500px] rounded-[40px] border-4 border-slate-300 bg-slate-950 shadow-2xl overflow-hidden transform -rotate-6 -translate-x-6 sm:-translate-x-8 opacity-90 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="absolute top-0 inset-x-0 h-5 bg-slate-950 rounded-b-xl z-20 w-32 mx-auto" />
                <Image
                  src={data?.heroPhoneImage2 || "https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_0.jpg?alt=media&token=7fa51dd1-b3b3-4f05-8968-3f596a77d542"}
                  alt="تطبيق مساري حجز الفنادق"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-6 inset-x-4 text-center">
                  <span className="inline-block px-3 py-1 bg-[#FF3B30] text-white font-black text-xs rounded-full shadow-lg">
                    {isEn ? 'Yemen Hotels' : 'فنادق اليمن'}
                  </span>
                </div>
              </div>

              {/* Main Front Phone Frame */}
              <div className="relative w-64 sm:w-72 h-[480px] sm:h-[540px] rounded-[44px] border-[6px] border-[#23096E] bg-slate-950 shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105 z-10">
                <div className="absolute top-2 inset-x-0 h-6 bg-slate-900 rounded-full z-20 w-28 mx-auto border border-slate-800 flex items-center justify-between px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A1C8F]/60" />
                </div>

                <div className="relative w-full h-full pt-8 px-4 pb-6 bg-gradient-to-b from-[#23096E] via-[#2d1580] to-[#3A1C8F] flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF3B30] flex items-center justify-center font-black text-white text-xs shadow-md">
                          م
                        </div>
                        <div>
                          <p className="text-[10px] text-white/80 font-bold">{isEn ? 'Welcome to' : 'مرحباً بك في'}</p>
                          <p className="text-xs font-black text-white">{isEn ? 'Msari App' : 'تطبيق مساري'}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold">
                        {isEn ? 'Active Now' : 'نشط الآن'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/15 border border-white/25 text-xs text-white flex items-center justify-between font-bold">
                      <span>{isEn ? 'Search Aden, Sanaa hotels...' : 'ابحث عن فنادق عدن، صنعاء...'}</span>
                      <span className="p-1 rounded bg-[#FF3B30] text-white font-black">🔍</span>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-slate-950/90 p-2 space-y-2">
                    <div className="relative h-32 rounded-xl overflow-hidden">
                      <Image
                        src={data?.heroPhoneImage1 || "https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_0.jpg?alt=media&token=2b00ded4-8b95-4efe-bc46-62e0ebdb178e"}
                        alt="فندق هورايزن عدن"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <div>
                        <p className="text-xs font-black text-white">{isEn ? 'Horizon Aden Hotel' : 'فندق هورايزن عدن'}</p>
                        <p className="text-[10px] text-slate-300 font-medium">{isEn ? 'Abyan Coast, Aden' : 'ساحل أبين، عدن'}</p>
                      </div>
                      <div className="text-end">
                        <span className="text-xs font-black text-[#FF3B30]">$60</span>
                        <span className="text-[9px] text-slate-300 block">{isEn ? '/night' : '/ليلة'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full py-2.5 rounded-xl bg-[#FF3B30] text-white text-center font-black text-xs shadow-xl">
                    {isEn ? 'Instant Book' : 'احجز الآن بضغطة زر'}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
