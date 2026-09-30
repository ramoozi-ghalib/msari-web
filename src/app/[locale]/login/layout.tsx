import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'تسجيل الدخول',
  description: 'سجّل دخولك إلى حسابك في مساري لمتابعة حجوزاتك وإدارة رحلاتك بسهولة.',
  alternates: { canonical: 'https://msari.net/ar/login' },
  openGraph: {
    title: 'تسجيل الدخول | مساري',
    description: 'سجّل دخولك إلى حسابك في مساري لمتابعة حجوزاتك وإدارة رحلاتك بسهولة.',
    url: 'https://msari.net/ar/login',
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
