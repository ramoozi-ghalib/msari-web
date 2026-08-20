'use client';

import { useState, useRef } from 'react';
import { 
  Smartphone, MapPin, Search, Bell, Check, Sparkles
} from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const badge = appDownload?.badgeAr || 'تطبيق مساري للهواتف الذكية';
  const title = appDownload?.titleAr || 'حمّل تطبيق مساري الآن';
  const subtitle = appDownload?.subtitleAr || 'احجز فنادقك وتنقلاتك من أي مكان وفي أي وقت بسهولة وأمان';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normalize from -1 to +1, then scale up for a strong, fluid 3D tilt response
    const nx = (clientX - rect.left) / rect.width - 0.5;
    const ny = (clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: nx * 24, y: ny * -20 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsHovered(true);
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleReset = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section className="py-12 sm:py-18 lg:py-24 bg-gradient-to-b from-[#FAF8FD] via-white to-[#F6F4FA] border-t border-neutral-100 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
          style={{ direction: 'rtl' }}
        >
          
          {/* ── 1. Content Column: Clean Typography & Prominent Store Badges ── */}
          <div className="lg:col-span-6 text-center lg:text-start space-y-5 sm:space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black border border-[var(--brand-primary)]/15 shadow-sm">
              <Smartphone size={14} className="text-[#FF3B30]" />
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--brand-primary)] tracking-tight leading-tight">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-neutral-600 text-sm sm:text-base lg:text-lg font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            {/* ── Prominent Official Store Download Buttons ── */}
            <div className="pt-2 sm:pt-4 flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-initial">
              
              {/* Google Play Button */}
              <a
                href={playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3.5 bg-black hover:bg-neutral-900 text-white rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 border border-neutral-800 group"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 512 512">
                  <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                  <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                  <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                  <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                </svg>
                <div className="text-start leading-none">
                  <span className="block text-[7px] sm:text-[8px] text-neutral-400 font-bold uppercase mb-0.5">GET IT ON</span>
                  <span className="block text-[12px] sm:text-[14px] font-black text-white tracking-tight">Google Play</span>
                </div>
              </a>

              {/* App Store Button */}
              <a
                href={appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3.5 bg-black hover:bg-neutral-900 text-white rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 border border-neutral-800 group"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                </svg>
                <div className="text-start leading-none">
                  <span className="block text-[7px] sm:text-[8px] text-neutral-400 font-bold uppercase mb-0.5">Download on the</span>
                  <span className="block text-[12px] sm:text-[14px] font-black text-white tracking-tight">App Store</span>
                </div>
              </a>

            </div>

          </div>

          {/* ── 2. TRUE 3D DUAL HARDWARE FLAGSHIPS (High Dynamic Physics & Accurate Ground Contact Shadows) ── */}
          <div 
            ref={containerRef}
            className="lg:col-span-6 flex items-center justify-center pt-4 lg:pt-0 cursor-grab active:cursor-grabbing select-none"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleReset}
            onTouchStart={() => setIsHovered(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleReset}
          >
            {/* Grounding Stage */}
            <div className="relative w-full flex flex-col items-center justify-end">
              
              {/* Studio Flat Floor Line */}
              <div className="w-[85%] max-w-[440px] h-[1px] bg-gradient-to-r from-transparent via-neutral-300/80 to-transparent absolute bottom-6 z-0" />
              
              <div 
                className="relative w-full flex items-end justify-center gap-4 xs:gap-6 sm:gap-8 lg:gap-10 pb-6 pt-4"
                style={{
                  perspective: '1200px',
                  transformStyle: 'preserve-3d',
                }}
              >
                
                {/* ── 1. SAMSUNG GALAXY S24 ULTRA ── */}
                <div className="relative group/s24 shrink-0 flex flex-col items-center">
                  
                  {/* S24 Ultra Realistic Multi-Layered Ground Contact Shadow */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[85%] h-2.5 bg-neutral-950/85 rounded-full blur-[2px] transform scale-y-40 pointer-events-none z-0" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[105%] h-5 bg-neutral-900/35 rounded-full blur-[5px] transform scale-y-30 pointer-events-none z-0" />
                  <div className="absolute -bottom-4.5 left-1/2 -translate-x-1/2 w-[130%] h-8 bg-neutral-800/15 rounded-full blur-md transform scale-y-25 pointer-events-none z-0" />

                  {/* S24 Ultra Hardware Body with Dynamic Tilt */}
                  <div 
                    className="relative w-[145px] xs:w-[165px] sm:w-[200px] lg:w-[220px] h-[310px] xs:h-[350px] sm:h-[420px] lg:h-[460px] rounded-none bg-gradient-to-b from-[#2E2822] via-[#1A1612] to-[#0A0806] p-[2.5px] sm:p-[3px] border-[1.5px] sm:border-[2px] border-[#9E9382] shadow-sm transition-transform duration-200 ease-out z-10"
                    style={{
                      transform: `rotateY(${isHovered ? -12 + mousePos.x * 0.85 : -10}deg) rotateX(${isHovered ? 4 + mousePos.y * 0.75 : 4}deg) rotateZ(-1deg) translateZ(${isHovered ? 15 : 0}px)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Hardware Volume Buttons */}
                    <div className="absolute -left-[3px] top-16 w-[1.5px] h-8 bg-[#9E9382] rounded-l-none" />
                    <div className="absolute -left-[3px] top-28 w-[1.5px] h-10 bg-[#9E9382] rounded-l-none" />

                    {/* S24 Ultra AMOLED Screen */}
                    <div className="w-full h-full bg-[#0C051B] text-white rounded-none overflow-hidden relative flex flex-col justify-between border border-white/10 select-none">
                      
                      {/* Dynamic Glass Specular Reflection */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transition-transform duration-200 z-30"
                        style={{
                          transform: `translateX(${mousePos.x * 2}px) translateY(${mousePos.y * 2}px)`,
                        }}
                      />

                      {appDownload?.samsungScreenImageUrl ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={appDownload.samsungScreenImageUrl} 
                            alt="Samsung App Screen" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <>
                          {/* Top Status Bar & Centered Punch-Hole Camera */}
                          <div className="relative pt-1 px-2 sm:px-3 flex items-center justify-between text-[6.5px] sm:text-[8px] font-bold text-neutral-300 z-20">
                            <span>11:35</span>
                            {/* S24 Ultra Punch Hole */}
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-black border border-neutral-800 shadow-inner flex items-center justify-center">
                              <div className="w-0.8 h-0.8 rounded-full bg-[#111119]" />
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1 text-[6px] sm:text-[7.5px]">
                              <span>5G</span>
                              <span>93%</span>
                            </div>
                          </div>

                          {/* App Screen Content: Msari Hotel Search */}
                          <div className="px-2 sm:px-3 pt-1 space-y-1.5 sm:space-y-2 relative z-10 flex-1 overflow-hidden text-start">
                            
                            {/* App Logo & Search */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded bg-[#FF3B30] text-white flex items-center justify-center font-black text-[7px] sm:text-[8.5px] shadow-sm">
                                  م
                                </div>
                                <span className="text-[10px] sm:text-xs font-black text-white">مساري</span>
                              </div>
                              <span className="text-[6.5px] sm:text-[7.5px] font-bold text-[#FF3B30] bg-[#FF3B30]/15 px-1.5 py-0.2 rounded-full">اليمن</span>
                            </div>

                            {/* Search Field */}
                            <div className="p-1 sm:p-1.5 rounded-lg bg-white/10 border border-white/15 flex items-center gap-1 text-[7px] sm:text-[8px] text-white/90 shadow-sm backdrop-blur-md">
                              <Search size={8} className="text-[#FF3B30]" />
                              <span className="truncate">ابحث عن مدينة أو فندق...</span>
                            </div>

                            {/* Service Tabs */}
                            <div className="flex items-center gap-1 text-[6.5px] sm:text-[7.5px] font-bold">
                              <div className="flex-1 py-0.5 sm:py-1 rounded bg-[#FF3B30] text-white text-center shadow-sm">فنادق</div>
                              <div className="flex-1 py-0.5 sm:py-1 rounded bg-white/10 text-white/70 text-center">رحلات</div>
                              <div className="flex-1 py-0.5 sm:py-1 rounded bg-white/10 text-white/70 text-center">سيارات</div>
                            </div>

                            {/* Hotel Card 1 */}
                            <div className="p-1.5 sm:p-2 rounded-xl bg-white/10 border border-white/10 space-y-0.5 sm:space-y-1 backdrop-blur-sm">
                              <div className="flex items-center justify-between text-[7px] sm:text-[7.5px] font-black text-white">
                                <span className="truncate">فندق القصر - عدن</span>
                                <span className="text-amber-400">★ 4.9</span>
                              </div>
                              <div className="text-[6px] sm:text-[6.5px] text-white/60 flex items-center gap-1">
                                <MapPin size={6} />
                                <span>الحسوة، عدن</span>
                              </div>
                              <div className="flex items-center justify-between pt-0.5 border-t border-white/10">
                                <span className="text-[7px] sm:text-[7.5px] font-black text-emerald-400">$85/ليلة</span>
                                <span className="px-1.5 py-0.2 rounded bg-[#FF3B30] text-white text-[6px] sm:text-[6.5px] font-black">احجز</span>
                              </div>
                            </div>

                          </div>

                          {/* S24 Ultra Android Bottom Nav Gesture Bar */}
                          <div className="pb-1 text-center">
                            <div className="w-10 sm:w-14 h-0.8 bg-white/40 rounded-full mx-auto" />
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                </div>

                {/* ── 2. IPHONE 16/17 PRO ── */}
                <div className="relative group/iphone shrink-0 flex flex-col items-center">
                  
                  {/* iPhone Realistic Multi-Layered Ground Contact Shadow */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[85%] h-2.5 bg-neutral-950/85 rounded-full blur-[2px] transform scale-y-40 pointer-events-none z-0" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[105%] h-5 bg-neutral-900/35 rounded-full blur-[5px] transform scale-y-30 pointer-events-none z-0" />
                  <div className="absolute -bottom-4.5 left-1/2 -translate-x-1/2 w-[130%] h-8 bg-neutral-800/15 rounded-full blur-md transform scale-y-25 pointer-events-none z-0" />

                  {/* iPhone Hardware Body with Dynamic Tilt */}
                  <div 
                    className="relative w-[145px] xs:w-[165px] sm:w-[200px] lg:w-[220px] h-[315px] xs:h-[355px] sm:h-[425px] lg:h-[465px] rounded-[30px] sm:rounded-[38px] lg:rounded-[42px] bg-gradient-to-b from-[#3D352E] via-[#1E1914] to-[#0A0806] p-[2.5px] sm:p-[3.5px] border-[2px] sm:border-[2.5px] border-[#C8BEB0] shadow-sm transition-transform duration-200 ease-out z-20"
                    style={{
                      transform: `rotateY(${isHovered ? 12 + mousePos.x * 0.85 : 10}deg) rotateX(${isHovered ? 4 + mousePos.y * 0.75 : 4}deg) rotateZ(1deg) translateZ(${isHovered ? 25 : 10}px)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* iPhone Action Button & Volume Buttons */}
                    <div className="absolute -right-[3px] top-20 w-[1.5px] h-5 bg-[#C8BEB0] rounded-r-sm" />
                    <div className="absolute -right-[3px] top-28 w-[1.5px] h-10 bg-[#C8BEB0] rounded-r-sm" />
                    <div className="absolute -left-[3px] top-24 w-[1.5px] h-12 bg-[#C8BEB0] rounded-l-sm" />

                    {/* iPhone Super Retina XDR OLED Screen */}
                    <div className="w-full h-full bg-[#110528] text-white rounded-[26px] sm:rounded-[34px] lg:rounded-[38px] overflow-hidden relative flex flex-col justify-between border border-white/10 select-none">
                      
                      {/* Dynamic Glass Specular Reflection */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transition-transform duration-200 z-30"
                        style={{
                          transform: `translateX(${mousePos.x * 2}px) translateY(${mousePos.y * 2}px)`,
                        }}
                      />

                      {appDownload?.iphoneScreenImageUrl ? (
                        <div className="relative w-full h-full rounded-[26px] sm:rounded-[34px] lg:rounded-[38px] overflow-hidden">
                          <img 
                            src={appDownload.iphoneScreenImageUrl} 
                            alt="iPhone App Screen" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <>
                          {/* Dynamic Island Header */}
                          <div className="pt-1.5 px-2.5 sm:px-3.5 flex items-center justify-between text-[6.5px] sm:text-[8px] font-bold text-neutral-300 relative z-20">
                            <span>9:41</span>
                            {/* Dynamic Island Pill */}
                            <div className="w-11 sm:w-14 h-3 sm:h-3.5 bg-black rounded-full mx-auto flex items-center justify-between px-1.5 shadow-inner border border-neutral-900">
                              <div className="w-1 h-1 rounded-full bg-[#FF3B30] animate-pulse" />
                              <div className="w-1 h-1 rounded-full bg-[#1A1A26]" />
                            </div>
                            <div className="flex items-center gap-0.5">
                              <div className="w-2.5 h-1.5 border border-white/70 rounded-xs p-0.5">
                                <div className="w-full h-full bg-white rounded-2xs" />
                              </div>
                            </div>
                          </div>

                          {/* App Screen Content: Msari Booking Details */}
                          <div className="px-2 sm:px-3 pt-0.5 sm:pt-1 space-y-1.5 sm:space-y-2 relative z-10 flex-1 overflow-hidden text-start">
                            
                            {/* Top App Header */}
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-[8px] sm:text-[9.5px] font-black text-white">مرحباً بك في مساري</div>
                                <div className="text-[6px] sm:text-[7px] text-white/70 font-semibold truncate">احجز إقامتك بأفضل سعر</div>
                              </div>
                              <div className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                                <Bell size={8} className="text-white" />
                              </div>
                            </div>

                            {/* Highlighted Destination Card */}
                            <div className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#2C0F7C] to-[#160549] border border-white/20 space-y-0.5 sm:space-y-1 shadow-lg">
                              <div className="flex items-center justify-between text-[6.5px] sm:text-[7.5px]">
                                <span className="font-black text-amber-300">عرض حصري</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-[#FF3B30] text-[5.5px] sm:text-[6px] font-black">خصم 25%</span>
                              </div>
                              <div className="text-[7.5px] sm:text-[8.5px] font-black text-white truncate">فندق كورال عدن</div>
                              <div className="text-[5.5px] sm:text-[6.5px] text-white/70 truncate">مطلة على البحر + إفطار</div>
                              <div className="flex items-center justify-between pt-0.5">
                                <div>
                                  <span className="text-[7.5px] sm:text-[8.5px] font-black text-white">$95</span>
                                  <span className="text-[5.5px] sm:text-[6.5px] text-white/50 line-through mr-0.5">$120</span>
                                </div>
                                <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded bg-[#FF3B30] text-white text-[6px] sm:text-[7px] font-black shadow-md">
                                  تأكيد
                                </span>
                              </div>
                            </div>

                            {/* Quick Features Row */}
                            <div className="grid grid-cols-2 gap-1 text-[5.5px] sm:text-[6.5px] font-bold text-white/80">
                              <div className="p-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-0.5">
                                <Check size={6.5} className="text-emerald-400" />
                                <span>إلغاء مجاني</span>
                              </div>
                              <div className="p-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-0.5">
                                <Sparkles size={6.5} className="text-amber-400" />
                                <span>دفع بالوصول</span>
                              </div>
                            </div>

                          </div>

                          {/* iPhone iOS Home Indicator Bar */}
                          <div className="pb-1 text-center">
                            <div className="w-12 sm:w-16 h-0.8 bg-white/60 rounded-full mx-auto shadow-sm" />
                          </div>
                        </>
                      )}

                    </div>
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
