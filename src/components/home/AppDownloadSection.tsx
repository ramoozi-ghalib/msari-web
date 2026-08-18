'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Smartphone, Sparkles, ShieldCheck, Zap, 
  Tag, CheckCircle2, ArrowLeft, QrCode
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

  const appPerks = [
    { title: 'تأكيد فوري ومباشر', desc: 'حجز فوري ومضمون مع إشعار بالرسائل', icon: Zap },
    { title: 'دفع آمن ومرن', desc: 'خيارات دفع متعددة تناسب كل المحافظات', icon: ShieldCheck },
    { title: 'خصومات التطبيق الحصرية', desc: 'أفضل أسعار غرف الفنادق والتنقلات', icon: Tag },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-[#F7F5FC] to-white border-t border-neutral-100 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
          style={{ direction: 'rtl' }}
        >
          
          {/* ── Right Column: Text Information, Perks, QR Code & Store Buttons ── */}
          <div className="lg:col-span-6 text-center lg:text-start space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black border border-[var(--brand-primary)]/15 shadow-sm">
              <Smartphone size={14} className="text-[#FF3B30]" />
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--brand-primary)] tracking-tight leading-tight">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-neutral-600 text-sm sm:text-base lg:text-lg font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            {/* App Features / Perks List */}
            <div className="space-y-3 pt-2 max-w-lg mx-auto lg:mx-0">
              {appPerks.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="flex items-center gap-3 text-start p-2.5 rounded-2xl bg-white border border-neutral-200/70 shadow-sm hover:border-[var(--brand-primary)]/40 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#23096E] to-[#3A1C8F] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Icon size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-neutral-900 leading-snug">{perk.title}</h4>
                      <p className="text-[11px] text-neutral-500 font-medium">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── QR Code + Official App Store Download Badges Row ── */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              
              {/* QR Code Box */}
              <div className="flex items-center gap-3 p-2.5 bg-white rounded-2xl border border-neutral-200 shadow-md shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1 flex items-center justify-center">
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
                  <span className="block text-[9.5px] text-neutral-500 font-bold">للتحميل المباشر</span>
                </div>
              </div>

              {/* Side-by-Side Store Buttons */}
              <div className="flex flex-row items-center gap-3">
                
                {/* Google Play */}
                <a
                  href={playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 border border-neutral-800"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512">
                    <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                    <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                    <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                    <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
                  </svg>
                  <div className="text-start leading-none">
                    <span className="block text-[7.5px] text-neutral-400 font-bold uppercase mb-0.5">GET IT ON</span>
                    <span className="block text-[13px] font-black text-white tracking-tight">Google Play</span>
                  </div>
                </a>

                {/* App Store */}
                <a
                  href={appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 border border-neutral-800"
                >
                  <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
                  </svg>
                  <div className="text-start leading-none">
                    <span className="block text-[7.5px] text-neutral-400 font-bold uppercase mb-0.5">Download on the</span>
                    <span className="block text-[13px] font-black text-white tracking-tight">App Store</span>
                  </div>
                </a>

              </div>

            </div>

          </div>

          {/* ── Left Column: 3D Photorealistic Dual Flagship Smartphones (iPhone 16 Pro + Samsung Galaxy S24 Ultra) ── */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl group">
              
              {/* Soft Ambient Radial Light Glow behind Phones */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/15 via-[#FF3B30]/10 to-[var(--brand-primary)]/15 rounded-full blur-3xl transform scale-90 group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
              
              {/* Photorealistic 3D Phones Render */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/80 bg-neutral-100/50 backdrop-blur-sm group-hover:shadow-[0_30px_70px_rgba(35,9,110,0.25)] transition-all duration-500">
                <Image
                  src="/images/app-phones-3d.jpg"
                  alt="تطبيق مساري على أجهزة آيفون وسامسونج جالكسي S24 الترا"
                  width={1024}
                  height={768}
                  className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
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
