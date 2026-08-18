import Image from 'next/image';
import { Smartphone, Sparkles, Search, MapPin, Calendar } from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const badge = appDownload?.badgeAr || 'تطبيق مساري للهواتف الذكية';
  const title = appDownload?.titleAr || 'حمّل تطبيق مساري وابدأ رحلتك';
  const subtitle = appDownload?.subtitleAr || 'احجز فنادقك ورحلاتك بكل سهولة وسرعة من هاتفك أينما كنت في اليمن';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-neutral-100 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Official Msari Royal Gradient Banner Card ── */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#23096E] via-[#2A0E78] to-[#3A1C8F] text-white p-6 sm:p-10 lg:p-12 border border-white/15"
          style={{ direction: 'rtl' }}
        >
          
          {/* Ambient Lighting Spheres */}
          <div className="absolute top-0 end-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-80 h-80 bg-[#FF3B30]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* ── Right Column: Clean Typography & Store Download Buttons ── */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-4">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20 backdrop-blur-md">
                <Smartphone size={13} className="text-[#FF3B30]" />
                <span>{badge}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {title}
              </h2>

              {/* Subtitle */}
              <p className="text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                {subtitle}
              </p>

              {/* Side-by-Side Store Download Buttons */}
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 pt-3 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-initial">
                
                {/* Google Play Button */}
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2.5 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-xl font-black transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[7.5px] text-neutral-400 font-bold uppercase leading-none">GET IT ON</p>
                    <p className="text-[12px] font-black leading-tight">Google Play</p>
                  </div>
                </a>

                {/* App Store Button */}
                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2.5 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-xl font-black transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <svg className="w-5 h-5 fill-current text-[#23096E] shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[7.5px] text-neutral-400 font-bold uppercase leading-none">Download on the</p>
                    <p className="text-[12px] font-black leading-tight">App Store</p>
                  </div>
                </a>

              </div>
            </div>

            {/* ── Left Column: Samsung Galaxy Note 20 Ultra Device Mockup ── */}
            <div className="lg:col-span-5 flex items-center justify-center">
              
              {/* Samsung Note 20 Ultra Hardware Frame (Sharp corners, metallic bezel, punch-hole camera) */}
              <div className="relative w-56 sm:w-64 rounded-xl bg-gradient-to-b from-[#3a2010] via-[#1a0e08] to-[#2d180c] p-2 border-[2.5px] border-[#b08764] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                
                {/* Edge Bezel Screen Container */}
                <div className="rounded-lg bg-[#0d0422] border border-white/10 p-3 pt-2 text-white overflow-hidden space-y-2.5">
                  
                  {/* Note 20 Ultra Center Punch-Hole Camera */}
                  <div className="w-2.5 h-2.5 rounded-full bg-black mx-auto border border-neutral-700 shadow-inner" />

                  {/* App Screen Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-[#FF3B30] text-white flex items-center justify-center font-black text-[9px]">
                        م
                      </div>
                      <span className="text-[10.5px] font-black tracking-tight">مساري | Msari</span>
                    </div>
                    <span className="text-[8px] font-bold text-white/70">تطبيق اليمن</span>
                  </div>

                  {/* App Hero Search Box Simulation */}
                  <div className="rounded-lg bg-white/10 p-2 border border-white/10 space-y-1.5">
                    <div className="text-[8.5px] font-bold text-white/80 flex items-center gap-1">
                      <MapPin size={10} className="text-[#FF3B30]" />
                      <span>عدن، صنعاء، المكلا، تعز...</span>
                    </div>
                    <div className="text-[7.5px] font-medium text-white/60 flex items-center gap-1">
                      <Calendar size={9} className="text-white/60" />
                      <span>اختر تواريخ إقامتك</span>
                    </div>
                    <div className="w-full py-1 rounded bg-[#FF3B30] text-white text-[8px] font-black text-center shadow-sm">
                      بحث عن الفنادق
                    </div>
                  </div>

                  {/* Simulated Featured Section */}
                  <div className="rounded-lg bg-white/5 p-1.5 border border-white/5 space-y-1">
                    <div className="text-[8px] font-black text-white/90">أفضل الفنادق المعتمدة</div>
                    <div className="text-[7px] text-white/60">تأكيد فوري ودفع آمن عبر التطبيق</div>
                  </div>

                  {/* Android Navigation Pill */}
                  <div className="w-14 h-0.5 bg-white/40 rounded-full mx-auto mt-1" />

                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
