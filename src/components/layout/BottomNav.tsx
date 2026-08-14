'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

/**
 * Fixed bottom tab bar — mobile only (lg:hidden).
 * Icons are raw SVG paths matching the approved design concept exactly.
 * Fully locale-aware with next-intl integration.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'ar';
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  // Normalized path without locale prefix for active state matching
  const normalizedPath = (pathname || '/').replace(/^\/(ar|en)(?=\/|$)/, '') || '/';

  const items = [
    {
      href: `/${currentLocale}`,
      label: currentLocale === 'ar' ? 'الرئيسية' : 'Home',
      match: (p: string) => p === '/',
      path: (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </>
      ),
    },
    {
      href: `/${currentLocale}/hotels`,
      label: currentLocale === 'ar' ? 'الفنادق' : 'Hotels',
      match: (p: string) => p.startsWith('/hotels'),
      path: (
        <>
          <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
          <path d="M10 22v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M8 10h.01" />
          <path d="M16 10h.01" />
          <path d="M8 14h.01" />
          <path d="M16 14h.01" />
        </>
      ),
    },
    {
      href: `/${currentLocale}/account/bookings`,
      label: currentLocale === 'ar' ? 'حجوزاتي' : 'Bookings',
      match: (p: string) => p.startsWith('/account/bookings'),
      path: (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      ),
    },
    {
      href: isAuthenticated ? `/${currentLocale}/account/profile` : `/${currentLocale}/login`,
      label: currentLocale === 'ar' ? 'حسابي' : 'Account',
      match: (p: string) =>
        p.startsWith('/account/profile') || p.startsWith('/login') || p.startsWith('/register'),
      path: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
        </>
      ),
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-100 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="التنقل الرئيسي للهاتف"
    >
      <div className="flex items-stretch">
        {items.map((item) => {
          const active = item.match(normalizedPath);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <svg
                viewBox="0 0 24 24"
                width={21}
                height={21}
                stroke="currentColor"
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  'transition-transform duration-300',
                  active ? 'text-[#23096E] -translate-y-0.5' : 'text-neutral-400'
                )}
              >
                {item.path}
              </svg>
              <span
                className={cn(
                  'text-[10px] font-bold',
                  active ? 'text-[#23096E]' : 'text-neutral-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
