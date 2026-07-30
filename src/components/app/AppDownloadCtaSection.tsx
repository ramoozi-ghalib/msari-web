'use client';

interface Props {
  isEn?: boolean;
  data?: {
    ctaTitle?: string;
    ctaSubtitle?: string;
    googlePlayUrl?: string;
    appStoreUrl?: string;
  };
}

export default function AppDownloadCtaSection({ isEn = false, data }: Props) {
  const ctaTitle = data?.ctaTitle || (isEn ? 'Ready for a Superior Booking Experience?' : 'جاهز لتجربة حجز فريدة وسريعة؟');
  const ctaSubtitle = data?.ctaSubtitle || (isEn
    ? 'Download Msari App now and start your next journey with peace of mind.'
    : 'حمل تطبيق مساري الآن وانطلق في رحلتك القادمة بكل راحة وأمان.');
  const googlePlayUrl = data?.googlePlayUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStoreUrl = data?.appStoreUrl || 'https://apps.apple.com';

  return (
    <section className="py-16 lg:py-24 bg-white container-msari px-4">
      <div
        className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center space-y-6 shadow-2xl border border-white/20"
        style={{
          background: 'linear-gradient(135deg, #23096E 0%, #2d1580 50%, #3A1C8F 100%)',
        }}
      >
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF3B30]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          {/* Guaranteed Bright Pure White Headline */}
          <h2
            className="text-3xl sm:text-5xl font-black !text-white leading-tight drop-shadow-md"
            style={{ color: '#ffffff' }}
          >
            {ctaTitle}
          </h2>
          <p
            className="!text-[#F4F2F8] text-base sm:text-lg font-bold max-w-xl mx-auto"
            style={{ color: '#F4F2F8' }}
          >
            {ctaSubtitle}
          </p>

          {/* Official Store Download Buttons */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            
            {/* Official Google Play Store Button */}
            <a
              href={googlePlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 px-7 py-4 bg-white hover:bg-[#FF3B30] text-[#23096E] hover:text-white rounded-2xl shadow-xl font-black transition-all transform hover:-translate-y-1 group"
            >
              {/* Colored Play Logo */}
              <svg className="w-8 h-8 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                <path fill="#ff3a44" d="M328.7 327L257.6 256 72.8 481.5z"/>
                <path fill="#ffc107" d="M439.2 237.4l-110.5-62.4L257.6 256l71.1 81 110.5-62.4c15.8-8.9 15.8-28.3 0-37.2z"/>
              </svg>
              <div className="text-start">
                <p className="text-[10px] text-slate-500 group-hover:text-white/80 font-bold uppercase leading-none">GET IT ON</p>
                <p className="text-base font-black leading-tight">Google Play</p>
              </div>
            </a>

            {/* Official App Store Button */}
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 px-7 py-4 bg-white hover:bg-[#FF3B30] text-[#23096E] hover:text-white rounded-2xl shadow-xl font-black transition-all transform hover:-translate-y-1 group"
            >
              <svg className="w-8 h-8 fill-current text-[#23096E] group-hover:text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,21.97C7.79,22 6.87,20.68 6.03,19.47C4.31,17 3,12.5 4.79,9.39C5.68,7.85 7.26,6.87 8.97,6.84C10.27,6.81 11.5,7.71 12.3,7.71C13.1,7.71 14.61,6.62 16.19,6.79C16.85,6.82 18.73,7.06 19.92,8.8C19.82,8.86 17.58,10.17 17.61,12.83C17.64,16.03 20.43,17.09 20.46,17.1C20.43,17.17 20,18.66 18.71,19.5M15.8,5.17C16.5,4.32 16.97,3.14 16.84,1.96C15.83,2 14.6,2.64 13.88,3.48C13.23,4.23 12.75,5.44 12.91,6.6C14.04,6.69 15.1,5.91 15.8,5.17Z" />
              </svg>
              <div className="text-start">
                <p className="text-[10px] text-slate-500 group-hover:text-white/80 font-bold uppercase leading-none">Download on the</p>
                <p className="text-base font-black leading-tight">App Store</p>
              </div>
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
