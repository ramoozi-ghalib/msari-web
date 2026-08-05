import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد',
  description: 'أنشئ حسابك في مساري مجاناً واحجز فنادقك ورحلاتك في اليمن بسهولة وأمان.',
  alternates: { canonical: 'https://msari.net/ar/register' },
  openGraph: {
    title: 'إنشاء حساب جديد | مساري',
    description: 'أنشئ حسابك في مساري مجاناً واحجز فنادقك ورحلاتك في اليمن بسهولة وأمان.',
    url: 'https://msari.net/ar/register',
  },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
