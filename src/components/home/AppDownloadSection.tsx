import Image from 'next/image';
import { QrCode, Smartphone, Sparkles, Star, MapPin } from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const badge = appDownload?.badgeAr || 'تطبيق مساري للهواتف الذكية';
  const title = appDownload?.titleAr || 'حمّل تطبيق مساري الآن';
  const subtitle = appDownload?.subtitleAr || 'احجز فنادقك ورحلاتك وتأجير السيارات من أي مكان بسهولة وأمان مع تأكيد فوري';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';
  const mockupImage = appDownload?.mockupImageUrl;

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sleek, Compact Luxury App Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0a0220] via-[#1a0654] to-[#2d1275] text-white p-6 sm:p-8 lg:p-12 border border-white/10">
          
          {/* Ambient Subtle Glows */}
          <div className="absolute top-0 end-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-80 h-80 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Right Column: Text, Features, & Official Store Buttons */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold backdrop-blur-sm border border-white/15">
                <Smartphone size={13} className="text-[#FF3B30]" />
                <span>{badge}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {title}
              </h2>

              <p className="text-white/80 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                {subtitle}
              </p>

              {/* Quick Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 pb-2">
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white/90 text-xs font-semibold border border-white/10">
                  ⚡ تأكيد فوري للحجز
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white/90 text-xs font-semibold border border-white/10">
                  🔔 إشعارات العروض الحصرية
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white/90 text-xs font-semibold border border-white/10">
                  💳 دفع آمن ومتعدد
                </span>
              </div>

              {/* Official Store Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-lg font-black transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] text-neutral-400 font-bold uppercase leading-none">GET IT ON</p>
                    <p className="text-xs font-black leading-tight">Google Play</p>
                  </div>
                </a>

                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-lg font-black transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5 fill-current text-[#23096E] shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] text-neutral-400 font-bold uppercase leading-none">Download on</p>
                    <p className="text-xs font-black leading-tight">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Left Column: Realistic Smartphone Mockup Frame */}
            <div className="lg:col-span-5 flex items-center justify-center gap-5">
              
              {/* Authentic iPhone Frame */}
              <div className="relative w-48 sm:w-56 h-[340px] sm:h-[390px] rounded-[2.5rem] bg-neutral-900 border-[6px] border-neutral-700 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] p-2 flex flex-col justify-between overflow-hidden">
                
                {/* Dynamic Island Pill at Top */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30" />

                {/* Smartphone Screen Content */}
                <div className="w-full h-full rounded-[2rem] bg-white text-neutral-900 overflow-hidden flex flex-col pt-5">
                  
                  {/* App Header */}
                  <div className="bg-[#23096E] text-white px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-[#FF3B30] flex items-center justify-center text-[8px] font-black">م</div>
                      <span className="text-xs font-black">مساري</span>
                    </div>
                    <span className="text-[9px] text-white/80 font-bold">اليمن</span>
                  </div>

                  {/* App Mini Search Card */}
                  <div className="p-2.5 bg-neutral-50 border-b border-neutral-100">
                    <div className="bg-white rounded-xl p-2 shadow-sm border border-neutral-200 text-start space-y-1">
                      <div className="text-[8px] font-black text-neutral-400">وجهتك القادمة</div>
                      <div className="text-[10px] font-bold text-[#23096E] flex items-center gap-1">
                        <MapPin size={10} className="text-[#FF3B30]" />
                        <span>عدن، فندق كورال</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Hotel Card in App */}
                  <div className="p-2.5 flex-1 flex flex-col justify-center">
                    <div className="rounded-xl border border-neutral-100 p-2 shadow-sm bg-white space-y-1 text-start">
                      <div className="relative h-16 rounded-lg bg-neutral-200 overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop"
                          alt="فندق في مساري"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-neutral-800 truncate">فندق كورال عدن</span>
                        <div className="flex text-amber-400 text-[8px]">⭐⭐⭐⭐⭐</div>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[9px] font-black text-[#FF3B30]">$85 / ليلة</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#23096E] text-white text-[7px] font-bold">احجز</span>
                      </div>
                    </div>
                  </div>

                  {/* App Bottom Navigation Bar */}
                  <div className="bg-white border-t border-neutral-100 px-3 py-1.5 flex items-center justify-around text-[8px] font-bold text-neutral-400">
                    <span className="text-[#23096E] font-black">الرئيسية</span>
                    <span>حجوزاتي</span>
                    <span>المفضلة</span>
                    <span>حسابي</span>
                  </div>

                </div>

              </div>

              {/* QR Code Box (Desktop & Tablet) */}
              <div className="hidden sm:flex flex-col items-center gap-2 bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md">
                  <QrCode size={48} className="text-[#23096E]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 text-center">امسح للتحميل</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
