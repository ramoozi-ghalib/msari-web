'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

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

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
      {footer}
      {whatsapp}
    </>
  );
}