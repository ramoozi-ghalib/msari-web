'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, Globe, ChevronDown, Hotel, Plane, Car,
  User, Heart, Phone, Home, LogOut, BookOpen, UserPlus
} from 'lucide-react';
// Auth context removed for backend migration - using mock state
import { cn } from '@/lib/utils';
const navLinks = [
  { href: '/', labelAr: 'الرئيسية', labelEn: 'Home', icon: Home },
  { href: '/hotels', labelAr: 'فنادق محلية', labelEn: 'Local Hotels', icon: Hotel },
  { href: '/hotels/international', labelAr: 'فنادق عالمية', labelEn: 'Global Hotels', icon: Globe },
  { href: '/flights', labelAr: 'رحلات طيران', labelEn: 'Flights', icon: Plane },
  { href: '/cars', labelAr: 'خدمة السيارات', labelEn: 'Car Services', icon: Car },
];

const currencies = [
  { code: 'USD', symbol: '$', label: 'دولار' },
  { code: 'SAR', symbol: 'ر.س', label: 'سعودي' },
  { code: 'YER_NEW', symbol: 'ر.ي.ج', label: 'ريال يمني جديد' },
  { code: 'YER_OLD', symbol: 'ر.ي.ق', label: 'ريال يمني قديم' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  // Temporary mock state
  const isAuthenticated = false;
  const user = null as { name: string; email: string } | null;
  const logout = () => {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [currency, setCurrency] = useState('USD');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const headerClass = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    isHome && !scrolled
      ? 'bg-transparent'
      : 'bg-white shadow-md border-b border-neutral-100'
  );

  const textClass = isHome && !scrolled ? 'text-white' : 'text-neutral-700';
  const logoTextClass = isHome && !scrolled ? 'text-white' : 'text-[--brand-primary]';

  return (
    <header className={headerClass}>
      <div className="container-msari">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-11 h-11 transition-transform group-hover:scale-110 group-hover:rotate-3 rounded-sm overflow-hidden duration-300">
              <Image 
                src="/images/logo-dark.png"
                alt="مساري Msari Logo"
                sizes="(max-width: 768px) 44px, 44px"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={cn('text-2xl font-black tracking-tight leading-none mb-1 transition-colors duration-300 group-hover:opacity-90', logoTextClass)}>مساري</span>
              <span className={cn('text-[11px] font-black uppercase tracking-[0.2em] leading-none opacity-80 transition-all duration-300 group-hover:tracking-[0.25em]', textClass)}>
                Msari
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap',
                  pathname === link.href
                    ? 'bg-[--brand-primary] text-white shadow hover:shadow-lg hover:scale-105'
                    : `${textClass} hover:bg-white/15 hover:text-[--brand-primary-light] hover:scale-105`
                )}
              >
                <link.icon size={15} />
                {lang === 'ar' ? link.labelAr : link.labelEn}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Currency */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105',
                  isHome && !scrolled
                    ? 'text-white hover:bg-white/15'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                {currency}
                <ChevronDown size={14} className={cn('transition-transform', currencyOpen && 'rotate-180')} />
              </button>
              {currencyOpen && (
                <div className="absolute top-full mt-1 end-0 bg-white rounded-xl shadow-xl border border-neutral-100 py-1 min-w-[160px] z-50 animate-scale-in">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                      className={cn(
                        'w-full text-start px-4 py-2 text-sm transition-all hover:bg-neutral-50 hover:scale-[1.02]',
                        currency === c.code ? 'font-bold text-[--brand-primary]' : 'text-neutral-700'
                      )}
                    >
                      <span className="font-bold me-2 text-[--brand-accent]">{c.symbol}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hidden sm:flex hover:scale-105',
                isHome && !scrolled
                  ? 'text-white hover:bg-white/15'
                  : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              <Globe size={15} />
              {lang === 'ar' ? 'EN' : 'عر'}
            </button>

            {/* Favorites */}
            <Link
              href="/favorites"
              className={cn(
                'p-2 rounded-lg transition-all hidden sm:flex hover:scale-110',
                isHome && !scrolled
                  ? 'text-white hover:bg-white/15'
                  : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              <Heart size={18} />
            </Link>

            {/* User Menu / Login */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className={cn(
                    'hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105',
                    isHome && !scrolled
                      ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      : 'bg-[--brand-primary]/10 text-[--brand-primary] hover:bg-[--brand-primary]/20'
                  )}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-[#23096e] to-[#3A1C8F] text-white rounded-full flex items-center justify-center text-xs font-black">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={13} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full mt-2 end-0 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 min-w-[180px] z-50">
                    <div className="px-4 py-2 border-b border-neutral-50 mb-1">
                      <div className="text-xs font-black text-neutral-900 truncate">{user.name}</div>
                      <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                    </div>
                    {[
                      { href: '/account/profile', icon: User, label: 'الملف الشخصي' },
                      { href: '/account/bookings', icon: BookOpen, label: 'حجوزاتي' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 font-medium">
                        <item.icon size={15} className="text-[#23096e]" />{item.label}
                      </Link>
                    ))}
                    <div className="border-t border-neutral-50 mt-1 pt-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); router.push('/'); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full font-medium">
                        <LogOut size={15} />تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className={cn(
                  'hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105',
                  isHome && !scrolled
                    ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    : 'bg-[--brand-primary] text-white hover:opacity-90 shadow-sm'
                )}
              >
                <User size={15} />
                {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Link>
            )}

            {/* WhatsApp */}
            <a
              href="https://wa.me/967XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all hidden sm:flex items-center justify-center shadow-md hover:shadow-xl hover:scale-110"
              title="WhatsApp"
            >
              <Phone size={16} />
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-all hover:scale-110',
                isHome && !scrolled ? 'text-white hover:bg-white/15' : 'text-neutral-700 hover:bg-neutral-100'
              )}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-100 shadow-xl animate-fade-in">
          <div className="container-msari py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]',
                  pathname === link.href
                    ? 'bg-[--brand-primary] text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                )}
              >
                <link.icon size={18} />
                {lang === 'ar' ? link.labelAr : link.labelEn}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-100 flex items-center gap-3">
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-semibold hover:bg-neutral-50 hover:scale-[1.02] transition-all"
              >
                <Globe size={16} />
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[--brand-primary] text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <User size={16} />
                {lang === 'ar' ? 'دخول' : 'Login'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
