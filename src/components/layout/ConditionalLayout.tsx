'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  whatsapp: ReactNode;
}

export default function ConditionalLayout({ children, header, footer, whatsapp }: Props) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.includes('/login') ||
    pathname?.includes('/register') ||
    pathname?.includes('/forgot-password');
  const isAdminPage = pathname?.includes('/admin');

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  // Bottom tab bar replaces most mobile navigation, so it's hidden on admin and auth pages
  const showBottomNav = !isAdminPage;

  return (
    <>
      {header}
      <main className={showBottomNav ? 'min-h-screen pb-16 lg:pb-0 w-full max-w-full overflow-x-hidden' : 'min-h-screen w-full max-w-full overflow-x-hidden'}>
        {children}
      </main>
      {footer}
      {whatsapp}
      {showBottomNav && <BottomNav />}
    </>
  );
}