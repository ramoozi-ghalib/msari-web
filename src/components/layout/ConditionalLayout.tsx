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
    pathname?.includes('/forgot-password') ||
    pathname?.includes('/verify-account');
  const isAdminPage = pathname?.includes('/admin');

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  // Bottom tab bar replaces most mobile navigation, so it's hidden on admin and auth pages
  const showBottomNav = !isAdminPage;

  return (
    <>
      {header}
      <main className={showBottomNav ? 'min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0 w-full max-w-full overflow-x-clip' : 'min-h-screen w-full max-w-full overflow-x-clip'}>
        {children}
      </main>
      {footer}
      {whatsapp}
      {showBottomNav && <BottomNav />}
    </>
  );
}