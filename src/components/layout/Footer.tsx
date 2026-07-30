import Image from 'next/image';
import Link from 'next/link';
import { Hotel, Plane, Car, Globe, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#160549] bg-gradient-to-br from-[#160549] via-[#23096e] to-[#3A1C8F] text-white pt-12 pb-6 mt-16 shadow-inner">

      {/* Main Footer */}
      <div className="container-msari py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-110 rounded-sm overflow-hidden">
                <Image
                  src="/images/logo-light.png"
                  alt="مساري Msari Logo"
                  sizes="(max-width: 768px) 48px, 48px"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none mb-1">مساري</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none text-white/80">
                  Msari
                </span>
              </div>
            </Link>
            <p className="text-white text-sm leading-relaxed mb-5">
              منصة السفر الأولى في اليمن — نوفر لك أفضل خيارات الإقامة والطيران وخدمات النقل.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/967784644466"
                className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center hover:bg-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone size={16} />
              </a>
              <a
                href="mailto:info@msari.net"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 border border-white/20 transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-black mb-6 text-lg">خدماتنا</h4>
            <ul className="space-y-3">
              {[
                { href: '/hotels', label: 'فنادق محلية', icon: Hotel },
                { href: '/hotels/international', label: 'فنادق عالمية', icon: Globe },
                { href: '/flights', label: 'رحلات طيران', icon: Plane },
                { href: '/cars/airport', label: 'تاكسي المطار', icon: Car },
                { href: '/cars/transport', label: 'النقل بين المدن', icon: Car },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm font-medium"
                  >
                    <item.icon size={14} className="text-white/60" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black mb-6 text-lg">روابط سريعة</h4>
            <ul className="space-y-3">
              {[
                { href: '/blog', label: 'المدونة والدليل السياحي' },
                { href: '/about', label: 'من نحن' },
                { href: '/contact', label: 'اتصل بنا' },
                { href: '/add-hotel', label: 'أضف فندقك' },
                { href: '/account/bookings', label: 'حجوزاتي' },
                { href: '/developers', label: 'وثائق API للمطورين' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white hover:text-white/80 transition-colors text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black mb-6 text-lg">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-sm text-white">
                <Phone size={16} className="text-white/60 shrink-0" />
                <a href="tel:+967784644466" className="hover:text-white/80 transition-colors font-medium">+967 784644466</a>
              </li>
              <li className="flex items-center gap-4 text-sm text-white">
                <Mail size={16} className="text-white/60 shrink-0" />
                <a href="mailto:info@msari.net" className="hover:text-white/80 transition-colors font-medium">info@msari.net</a>
              </li>
            </ul>

            {/* App Download */}
            <div className="mt-8">
              <Link href="/app" className="text-xs text-white/90 mb-3 font-semibold block hover:underline">
                حمّل تطبيق مساري للجوال ←
              </Link>
              <div className="flex gap-2">
                <Link href="/app" className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-xs font-semibold text-white">
                  <span></span> App Store
                </Link>
                <a href="https://play.google.com/store/apps/details?id=net.msari.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-xs font-semibold text-white">
                  <span>▶</span> Google Play
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 relative z-10 bg-black/10">
        <div className="container-msari py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white text-sm text-center font-medium">
            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ مساري لخدمات السفر والسياحة.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-white hover:text-white/80 text-xs transition-colors font-semibold">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-white hover:text-white/80 text-xs transition-colors font-semibold">
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
