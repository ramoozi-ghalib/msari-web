'use client';

import Image from 'next/image';
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
        
        {/* ── Official Panoramic Msari App Banner (Matching Exact Design Specification) ── */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-[#120336] via-[#23096E] to-[#3A1C8F] text-white border border-white/15 p-4 sm:p-6 lg:px-8 lg:py-6"
          style={{ direction: 'rtl' }}
        >
          {/* Subtle Ambient Background Lighting Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#FF3B30]/15 via-transparent to-transparent pointer-events-none" />

          {/* ── Desktop & Mobile Responsive Grid ── */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            
            {/* ── Right Group in RTL: QR Code + Text & Store Badges ── */}
            <div className="flex flex-col sm:flex-row items-center lg:items-center gap-4 sm:gap-6 text-center sm:text-start w-full lg:w-auto">
              
              {/* QR Code Card (Far Right in RTL) */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-xl flex items-center justify-center shrink-0 border border-white/30 group hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/images/app-qr.png" 
                  alt="QR Code لتحميل تطبيق مساري"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain rounded-xl"
                  priority
                />
              </div>

              {/* Text & Store Buttons (Next to QR code) */}
              <div className="space-y-2 sm:space-y-2.5">
                
                {/* Headline */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
                  {title}
                </h2>

                {/* Subtitle */}
                <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed drop-shadow-sm">
                  {subtitle}
                </p>

                {/* Official Black Store Badges (Side-by-Side in 1 Row) */}
                <div className="flex flex-row items-center justify-center sm:justify-start gap-2.5 pt-1">
                  
                  {/* Google Play Button */}
                  <a
                    href={playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-black hover:bg-neutral-900 text-white rounded-xl border border-white/20 shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 512 512">
                      <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                      <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                      <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                      <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                    </svg>
                    <div className="text-start leading-none">
                      <span className="block text-[7px] sm:text-[7.5px] text-white/70 font-bold uppercase mb-0.5">GET IT ON</span>
                      <span className="block text-[11px] sm:text-[12.5px] font-black text-white tracking-tight">Google Play</span>
                    </div>
                  </a>

                  {/* App Store Button */}
                  <a
                    href={appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-black hover:bg-neutral-900 text-white rounded-xl border border-white/20 shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                    </svg>
                    <div className="text-start leading-none">
                      <span className="block text-[7px] sm:text-[7.5px] text-white/70 font-bold uppercase mb-0.5">Download on the</span>
                      <span className="block text-[11px] sm:text-[12.5px] font-black text-white tracking-tight">App Store</span>
                    </div>
                  </a>

                </div>

              </div>

            </div>

            {/* ── Left Group in RTL: Dual Tilted iPhone Mockup (Emerging from bottom) ── */}
            <div className="flex items-center justify-center shrink-0 mt-2 lg:mt-0">
              <div className="relative w-64 sm:w-80 lg:w-96 h-32 sm:h-36 lg:h-40 overflow-hidden flex items-end justify-center">
                <Image
                  src="/images/app-phones.png"
                  alt="تطبيق مساري على أجهزة آيفون"
                  width={380}
                  height={170}
                  className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
