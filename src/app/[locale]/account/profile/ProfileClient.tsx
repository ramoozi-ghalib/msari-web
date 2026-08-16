'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, LogOut, Shield, BookOpen, Heart } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Policies } from '@/lib/policies';
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

  const roleLabel = Policies.isFullAdmin(user) || user.role === 'ADMIN' ? 'مدير' : 'عضو مساري';

  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] pt-28 pb-20">
        <div className="container-msari">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 border-4 border-white/30 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-inner">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1">{name}</h1>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <Shield size={15} />
                <span>{roleLabel}</span>
                <span>•</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-msari py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h3 className="font-black text-neutral-900 mb-4 text-base">القائمة</h3>
              <nav className="space-y-2">
                {[
                  { icon: User, label: 'الملف الشخصي', href: `/${locale}/account/profile`, active: true },
                  { icon: BookOpen, label: 'حجوزاتي', href: `/${locale}/account/bookings` },
                  { icon: Heart, label: 'المفضلة', href: `/${locale}/favorites` },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      item.active
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-neutral-100 mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 w-full transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <LogOut size={18} />
                  {loggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900">المعلومات الشخصية</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  حساب موثق
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { icon: User, label: 'الاسم الكامل', value: user.name || 'لم يُحدد' },
                  { icon: Mail, label: 'البريد الإلكتروني', value: user.email },
                  { icon: Phone, label: 'رقم الهاتف', value: user.phone || 'لم يُضَف بعد' },
                  { icon: Shield, label: 'نوع الحساب', value: roleLabel },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-4 py-3.5 border-b border-neutral-100 last:border-0"
                  >
                    <div className="w-11 h-11 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-xl flex items-center justify-center shrink-0">
                      <row.icon size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-neutral-400 font-semibold mb-0.5">{row.label}</div>
                      <div className="text-neutral-900 font-bold text-sm sm:text-base truncate">{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900 mb-6">إجراءات سريعة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/${locale}/account/bookings`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-primary)]/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-neutral-800 block group-hover:text-[var(--brand-primary)]">حجوزاتي</span>
                    <span className="text-xs text-neutral-400 font-medium">عرض وإدارة الحجوزات</span>
                  </div>
                </Link>
                <Link
                  href={`/${locale}/hotels`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-primary)]/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Heart size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-neutral-800 block group-hover:text-[var(--brand-primary)]">تصفح الفنادق</span>
                    <span className="text-xs text-neutral-400 font-medium">استكشف العروض الحصرية</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
