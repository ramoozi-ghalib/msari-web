'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, ChevronDown, Hotel, Plane, Car,
  User, Phone, Home, LogOut, BookOpen, Smartphone, Info, Headphones, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { whatsappLink } from '@/lib/site-config';
import { useSession, signOut } from 'next-auth/react';

const navLinks = [
  { href: '/', labelAr: 'الرئيسية', icon: Home },
  { href: '/hotels', labelAr: 'فنادق محلية', icon: Hotel },
  { href: '/hotels/international', labelAr: 'فنادق عالمية', icon: Hotel },
  { href: '/flights', labelAr: 'رحلات طيران', icon: Plane },
  { href: '/cars', labelAr: 'خدمة السيارات', icon: Car },
];

const drawerExtraLinks = [
  { href: '/app', labelAr: 'تطبيق مساري', icon: Smartphone },
  { href: '/about', labelAr: 'من نحن', icon: Info },
  { href: '/contact', labelAr: 'اتصل بنا', icon: Headphones },
];

const currencies = [
  { code: 'USD', symbol: '$', label: 'دولار أمريكي' },
  { code: 'SAR', symbol: 'ر.س', label: 'ريال سعودي' },
  { code: 'YER_NEW', symbol: 'ر.ي.ج', label: 'ريال يمني جديد' },
  { code: 'YER_OLD', symbol: 'ر.ي.ق', label: 'ريال يمني قديم' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const user = session?.user ? { name: session.user.name || session.user.email || 'المستخدم', email: session.user.email || '' } : null;
  const logout = () => signOut({ callbackUrl: '/' });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/(^| )currency=([^;]+)/);
    if (match) {
      setCurrency(match[2].toUpperCase());
    }
  }, []);

  const changeCurrency = (code: string) => {
    document.cookie = `currency=${code}; path=/; max-age=31536000; SameSite=Lax`;
    setCurrency(code);
    setCurrencyOpen(false);
    router.refresh();
  };

  return (
    <>
      {/* ── Top Header with Official Vibrant Msari Brand Gradient ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/15 text-white',
          scrolled
            ? 'bg-gradient-to-r from-[#1D065C]/95 via-[#23096E]/95 to-[#331185]/95 backdrop-blur-xl shadow-2xl py-2'
            : 'bg-gradient-to-r from-[#23096E]/90 via-[#2C0F7C]/85 to-[#3A1C8F]/90 backdrop-blur-md shadow-lg py-2.5 sm:py-3.5'
        )}
        style={{ direction: 'rtl' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 w-full">

            {/* ── Right: Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105 rounded-xl overflow-hidden shadow-md bg-white/10 p-1 border border-white/20">
                <Image 
                  src="/images/logo-dark.png"
                  alt="مساري Msari Logo"
                  sizes="40px"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col text-start">
                <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white transition-colors group-hover:text-[#FF3B30]">
                  مساري
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-[0.2em] leading-none text-white/80">
                  Msari
                </span>
              </div>
            </Link>

            {/* ── Center: Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-white text-[#23096E] shadow-sm'
                        : 'text-white/90 hover:text-white hover:bg-white/15'
                    )}
                  >
                    <Icon size={14} className={isActive ? 'text-[#FF3B30]' : 'text-white/70'} />
                    <span>{link.labelAr}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Left: Actions ── */}
            <div className="flex items-center gap-2">
              
              {/* Currency Selector */}
              <div className="relative">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95 shadow-sm"
                >
                  <span>{currency}</span>
                  <ChevronDown size={13} className={cn('transition-transform', currencyOpen && 'rotate-180')} />
                </button>
                {currencyOpen && (
                  <div className="absolute top-full mt-2 end-0 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-1.5 min-w-[170px] z-50 animate-scale-in text-neutral-900">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => changeCurrency(c.code)}
                        className={cn(
                          'w-full text-start px-3.5 py-2 text-xs transition-all hover:bg-neutral-50 flex items-center justify-between',
                          currency === c.code ? 'font-black text-[#23096E] bg-neutral-50' : 'text-neutral-700'
                        )}
                      >
                        <span>{c.label}</span>
                        <span className="font-black text-[#FF3B30]">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu / Login (Desktop) */}
              {isAuthenticated && user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all"
                  >
                    <div className="w-5 h-5 bg-[#FF3B30] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                      {user.name.charAt(0)}
                    </div>
                    <span className="max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={12} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full mt-2 end-0 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 min-w-[180px] z-50 text-neutral-900">
                      <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                        <div className="text-xs font-black text-neutral-900 truncate">{user.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{user.email}</div>
                      </div>
                      {[
                        { href: '/account/profile', icon: User, label: 'الملف الشخصي' },
                        { href: '/account/bookings', icon: BookOpen, label: 'حجوزاتي' },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 font-bold">
                          <item.icon size={14} className="text-[#23096E]" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setUserMenuOpen(false); router.push('/'); }}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 w-full font-bold">
                          <LogOut size={14} />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-[#FF3B30] text-white hover:bg-[#e02d23] shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <User size={13} />
                  <span>تسجيل الدخول</span>
                </Link>
              )}

              {/* WhatsApp (Desktop) */}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex w-8 h-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 items-center justify-center shadow-md hover:scale-105 transition-all"
                title="WhatsApp"
              >
                <Phone size={14} />
              </a>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
                aria-label="فتح القائمة"
              >
                <Menu size={18} />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-out Drawer Menu (Official Msari Gradient & Red Icons Only) ── */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm animate-fade-in" 
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 end-0 bottom-0 w-[85%] max-w-xs bg-gradient-to-b from-[#23096E] via-[#2A0E78] to-[#3A1C8F] text-white p-5 shadow-2xl flex flex-col justify-between overflow-y-auto"
            style={{ direction: 'rtl' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header: Logo Only */}
              <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-5">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/20 shadow-md">
                    <Image 
                      src="/images/logo-dark.png"
                      alt="Msari Logo"
                      sizes="36px"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl font-black text-white leading-none">مساري</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Msari</span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/15"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Primary Services Links */}
              <div className="space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-xl transition-all font-black text-xs border',
                        isActive
                          ? 'bg-white text-[#23096E] border-white shadow-md'
                          : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-[#FF3B30]" />
                        <span>{link.labelAr}</span>
                      </div>
                      <ArrowLeft size={13} className={isActive ? 'text-[#23096E]' : 'text-white/60'} />
                    </Link>
                  );
                })}
              </div>

              {/* Extra Pages: تطبيق مساري، من نحن، اتصل بنا (Unified Red Icons Only) */}
              <div className="mt-3.5 pt-3.5 border-t border-white/15 space-y-1.5">
                {drawerExtraLinks.map((extra) => {
                  const Icon = extra.icon;
                  const isActive = pathname === extra.href;
                  return (
                    <Link
                      key={extra.href}
                      href={extra.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-xl transition-all font-bold text-xs border',
                        isActive
                          ? 'bg-white text-[#23096E] border-white shadow-md'
                          : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-[#FF3B30]" />
                        <span>{extra.labelAr}</span>
                      </div>
                      <ArrowLeft size={13} className={isActive ? 'text-[#23096E]' : 'text-white/60'} />
                    </Link>
                  );
                })}
              </div>

              {/* Partner CTA Link */}
              <div className="mt-3.5 pt-3.5 border-t border-white/15">
                <Link
                  href="/add-hotel"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
                    <span>أضف فندقك في مساري</span>
                  </span>
                  <ArrowLeft size={13} className="text-white/60" />
                </Link>
              </div>
            </div>

            {/* Bottom Actions: Login & WhatsApp */}
            <div className="pt-4 border-t border-white/15 space-y-2">
              {isAuthenticated && user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-red-500/25 text-white hover:bg-red-500/35 text-xs font-bold border border-red-500/30 flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  <span>تسجيل الخروج ({user.name.split(' ')[0]})</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#FF3B30] hover:bg-[#e02d23] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                  <User size={14} />
                  <span>تسجيل الدخول / إنشاء حساب</span>
                </Link>
              )}

              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Phone size={14} />
                <span>دعم العملاء عبر واتساب</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
