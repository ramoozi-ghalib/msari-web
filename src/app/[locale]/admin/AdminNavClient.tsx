'use client';

/**
 * src/app/[locale]/admin/AdminNavClient.tsx
 *
 * Responsive Admin Navigation Shell (Sidebar + Topbar + Mobile Drawer).
 * Built with Arabic RTL layout, Cairo typography, active route highlighting, and Auth.js logout.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  FileText,
  MapPin,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthenticatedUser } from '@/lib/session';

interface AdminNavClientProps {
  locale: string;
  user: AuthenticatedUser;
  children: React.ReactNode;
}

export default function AdminNavClient({ locale, user, children }: AdminNavClientProps) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const mainNavItems = [
    {
      href: `/${locale}/admin`,
      label: 'نظرة عامة',
      icon: LayoutDashboard,
      exact: true,
      badge: 'الرئيسية',
    },
    {
      href: `/${locale}/admin/settings`,
      label: 'إعدادات الموقع العامة',
      icon: Settings,
      exact: false,
      badge: 'CMS-01',
    },
    {
      href: `/${locale}/admin/homepage`,
      label: 'محرر الصفحة الرئيسية',
      icon: Sparkles,
      exact: false,
      badge: 'CMS-02',
    },
    {
      href: `/${locale}/admin/pages`,
      label: 'الصفحات الثابتة والقانونية',
      icon: FileText,
      exact: false,
      badge: 'CMS-03',
    },
    {
      href: `/${locale}/admin/destinations`,
      label: 'الوجهات السياحية التحريرية',
      icon: MapPin,
      exact: false,
      badge: 'CMS-04',
    },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA] text-neutral-900 flex flex-col font-sans" dir="rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Right: Mobile Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              aria-label="تبديل القائمة الجانبية"
            >
              {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href={`/${locale}/admin`} className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#23096E] to-[#3A1C8F] p-1.5 flex items-center justify-center shadow-sm">
                <Image
                  src="/images/logo-light.png"
                  alt="مساري"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-[#23096E] leading-none">مساري</span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#23096E]/10 text-[#23096E]">
                    CMS Admin
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-semibold leading-tight">
                  لوحة إدارة المحتوى الرسمية
                </span>
              </div>
            </Link>
          </div>

          {/* Left: Quick Actions & User Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={`/${locale}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
            >
              <Globe size={14} className="text-[#23096E]" />
              <span>معاينة الموقع العام</span>
              <ExternalLink size={12} className="text-neutral-400" />
            </Link>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#23096E]/10 text-[#23096E] flex items-center justify-center font-black text-xs border border-[#23096E]/20">
                <ShieldCheck size={16} />
              </div>
              <div className="hidden md:flex flex-col text-start">
                <span className="text-xs font-bold text-neutral-900 leading-tight">
                  {user.name || user.email || 'المدير العام'}
                </span>
                <span className="text-[10px] font-black text-[#FF3B30] leading-none">
                  {user.role === 'ADMIN' ? 'مدير النظام (ADMIN)' : user.role || 'مسؤول'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-e border-neutral-200/80 p-4 shrink-0 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Section: Core Navigation */}
            <div>
              <p className="px-3 text-[11px] font-black uppercase text-neutral-400 mb-2">
                إدارة المحتوى المفعّلة
              </p>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const active = isLinkActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                        active
                          ? 'bg-[#23096E] text-white shadow-sm shadow-[#23096E]/20'
                          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={17} className={active ? 'text-white' : 'text-neutral-500'} />
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-black px-2 py-0.5 rounded-md',
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-100 text-neutral-500'
                        )}
                      >
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Source of Truth Info Box */}
            <div className="p-3.5 rounded-2xl bg-[#23096E]/5 border border-[#23096E]/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#23096E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8A93A]" />
                <span>Source of Truth</span>
              </div>
              <p className="text-[11px] font-medium text-neutral-600 leading-relaxed">
                الحفظ مباشر في Firestore مع إعادة التحقق الفوري من الكاش لكل وحدة.
              </p>
            </div>

          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-72 max-w-[85vw] bg-white h-full p-4 flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#23096E]">لوحة تحكم مساري</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {mainNavItems.map((item) => {
                  const active = isLinkActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all',
                        active
                          ? 'bg-[#23096E] text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronLeft size={16} className="opacity-60" />
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-neutral-100">
                <Link
                  href={`/${locale}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-100 rounded-xl text-xs font-bold text-neutral-700"
                >
                  <Globe size={14} />
                  <span>معاينة الموقع العام</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
