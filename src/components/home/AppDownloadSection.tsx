import Image from 'next/image';
import { QrCode } from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface AppDownloadSectionProps {
  appDownload?: HomepageContentData['appDownload'];
}

export default function AppDownloadSection({ appDownload }: AppDownloadSectionProps) {
  const badge = appDownload?.badgeAr || 'تطبيق مساري للهواتف الذكية';
  const title = appDownload?.titleAr || 'حمّل تطبيق مساري الآن';
  const subtitle = appDownload?.subtitleAr || 'احجز فنادقك ورحلاتك من أي مكان وفي أي وقت بسهولة وأمان';
  const playStore = appDownload?.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = appDownload?.appStoreUrl || 'https://apps.apple.com';
  const mockupImage = appDownload?.mockupImageUrl || '/images/app-screen.png';

  return (
    <section className="py-10 sm:py-14 bg-[#F4F2F8] surface-page">
      <div className="container-msari">
        {/* Single compact banner */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-geo-pattern"
          style={{ background: 'linear-gradient(135deg, #23096E 0%, #2d1580 50%, #3A1C8F 100%)' }}
        >
          <div
            className="pointer-events-none absolute -top-10 -start-10 w-52 h-52 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(232,169,58,.35), transparent 70%)' }}
          />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-0 px-6 py-8 lg:py-6 lg:px-10" style={{ direction: 'rtl' }}>

            {/* Right: Text + Store Buttons */}
            <div className="flex-1 text-center lg:text-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-black mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8A93A]" />
                <span>{badge}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5 drop-shadow-sm">
                {title}
              </h2>
              <p className="text-[#F4F2F8] text-xs sm:text-sm font-bold mb-5">
                {subtitle}
              </p>

              {/* Official Store badges */}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-white text-[#23096E] hover:bg-[#FF3B30] hover:text-white rounded-xl shadow-md font-black transition-all group"
                >
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] text-slate-500 group-hover:text-white/80 font-bold uppercase leading-none">GET IT ON</p>
                    <p className="text-[11px] font-black leading-tight">Google Play</p>
                  </div>
                </a>
                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-white text-[#23096E] hover:bg-[#FF3B30] hover:text-white rounded-xl shadow-md font-black transition-all group"
                >
                  <svg className="w-5 h-5 fill-current text-[#23096E] group-hover:text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start">
                    <p className="text-[8px] text-slate-500 group-hover:text-white/80 font-bold uppercase leading-none">Download on the</p>
                    <p className="text-[11px] font-black leading-tight">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Center: Phone Mockup */}
            <div className="flex-shrink-0 flex items-center justify-center lg:mx-6">
              <div className="relative flex items-end">
                <div className="relative w-32 sm:w-36 h-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-950">
                  <Image
                    src={mockupImage}
                    alt="تطبيق مساري للجوال"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Left: Scan QR Badge */}
            <div className="hidden xl:flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-md shrink-0">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md">
                <QrCode size={36} className="text-[#23096E]" />
              </div>
              <div className="text-start">
                <p className="text-white text-xs font-black">امسح للتحميل</p>
                <p className="text-[#F4F2F8]/75 text-[10px] font-bold">متاح على iOS & Android</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
