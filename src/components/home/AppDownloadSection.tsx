'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Smartphone, ShieldCheck, Zap, Tag, Star, 
  MapPin, Search, Calendar, User, Heart, Home,
  Bell, SlidersHorizontal, ArrowLeft, Check, Sparkles
} from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const badge = appDownload?.badgeAr || 'تطبيق مساري للهواتف الذكية';
  const title = 'حمّل تطبيق مساري الآن';
  const subtitle = 'احجز فنادقك وتنقلاتك من أي مكان وفي أي وقت بسهولة وأمان';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMousePos({ x, y });
  };

  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-gradient-to-b from-[#FDFCFF] via-[#F5F2FB] to-white border-t border-neutral-100 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center"
          style={{ direction: 'rtl' }}
        >
          
          {/* ── 1. Text Information, Perks, QR Code & Store Badges (Mobile Order: 1, Desktop: Right) ── */}
          <div className="lg:col-span-6 text-center lg:text-start space-y-4 sm:space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black border border-[var(--brand-primary)]/15 shadow-sm">
              <Smartphone size={13} className="text-[#FF3B30]" />
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--brand-primary)] tracking-tight leading-tight">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-neutral-600 text-xs sm:text-base lg:text-lg font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            {/* App Features / Perks List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2 max-w-xl mx-auto lg:mx-0">
              {[
                { title: 'تأكيد فوري', desc: 'حجز فوري ومضمون', icon: Zap, color: 'from-[#23096E] to-[#3A1C8F]' },
                { title: 'دفع آمن', desc: 'خيارات دفع متعددة', icon: ShieldCheck, color: 'from-[#3A1C8F] to-[#23096E]' },
                { title: 'أسعار حصرية', desc: 'خصومات مستخدمي التطبيق', icon: Tag, color: 'from-[#FF3B30] to-[#23096E]' },
              ].map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="p-3 sm:p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-[var(--brand-primary)]/40 transition-all text-start flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${perk.color} text-white flex items-center justify-center shrink-0 sm:mb-2 shadow-sm`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-neutral-900 leading-snug">{perk.title}</h4>
                      <p className="text-[10px] sm:text-[10.5px] text-neutral-500 font-medium">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── QR Code + Official App Store Download Badges Row ── */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-5 w-full">
              
              {/* Crisp Vector QR Code Box */}
              <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-white rounded-2xl border border-neutral-200 shadow-md shrink-0 group hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-0.5 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 fill-current">
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="#23096E" />
                    <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                    <rect x="13" y="13" width="12" height="12" rx="2" fill="#23096E" />

                    <rect x="67" y="5" width="28" height="28" rx="4" fill="#23096E" />
                    <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                    <rect x="75" y="13" width="12" height="12" rx="2" fill="#23096E" />

                    <rect x="5" y="67" width="28" height="28" rx="4" fill="#23096E" />
                    <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                    <rect x="13" y="75" width="12" height="12" rx="2" fill="#23096E" />

                    <rect x="71" y="71" width="16" height="16" rx="2" fill="#23096E" />
                    <rect x="74" y="74" width="10" height="10" rx="1" fill="white" />
                    <rect x="77" y="77" width="4" height="4" fill="#FF3B30" />

                    <rect x="38" y="8" width="5" height="5" rx="1" />
                    <rect x="48" y="8" width="5" height="5" rx="1" />
                    <rect x="58" y="8" width="5" height="5" rx="1" />
                    
                    <rect x="8" y="38" width="5" height="5" rx="1" />
                    <rect x="18" y="48" width="5" height="5" rx="1" />
                    <rect x="28" y="38" width="5" height="5" rx="1" />

                    <rect x="38" y="38" width="8" height="8" rx="2" fill="#FF3B30" />
                    <rect x="52" y="38" width="8" height="8" rx="2" fill="#23096E" />
                    <rect x="38" y="52" width="8" height="8" rx="2" fill="#23096E" />
                    <rect x="52" y="52" width="8" height="8" rx="2" fill="#FF3B30" />

                    <rect x="68" y="38" width="5" height="5" rx="1" />
                    <rect x="78" y="48" width="5" height="5" rx="1" />
                    <rect x="88" y="38" width="5" height="5" rx="1" />

                    <rect x="38" y="68" width="5" height="5" rx="1" />
                    <rect x="48" y="78" width="5" height="5" rx="1" />
                    <rect x="58" y="68" width="5" height="5" rx="1" />
                  </svg>
                </div>
                <div className="text-start leading-tight">
                  <span className="block text-[11px] font-black text-neutral-900">امسح الكود</span>
                  <span className="block text-[9px] text-neutral-500 font-bold">للتحميل المباشر</span>
                </div>
              </div>

              {/* Official Store Buttons (Side-by-Side in 1 Row) */}
              <div className="flex flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-initial">
                
                {/* Google Play */}
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl sm:rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 border border-neutral-800"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start leading-none">
                    <span className="block text-[6.5px] sm:text-[7.5px] text-neutral-400 font-bold uppercase mb-0.5">GET IT ON</span>
                    <span className="block text-[11.5px] sm:text-[13px] font-black text-white tracking-tight">Google Play</span>
                  </div>
                </a>

                {/* App Store */}
                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl sm:rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 border border-neutral-800"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start leading-none">
                    <span className="block text-[6.5px] sm:text-[7.5px] text-neutral-400 font-bold uppercase mb-0.5">Download on the</span>
                    <span className="block text-[11.5px] sm:text-[13px] font-black text-white tracking-tight">App Store</span>
                  </div>
                </a>

              </div>

            </div>

          </div>

          {/* ── 2. TRUE 3D DUAL HARDWARE FLAGSHIPS MOCKUP (Scaled & Responsive for all screens) ── */}
          <div 
            className="lg:col-span-6 flex items-center justify-center pt-2 sm:pt-4 lg:pt-0 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
          >
            {/* Scaled viewport container for mobile (<640px = 0.72x scale, <768px = 0.85x scale, desktop = 1.0x) */}
            <div className="transform scale-[0.70] xs:scale-[0.78] sm:scale-[0.88] md:scale-95 lg:scale-100 origin-center py-4 sm:py-6">
              <div 
                className="relative w-[340px] sm:w-[420px] lg:w-[460px] h-[460px] sm:h-[500px] lg:h-[520px] flex items-center justify-center"
                style={{
                  perspective: '1400px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Realistic Ground Floor Radial Shadow */}
                <div className="absolute -bottom-2 w-[340px] sm:w-[380px] h-12 bg-black/35 rounded-full blur-2xl transform scale-y-50 pointer-events-none" />

                {/* ── 1. SAMSUNG GALAXY S24 ULTRA (Left: Sharp 90° Corners, Titanium Chassis, Punch-Hole) ── */}
                <div 
                  className="absolute right-[50%] mr-[-40px] sm:mr-[-30px] top-6 w-[205px] sm:w-[225px] lg:w-[230px] h-[430px] sm:h-[460px] lg:h-[475px] rounded-none bg-gradient-to-b from-[#2E2822] via-[#1A1612] to-[#0A0806] p-[3px] border-[2px] border-[#9E9382] shadow-[-20px_25px_50px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out z-10"
                  style={{
                    transform: `rotateY(${isHovered ? -18 + mousePos.x * 0.4 : -16}deg) rotateX(${isHovered ? 8 + mousePos.y * 0.4 : 8}deg) rotateZ(-3deg) translateZ(0px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Hardware Volume Buttons */}
                  <div className="absolute -left-[4px] top-20 w-[2px] h-10 bg-[#9E9382] rounded-l-none" />
                  <div className="absolute -left-[4px] top-34 w-[2px] h-14 bg-[#9E9382] rounded-l-none" />

                  {/* S24 Ultra AMOLED Screen */}
                  <div className="w-full h-full bg-[#0C051B] text-white rounded-none overflow-hidden relative flex flex-col justify-between border border-white/10 select-none">
                    
                    {/* Glass Reflection Glint */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                    {/* Top Status Bar & Centered Punch-Hole Camera */}
                    <div className="relative pt-1.5 px-3 flex items-center justify-between text-[8px] font-bold text-neutral-300 z-20">
                      <span>11:35</span>
                      {/* S24 Ultra Punch Hole */}
                      <div className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-800 shadow-inner flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-[#111119]" />
                      </div>
                      <div className="flex items-center gap-1 text-[7.5px]">
                        <span>5G</span>
                        <span>93%</span>
                      </div>
                    </div>

                    {/* App Screen Content: Msari Hotel Search */}
                    <div className="px-3 pt-1.5 space-y-2 relative z-10 flex-1 overflow-hidden text-start">
                      
                      {/* App Logo & Search */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4.5 h-4.5 rounded-md bg-[#FF3B30] text-white flex items-center justify-center font-black text-[8.5px] shadow-sm">
                            م
                          </div>
                          <span className="text-xs font-black text-white">مساري</span>
                        </div>
                        <span className="text-[7.5px] font-bold text-[#FF3B30] bg-[#FF3B30]/15 px-2 py-0.5 rounded-full">اليمن</span>
                      </div>

                      {/* Search Field */}
                      <div className="p-1.5 rounded-xl bg-white/10 border border-white/15 flex items-center gap-1.5 text-[8px] text-white/90 shadow-sm backdrop-blur-md">
                        <Search size={9} className="text-[#FF3B30]" />
                        <span>ابحث عن مدينة أو فندق...</span>
                      </div>

                      {/* Service Tabs */}
                      <div className="flex items-center gap-1 text-[7.5px] font-bold">
                        <div className="flex-1 py-1 rounded-lg bg-[#FF3B30] text-white text-center shadow-sm">فنادق</div>
                        <div className="flex-1 py-1 rounded-lg bg-white/10 text-white/70 text-center">رحلات</div>
                        <div className="flex-1 py-1 rounded-lg bg-white/10 text-white/70 text-center">سيارات</div>
                      </div>

                      {/* Hotel Card 1 */}
                      <div className="p-2 rounded-xl bg-white/10 border border-white/10 space-y-1 backdrop-blur-sm">
                        <div className="flex items-center justify-between text-[7.5px] font-black text-white">
                          <span>فندق القصر - عدن</span>
                          <span className="text-amber-400">★ 4.9</span>
                        </div>
                        <div className="text-[6.5px] text-white/60 flex items-center gap-1">
                          <MapPin size={6.5} />
                          <span>الحسوة، عدن</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/10">
                          <span className="text-[7.5px] font-black text-emerald-400">$85 / ليلة</span>
                          <span className="px-2 py-0.5 rounded bg-[#FF3B30] text-white text-[6.5px] font-black">احجز</span>
                        </div>
                      </div>

                    </div>

                    {/* S24 Ultra Android Bottom Nav Gesture Bar */}
                    <div className="pb-1 text-center">
                      <div className="w-14 h-0.8 bg-white/40 rounded-full mx-auto" />
                    </div>

                  </div>
                </div>

                {/* ── 2. IPHONE 16/17 PRO (Right: Contoured Titanium Bezel, Dynamic Island, Leaning Front) ── */}
                <div 
                  className="absolute left-[50%] ml-[-40px] sm:ml-[-30px] top-2 w-[205px] sm:w-[225px] lg:w-[230px] h-[435px] sm:h-[465px] lg:h-[480px] rounded-[38px] sm:rounded-[42px] bg-gradient-to-b from-[#3D352E] via-[#1E1914] to-[#0A0806] p-[3.5px] border-[2.5px] border-[#C8BEB0] shadow-[20px_30px_60px_rgba(0,0,0,0.75)] transition-transform duration-300 ease-out z-20"
                  style={{
                    transform: `rotateY(${isHovered ? 16 + mousePos.x * 0.4 : 14}deg) rotateX(${isHovered ? 6 + mousePos.y * 0.4 : 6}deg) rotateZ(3deg) translateZ(35px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* iPhone Action Button & Volume Buttons */}
                  <div className="absolute -right-[4px] top-24 w-[2px] h-6 bg-[#C8BEB0] rounded-r-sm" />
                  <div className="absolute -right-[4px] top-34 w-[2px] h-12 bg-[#C8BEB0] rounded-r-sm" />
                  <div className="absolute -left-[4px] top-28 w-[2px] h-16 bg-[#C8BEB0] rounded-l-sm" />

                  {/* iPhone Super Retina XDR OLED Screen */}
                  <div className="w-full h-full bg-[#110528] text-white rounded-[34px] sm:rounded-[38px] overflow-hidden relative flex flex-col justify-between border border-white/10 select-none">
                    
                    {/* Dynamic Island Header */}
                    <div className="pt-2 px-3.5 flex items-center justify-between text-[8px] font-bold text-neutral-300 relative z-20">
                      <span>9:41</span>
                      {/* Dynamic Island Pill */}
                      <div className="w-14 sm:w-16 h-3.5 sm:h-4 bg-black rounded-full mx-auto flex items-center justify-between px-2 shadow-inner border border-neutral-900">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A26]" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-1.5 border border-white/70 rounded-xs p-0.5">
                          <div className="w-full h-full bg-white rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* App Screen Content: Msari Booking Details */}
                    <div className="px-3 pt-1 space-y-2 relative z-10 flex-1 overflow-hidden text-start">
                      
                      {/* Top App Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9.5px] font-black text-white">مرحباً بك في مساري</div>
                          <div className="text-[7px] text-white/70 font-semibold">احجز إقامتك بأفضل سعر في اليمن</div>
                        </div>
                        <div className="w-5.5 h-5.5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                          <Bell size={9} className="text-white" />
                        </div>
                      </div>

                      {/* Highlighted Destination Card */}
                      <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-[#2C0F7C] to-[#160549] border border-white/20 space-y-1 shadow-lg">
                        <div className="flex items-center justify-between text-[7.5px]">
                          <span className="font-black text-amber-300">عرض حصري اليوم</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-[#FF3B30] text-[6px] font-black">خصم 25%</span>
                        </div>
                        <div className="text-[8.5px] font-black text-white">فندق كورال عدن</div>
                        <div className="text-[6.5px] text-white/70">غرفة مطلة على البحر + إفطار مجاني</div>
                        <div className="flex items-center justify-between pt-0.5">
                          <div>
                            <span className="text-[8.5px] font-black text-white">$95</span>
                            <span className="text-[6.5px] text-white/50 line-through mr-1">$120</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-[#FF3B30] text-white text-[7px] font-black shadow-md">
                            تأكيد الحجز
                          </span>
                        </div>
                      </div>

                      {/* Quick Features Row */}
                      <div className="grid grid-cols-2 gap-1 text-[6.5px] font-bold text-white/80">
                        <div className="p-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1">
                          <Check size={7.5} className="text-emerald-400" />
                          <span>إلغاء مجاني</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1">
                          <Sparkles size={7.5} className="text-amber-400" />
                          <span>دفع عند الوصول</span>
                        </div>
                      </div>

                    </div>

                    {/* iPhone iOS Home Indicator Bar */}
                    <div className="pb-1.5 text-center">
                      <div className="w-16 h-0.8 bg-white/60 rounded-full mx-auto shadow-sm" />
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
