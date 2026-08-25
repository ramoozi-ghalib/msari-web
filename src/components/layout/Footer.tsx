import Image from 'next/image';
import Link from 'next/link';
import { 
  Hotel, Plane, Car, Globe, Phone, Mail, 
  Smartphone, MapPin, Clock, MessageSquare, ArrowUpRight 
} from 'lucide-react';
import { SettingsCmsService } from '@/services/cms';

const serviceLinks = [
  { href: '/hotels', label: 'فنادق محلية', icon: Hotel },
  { href: '/hotels/international', label: 'فنادق عالمية', icon: Globe },
  { href: '/flights', label: 'رحلات طيران', icon: Plane },
  { href: '/cars/airport', label: 'تاكسي المطار', icon: Car },
  { href: '/cars/transport', label: 'النقل بين المدن', icon: Car },
];

const exploreLinks = [
  { href: '/app', label: 'تطبيق مساري للجوال', isHighlight: true },
  { href: '/about', label: 'عن مساري' },
  { href: '/blog', label: 'المدونة والدليل السياحي' },
  { href: '/add-hotel', label: 'أضف فندقك (شركاء مساري)' },
  { href: '/developers', label: 'وثائق API للمطورين' },
  { href: '/contact', label: 'اتصل بنا' },
];

export default async function Footer() {
  const settings = await SettingsCmsService.getSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}`;
  const telUrl = `tel:+${settings.whatsappNumber}`;
  const footerDesc = settings.footerDescriptionAr || 'منصة السفر الأولى في اليمن — نوفر لك أفضل خيارات الإقامة الفندقية، حجز الطيران، وخدمات النقل بأعلى معايير الراحة والموثوقية.';
  const copyright = 'جميع الحقوق محفوظة لـ شركة مساري للخدمات السياحية.';
  const playStore = settings.playStoreUrl || 'https://play.google.com/store/apps/details?id=net.msari.app';
  const appStore = settings.appStoreUrl || 'https://apps.apple.com';

  return (
    <footer 
      className="relative bg-[#0A021E] text-white pt-12 pb-6 mt-16 border-t border-white/10 overflow-hidden"
      style={{ direction: 'rtl' }}
    >
      {/* Ambient Lighting Background Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(35, 9, 110, 0.4), transparent)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── 1. Top App Promo Banner (Sleek Compact Strip) ── */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-start flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF3B30] to-[#E02D23] text-white flex items-center justify-center shadow-lg shadow-[#FF3B30]/20 shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                تطبيق مساري في جيبك — أسهل وأسرع طريقة للحجز
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-normal">
                احجز فندقك، تاكسي المطار، أو رحلتك بنقرة زر وبأفضل الأسعار المباشرة.
              </p>
            </div>
          </div>

          {/* Official Store Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* App Store */}
            <a
              href={appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/50 hover:bg-black/80 text-white border border-white/15 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.65-.99 1.72-.88 2.74 1 .08 2-.5 2.58-1.24z"/>
              </svg>
              <div className="flex flex-col text-start leading-none">
                <span className="text-[9px] text-white/60 font-medium">تحميل من</span>
                <span className="text-xs font-bold text-white mt-0.5">App Store</span>
              </div>
            </a>

            {/* Google Play */}
            <a
              href={playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/50 hover:bg-black/80 text-white border border-white/15 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512">
                <path fill="#410593" d="M72.8 30.5L257.6 256 72.8 481.5z"/>
                <path fill="#04e578" d="M328.7 185L72.8 30.5 257.6 256z"/>
                <path fill="#ff3a44" d="M257.6 256l71.1 71-255.9 154.5z"/>
                <path fill="#ffc107" d="M400.2 214.2l-71.5-29.2-71.1 71 71.1 71 71.8-29.3c15.1-6.1 25.5-20.9 25.5-37.4s-10.4-31.3-25.8-36.1z"/>
              </svg>
              <div className="flex flex-col text-start leading-none">
                <span className="text-[9px] text-white/60 font-medium">تحميل من</span>
                <span className="text-xs font-bold text-white mt-0.5">Google Play</span>
              </div>
            </a>
          </div>
        </div>

        {/* ── 2. Main 4-Column Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12">

          {/* Col 1: Brand & Bio (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="relative w-8 h-8 transition-transform group-hover:scale-105 shrink-0">
                <Image
                  src="/images/logo-icon.png"
                  alt="مساري Msari Logo"
                  sizes="32px"
                  fill
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>
              <span className="text-2xl font-black text-white leading-none tracking-tight transition-colors group-hover:text-[#FF3B30]">
                مساري
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-sm font-normal">
              {footerDesc}
            </p>

            {/* Direct Contact Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
                aria-label="WhatsApp"
              >
                <MessageSquare size={14} />
                <span>واتساب الحجوزات</span>
              </a>

              <a
                href={`mailto:${settings.infoEmail}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 text-xs font-bold transition-all"
                aria-label="Email"
              >
                <Mail size={14} />
                <span>البريد الإلكتروني</span>
              </a>
            </div>
          </div>

          {/* Col 2: Services (3 cols on desktop) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
              <h4 className="text-sm sm:text-base font-bold text-white">خدمات السفر</h4>
            </div>
            <ul className="space-y-2.5">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-all hover:-translate-x-1"
                  >
                    <item.icon size={14} className="text-[#FF3B30]/70 group-hover:text-[#FF3B30] transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Explore & Company (3 cols on desktop) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
              <h4 className="text-sm sm:text-base font-bold text-white">استكشف مساري</h4>
            </div>
            <ul className="space-y-2.5">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 text-xs sm:text-sm transition-all hover:-translate-x-1 ${
                      item.isHighlight
                        ? 'text-[#FF3B30] font-bold hover:text-white'
                        : 'text-white/70 hover:text-white font-medium'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.isHighlight && <ArrowUpRight size={13} className="text-[#FF3B30]" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Direct Support & Info (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
              <h4 className="text-sm sm:text-base font-bold text-white">مركز المساعدة</h4>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-white/75">
              <a href={telUrl} className="flex items-start gap-2.5 hover:text-white transition-colors group">
                <Phone size={15} className="text-[#FF3B30] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[10px] text-white/50 font-semibold">اتصال هاتفي مباشر</span>
                  <span className="font-bold text-white">{settings.supportPhone}</span>
                </div>
              </a>

              <div className="flex items-start gap-2.5">
                <Clock size={15} className="text-[#FF3B30] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[10px] text-white/50 font-semibold">ساعات العمل</span>
                  <span className="font-medium text-white/90">{settings.workingHoursAr || 'يومياً ٨ ص — ١٠ م'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#FF3B30] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[10px] text-white/50 font-semibold">المقر الرئيسي</span>
                  <span className="font-medium text-white/90">{settings.headquartersAr || 'صنعاء وعدن — اليمن'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 3. Sleek Bottom Copyright Bar ── */}
      <div className="border-t border-white/10 pt-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/60 text-center sm:text-start font-normal">
            © {new Date().getFullYear()} {copyright}
          </p>

          <div className="flex items-center gap-6 text-xs text-white/60 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
