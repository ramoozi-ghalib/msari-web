import { QrCode, Smartphone, Sparkles, Bell, ShieldCheck, Zap } from 'lucide-react';
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

  return (
    <section className="py-8 sm:py-12 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sleek, Ultra-Compact Luxury App Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#0a0220] via-[#1a0654] to-[#2d1275] text-white p-6 sm:p-8 lg:p-10 border border-white/10">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 end-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-64 h-64 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Right: Text & Store Buttons */}
            <div className="max-w-2xl text-center lg:text-start space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold backdrop-blur-sm border border-white/15">
                <Smartphone size={13} className="text-[#FF3B30]" />
                <span>{badge}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white leading-snug">
                {title}
              </h2>

              <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                {subtitle}
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 pb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white/90 text-[11px] font-semibold border border-white/10">
                  <Zap size={12} className="text-amber-400" />
                  <span>تأكيد فوري</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white/90 text-[11px] font-semibold border border-white/10">
                  <Bell size={12} className="text-[#FF3B30]" />
                  <span>إشعارات العروض</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white/90 text-[11px] font-semibold border border-white/10">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>دفع آمن</span>
                </span>
              </div>

              {/* Store Download Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-md font-black transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[7px] text-neutral-400 font-bold uppercase leading-none">GET IT ON</p>
                    <p className="text-xs font-black leading-tight">Google Play</p>
                  </div>
                </a>

                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#23096E] hover:bg-neutral-100 rounded-xl shadow-md font-black transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current text-[#23096E] shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[7px] text-neutral-400 font-bold uppercase leading-none">Download on</p>
                    <p className="text-xs font-black leading-tight">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Left: Compact QR Code Box */}
            <div className="hidden sm:flex items-center gap-4 bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md shrink-0">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md">
                <QrCode size={48} className="text-[#23096E]" />
              </div>
              <div className="text-start">
                <div className="text-xs font-black text-white">امسح للتحميل</div>
                <div className="text-[10px] text-white/70">متوافق مع iOS وأندرويد</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
