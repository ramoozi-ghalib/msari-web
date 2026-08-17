import Image from 'next/image';
import { QrCode, Smartphone } from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const badge = appDownload?.badgeAr || 'تطبيق مساري للهواتف الذكية';
  const title = appDownload?.titleAr || 'حمّل تطبيق مساري الآن';
  const subtitle = appDownload?.subtitleAr || 'احجز فنادقك ورحلاتك من أي مكان وفي أي وقت بسهولة وأمان مع إشعارات فورية';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';
  const mockupImage = appDownload?.mockupImageUrl || '/images/app-screen.png';

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Luxury Banner Card */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#0c0326] via-[#1a0654] to-[#2e1378] text-white p-8 sm:p-12 lg:p-16">
          
          {/* Ambient Lighting */}
          <div className="absolute top-0 end-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Right Column: Text & Store Badges */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm font-bold backdrop-blur-sm border border-white/15">
                <Smartphone size={14} className="text-amber-400" />
                <span>{badge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {title}
              </h2>

              <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                {subtitle}
              </p>

              {/* Official Store Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3.5 bg-white text-[var(--brand-primary)] hover:bg-neutral-100 rounded-2xl shadow-lg font-black transition-all hover:scale-105"
                >
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[9px] text-neutral-400 font-bold uppercase leading-none">GET IT ON</p>
                    <p className="text-sm font-black leading-tight">Google Play</p>
                  </div>
                </a>

                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3.5 bg-white text-[var(--brand-primary)] hover:bg-neutral-100 rounded-2xl shadow-lg font-black transition-all hover:scale-105"
                >
                  <svg className="w-6 h-6 fill-current text-[var(--brand-primary)] shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[9px] text-neutral-400 font-bold uppercase leading-none">Download on the</p>
                    <p className="text-sm font-black leading-tight">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Left Column: Phone Mockup & QR */}
            <div className="lg:col-span-5 flex items-center justify-center gap-6">
              <div className="relative w-44 sm:w-52 h-72 sm:h-84 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-neutral-900">
                <Image
                  src={mockupImage}
                  alt="تطبيق مساري للهاتف"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="hidden xl:flex flex-col items-center gap-3 bg-white/10 border border-white/20 rounded-3xl p-5 backdrop-blur-md">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg">
                  <QrCode size={64} className="text-[var(--brand-primary)]" />
                </div>
                <span className="text-[11px] font-bold text-white/90 text-center">امسح للتحميل المباشر</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
