'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Hotel,
  Car,
  MapPin,
  Tags,
  CircleDollarSign,
  BellRing,
  UsersRound,
  Users,
  Settings,
  LogOut,
  KeyRound,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menu = [
  { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'الحجوزات', icon: CalendarCheck },
  { href: '/admin/hotels', label: 'الفنادق', icon: Hotel },
  { href: '/admin/cars', label: 'السيارات', icon: Car },
  { href: '/admin/destinations', label: 'الوجهات', icon: MapPin },
  { href: '/admin/offers', label: 'العروض', icon: Tags },
  { href: '/admin/finance', label: 'الإدارة المالية', icon: CircleDollarSign },
  { href: '/admin/bank-accounts', label: 'الحسابات البنكية', icon: Building2 },
  { href: '/admin/customers', label: 'المستخدمين', icon: Users },
  { href: '/admin/users', label: 'المشرفين', icon: UsersRound },
  { href: '/admin/api-keys', label: 'API للمطورين', icon: KeyRound },
  { href: '/admin/notifications', label: 'الإشعارات', icon: BellRing },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#23096e] text-white flex flex-col h-full shrink-0">
      <div className="p-6 pb-4">
        <Link href="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative w-10 h-10 shrink-0 rounded-sm overflow-hidden">
            <Image
              src="/images/logo-light.png"
              alt="مساري Msari Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight leading-none mb-1">مساري</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {menu.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                isActive ? "bg-white/10 text-white shadow-sm" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} className={isActive ? "text-[#a78bfa]" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex flex-col gap-1">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-all">
            <Settings size={18} /> الإعدادات
          </Link>
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all">
            <LogOut size={18} /> خروج للموقع
          </Link>
        </div>
      </div>
    </aside>
  );
}
