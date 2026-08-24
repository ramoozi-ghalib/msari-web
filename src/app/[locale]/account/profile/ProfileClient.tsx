'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, LogOut, BookOpen, Heart, Hotel, ChevronLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';
import type { AuthenticatedUser } from '@/lib/session';

interface ProfileClientProps {
  user: AuthenticatedUser;
  locale: string;
}

export default function ProfileClient({ user, locale }: ProfileClientProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: `/${locale}` });
  };

  const name = user.name || user.email || 'المستخدم';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const navItems = [
    { icon: User, label: 'الملف الشخصي', href: `/${locale}/account/profile`, active: true },
    { icon: BookOpen, label: 'حجوزاتي', href: `/${locale}/account/bookings`, active: false },
    { icon: Heart, label: 'المفضلة', href: `/${locale}/favorites`, active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* ── 1. HERO HEADER ── */}
      <section className="bg-gradient-to-r from-[#1D065C] via-[#23096E] to-[#2E0D80] pt-24 pb-12 sm:pt-28 sm:pb-16 text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar Initials */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 border-2 border-white/30 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-inner shrink-0">
              {initials}
            </div>
            {/* Name & Email */}
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 truncate">{name}</h1>
              <p className="text-white/75 text-xs sm:text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MOBILE HORIZONTAL SEGMENTED TABS (Visible only on mobile) ── */}
      <div className="lg:hidden max-w-6xl mx-auto px-4 -mt-5 mb-6 relative z-10">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-neutral-100 flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                item.active
                  ? 'bg-[#1D065C] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* ═══ DESKTOP SIDEBAR (Visible only on desktop lg+) ═══ */}
          <aside className="hidden lg:block space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
              <h2 className="font-black text-neutral-900 mb-3 text-sm px-2">القائمة الرئيسية</h2>
              <nav className="space-y-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      item.active
                        ? 'bg-[#1D065C] text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="border-t border-neutral-100 mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 w-full transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>{loggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ═══ MAIN CONTENT AREA ═══ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Personal Information Card (الاسم، البريد، الهاتف فقط) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-neutral-100">
                <h2 className="text-base sm:text-lg font-black text-neutral-900">المعلومات الشخصية</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  حساب موثق
                </span>
              </div>

              <div className="space-y-3.5">
                {/* 1. Full Name */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FC] border border-neutral-100">
                  <div className="w-10 h-10 bg-[#1D065C]/10 text-[#1D065C] rounded-xl flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-neutral-400 font-semibold mb-0.5">الاسم الكامل</div>
                    <div className="text-neutral-900 font-bold text-sm sm:text-base truncate">{user.name || 'لم يُحدد'}</div>
                  </div>
                </div>

                {/* 2. Email */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FC] border border-neutral-100">
                  <div className="w-10 h-10 bg-[#1D065C]/10 text-[#1D065C] rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-neutral-400 font-semibold mb-0.5">البريد الإلكتروني</div>
                    <div className="text-neutral-900 font-bold text-sm sm:text-base truncate">{user.email}</div>
                  </div>
                </div>

                {/* 3. Phone */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FC] border border-neutral-100">
                  <div className="w-10 h-10 bg-[#1D065C]/10 text-[#1D065C] rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-neutral-400 font-semibold mb-0.5">رقم الهاتف</div>
                    <div className="text-neutral-900 font-bold text-sm sm:text-base truncate" dir="ltr" style={{ textAlign: 'right' }}>
                      {user.phone || 'لم يُضَف بعد'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Quick Actions Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-100">
              <h2 className="text-base sm:text-lg font-black text-neutral-900 mb-4">إجراءات سريعة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Link
                  href={`/${locale}/account/bookings`}
                  className="flex items-center justify-between p-4 rounded-xl border border-neutral-200/80 hover:border-[#1D065C]/40 hover:bg-[#1D065C]/5 transition-all group bg-white shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1D065C]/10 text-[#1D065C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen size={19} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-neutral-900 block group-hover:text-[#1D065C] truncate">حجوزاتي</span>
                      <span className="text-[11px] text-neutral-400 font-medium truncate block">عرض وإدارة الحجوزات</span>
                    </div>
                  </div>
                  <ChevronLeft size={16} className="text-neutral-400 group-hover:text-[#1D065C] group-hover:-translate-x-0.5 transition-all shrink-0" />
                </Link>

                <Link
                  href={`/${locale}/hotels`}
                  className="flex items-center justify-between p-4 rounded-xl border border-neutral-200/80 hover:border-[#1D065C]/40 hover:bg-[#1D065C]/5 transition-all group bg-white shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1D065C]/10 text-[#1D065C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Hotel size={19} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-neutral-900 block group-hover:text-[#1D065C] truncate">تصفح الفنادق</span>
                      <span className="text-[11px] text-neutral-400 font-medium truncate block">استكشف أفضل العروض</span>
                    </div>
                  </div>
                  <ChevronLeft size={16} className="text-neutral-400 group-hover:text-[#1D065C] group-hover:-translate-x-0.5 transition-all shrink-0" />
                </Link>
              </div>
            </div>

            {/* 3. Mobile Logout Button (Visible only on mobile) */}
            <div className="lg:hidden pt-2">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 w-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                <LogOut size={17} />
                <span>{loggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
              </button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
