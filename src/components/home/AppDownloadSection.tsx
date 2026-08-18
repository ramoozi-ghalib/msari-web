import { Smartphone, Zap, Bell, ShieldCheck, Star } from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const badge = appDownload?.badgeAr || 'تطبيق مساري للهواتف الذكية';
  const title = appDownload?.titleAr || 'حمّل تطبيق مساري وابدأ رحلتك';
  const subtitle = appDownload?.subtitleAr || 'حجوزات فورية، عروض حصرية، وإدارة سهلة لرحلتك أينما كنت';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-neutral-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Royal Luxury Banner Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0c0326] via-[#1a0654] to-[#2d1275] text-white p-6 sm:p-10 border border-white/15">
          
          {/* Ambient Lighting Spheres */}
          <div className="absolute top-0 end-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-80 h-80 bg-[#FF3B30]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* ── Right Column: Typography, Feature Tags, & Store Buttons ── */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold border border-white/15 backdrop-blur-sm">
                <Smartphone size={13} className="text-[#FF3B30]" />
                <span>{badge}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {title}
              </h2>

              <p className="text-white/80 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                {subtitle}
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 pb-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 text-white/90 text-xs font-semibold border border-white/10">
                  <Zap size={12} className="text-amber-400" />
                  <span>تأكيد فوري</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 text-white/90 text-xs font-semibold border border-white/10">
                  <Bell size={12} className="text-[#FF3B30]" />
                  <span>عروض حصرية</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 text-white/90 text-xs font-semibold border border-white/10">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>دفع آمن</span>
                </span>
              </div>

              {/* Side-by-Side Store Download Buttons */}
              <div className="flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-initial">
                
                {/* Google Play Button */}
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-lg font-black transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[7px] text-neutral-400 font-bold uppercase leading-none">GET IT ON</p>
                    <p className="text-[11.5px] font-black leading-tight">Google Play</p>
                  </div>
                </a>

                {/* App Store Button */}
                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-lg font-black transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <svg className="w-4 h-4 fill-current text-[#23096E] shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[7px] text-neutral-400 font-bold uppercase leading-none">Download on the</p>
                    <p className="text-[11.5px] font-black leading-tight">App Store</p>
                  </div>
                </a>

              </div>
            </div>

            {/* ── Left Column: Interactive 3D Mockup Card ── */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-52 sm:w-60 rounded-3xl bg-white/10 border border-white/20 p-4 backdrop-blur-md shadow-2xl space-y-3 transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#FF3B30] text-white flex items-center justify-center font-black text-xs shadow-sm">
                      م
                    </div>
                    <span className="text-xs font-black">تطبيق مساري</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                    مباشر
                  </span>
                </div>

                <div className="rounded-xl bg-white/15 p-2.5 border border-white/10 text-[10px] space-y-1">
                  <div className="text-white/70">أحدث حجز فندقي متاح</div>
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>فندق كورال عدن ⭐⭐⭐⭐⭐</span>
                    <span className="text-[#FF3B30] font-black">$85</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/80 font-bold pt-0.5">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={11} className="fill-amber-400" />
                    <span>تقييم 4.9/5</span>
                  </span>
                  <span>+10,000 مستخدم</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
