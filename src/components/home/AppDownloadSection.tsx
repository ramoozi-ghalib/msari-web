'use client';

import Link from 'next/link';
import { 
  Building2, MapPin, Calendar, Search, Star, 
  Smartphone, QrCode, CheckCircle2, ShieldCheck, Sparkles 
} from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const title = appDownload?.titleAr || 'حمل تطبيق مساري الآن';
  const subtitle = appDownload?.subtitleAr || 'احجز فنادقك ورحلاتك من أي مكان وفي أي وقت';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';

  return (
    <section className="py-8 sm:py-12 bg-white overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Panoramic Royal Purple Banner Card ── */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-[#0E032A] via-[#21096B] to-[#341885] text-white border border-white/15 px-5 sm:px-8 py-8 lg:py-6"
          style={{ direction: 'rtl' }}
        >
          {/* Ambient Lighting Background Accents */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FF3B30]/15 rounded-full blur-3xl pointer-events-none" />

          {/* ── Content Grid: Right=QR & Info | Left=Dual Realistic Phones ── */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* ── Right Column in RTL: QR Code + Text & Store Badges ── */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-start">
              
              {/* Crisp Vector QR Code Card */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2.5 shadow-2xl flex flex-col items-center justify-center border border-white/40 group-hover:scale-105 transition-transform duration-300">
                  {/* Clean Vector QR Pattern Simulation */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 fill-current">
                    {/* Corner 1: Top-Left Position Detection Pattern */}
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="#23096E" />
                    <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                    <rect x="13" y="13" width="12" height="12" rx="2" fill="#23096E" />

                    {/* Corner 2: Top-Right Position Detection Pattern */}
                    <rect x="67" y="5" width="28" height="28" rx="4" fill="#23096E" />
                    <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                    <rect x="75" y="13" width="12" height="12" rx="2" fill="#23096E" />

                    {/* Corner 3: Bottom-Left Position Detection Pattern */}
                    <rect x="5" y="67" width="28" height="28" rx="4" fill="#23096E" />
                    <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                    <rect x="13" y="75" width="12" height="12" rx="2" fill="#23096E" />

                    {/* Alignment Pattern Bottom-Right */}
                    <rect x="71" y="71" width="16" height="16" rx="2" fill="#23096E" />
                    <rect x="74" y="74" width="10" height="10" rx="1" fill="white" />
                    <rect x="77" y="77" width="4" height="4" fill="#FF3B30" />

                    {/* Data Matrix Dots Pattern */}
                    <rect x="38" y="8" width="5" height="5" rx="1" />
                    <rect x="48" y="8" width="5" height="5" rx="1" />
                    <rect x="58" y="8" width="5" height="5" rx="1" />
                    
                    <rect x="8" y="38" width="5" height="5" rx="1" />
                    <rect x="18" y="48" width="5" height="5" rx="1" />
                    <rect x="28" y="38" width="5" height="5" rx="1" />
                    
                    <rect x="38" y="20" width="5" height="5" rx="1" />
                    <rect x="48" y="28" width="5" height="5" rx="1" />
                    <rect x="58" y="20" width="5" height="5" rx="1" />

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
                    
                    <rect x="38" y="88" width="5" height="5" rx="1" />
                    <rect x="48" y="88" width="5" height="5" rx="1" />
                    <rect x="58" y="88" width="5" height="5" rx="1" />
                  </svg>
                </div>
              </div>

              {/* Text Information & App Store Downloads */}
              <div className="space-y-2.5">
                
                {/* Title */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {title}
                </h2>

                {/* Subtitle */}
                <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed drop-shadow-sm max-w-md">
                  {subtitle}
                </p>

                {/* Vector Official Store Badges (Side-by-Side in 1 Row) */}
                <div className="flex flex-row items-center justify-center sm:justify-start gap-3 pt-1">
                  
                  {/* Google Play Store Badge */}
                  <a
                    href={playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 bg-black hover:bg-neutral-900 text-white rounded-xl border border-white/25 shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512">
                      <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                      <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                      <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                      <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                    </svg>
                    <div className="text-start leading-none">
                      <span className="block text-[7.5px] text-white/70 font-bold uppercase mb-0.5">GET IT ON</span>
                      <span className="block text-[12.5px] font-black text-white tracking-tight">Google Play</span>
                    </div>
                  </a>

                  {/* Apple App Store Badge */}
                  <a
                    href={appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 bg-black hover:bg-neutral-900 text-white rounded-xl border border-white/25 shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                    </svg>
                    <div className="text-start leading-none">
                      <span className="block text-[7.5px] text-white/70 font-bold uppercase mb-0.5">Download on the</span>
                      <span className="block text-[12.5px] font-black text-white tracking-tight">App Store</span>
                    </div>
                  </a>

                </div>

              </div>

            </div>

            {/* ── Left Column in RTL: High-Fidelity Dual Angled Smartphones Mockup ── */}
            <div className="lg:col-span-5 flex items-end justify-center lg:justify-start -mb-8 lg:-mb-6 overflow-visible pt-4">
              <div className="relative w-[310px] sm:w-[350px] h-[190px] sm:h-[210px] flex items-end justify-center">
                
                {/* ── Phone 1 (Back Left: Titanium Dark Blue angled -8deg) ── */}
                <div 
                  className="absolute left-2 sm:left-4 bottom-0 w-[150px] sm:w-[165px] h-[250px] sm:h-[270px] rounded-[32px] bg-gradient-to-b from-[#1C1438] via-[#0E0720] to-[#05010E] p-[5px] border-[3px] border-[#382B68] shadow-[-15px_20px_40px_rgba(0,0,0,0.7)] transform -rotate-[9deg] translate-y-6 hover:translate-y-3 transition-transform duration-500 z-10"
                >
                  {/* Glass Screen */}
                  <div className="w-full h-full rounded-[26px] bg-[#0C041E] p-2.5 pt-2 text-white overflow-hidden relative flex flex-col justify-between border border-white/10">
                    
                    {/* Dynamic Island / Notch */}
                    <div className="w-14 h-3.5 bg-black rounded-full mx-auto flex items-center justify-end px-1.5 shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1C1C24]" />
                    </div>

                    {/* App Header */}
                    <div className="pt-2 text-center space-y-1">
                      <div className="w-5 h-5 rounded-md bg-[#FF3B30] text-white flex items-center justify-center font-black text-[9px] mx-auto shadow-sm">
                        م
                      </div>
                      <div className="text-[9px] font-black tracking-tight text-white/90">مساري | فنادق اليمن</div>
                    </div>

                    {/* Search Result Card Simulation */}
                    <div className="p-2 rounded-xl bg-white/10 border border-white/15 space-y-1.5 backdrop-blur-md shadow-sm">
                      <div className="flex items-center justify-between text-[7px] text-white/80 font-bold">
                        <span>عدن - فندق القصر</span>
                        <span className="text-[#FF3B30] font-black">★ 4.8</span>
                      </div>
                      <div className="w-full h-1 bg-white/20 rounded-full" />
                      <div className="w-3/4 h-1 bg-white/15 rounded-full" />
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[7.5px] font-black text-emerald-400">$65/ليلة</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#FF3B30] text-[6.5px] font-bold">حجز</span>
                      </div>
                    </div>

                    {/* Bottom Pill */}
                    <div className="w-12 h-1 bg-white/40 rounded-full mx-auto" />
                  </div>
                </div>

                {/* ── Phone 2 (Front Right: Metallic Gold / Bronze angled +6deg) ── */}
                <div 
                  className="absolute right-4 sm:right-6 bottom-0 w-[155px] sm:w-[170px] h-[260px] sm:h-[280px] rounded-[34px] bg-gradient-to-b from-[#2A1E14] via-[#150D06] to-[#0A0502] p-[5px] border-[3px] border-[#B89065] shadow-[15px_20px_45px_rgba(0,0,0,0.8)] transform rotate-[7deg] translate-y-3 hover:translate-y-0 transition-transform duration-500 z-20"
                >
                  {/* Glass Screen */}
                  <div className="w-full h-full rounded-[28px] bg-[#12062C] p-2.5 pt-2 text-white overflow-hidden relative flex flex-col justify-between border border-white/10">
                    
                    {/* Dynamic Island */}
                    <div className="w-14 h-3.5 bg-black rounded-full mx-auto flex items-center justify-between px-2 shadow-inner">
                      <span className="text-[6.5px] font-bold text-white/70">9:41</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1C1C24]" />
                    </div>

                    {/* App Hero Card Screen */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded bg-[#FF3B30] text-white flex items-center justify-center font-black text-[8px]">
                            م
                          </div>
                          <span className="text-[8.5px] font-black text-white">مساري</span>
                        </div>
                        <span className="text-[6.5px] font-bold text-white/60">تأكيد فوري</span>
                      </div>

                      {/* Search Bar */}
                      <div className="p-1.5 rounded-lg bg-white/15 border border-white/15 flex items-center gap-1 text-[7px] text-white/80">
                        <MapPin size={8} className="text-[#FF3B30]" />
                        <span>صنعاء، عدن، المكلا...</span>
                      </div>

                      {/* Hotel Preview Box */}
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-white/15 to-white/5 border border-white/10 space-y-1">
                        <div className="text-[7.5px] font-black text-white/95">فندق كورال عدن</div>
                        <div className="text-[6.5px] text-white/70">خور مكسر، عدن</div>
                        <div className="w-full py-0.5 rounded bg-[#FF3B30] text-white text-[7px] font-black text-center shadow-sm">
                          احجز الآن
                        </div>
                      </div>
                    </div>

                    {/* Bottom Home Indicator */}
                    <div className="w-12 h-1 bg-white/50 rounded-full mx-auto" />
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
