import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'اتصل بنا',
  description: 'تواصل مع فريق مساري عبر واتساب أو البريد الإلكتروني لأي استفسار عن الحجوزات أو الدعم الفني.',
  alternates: { canonical: 'https://msari.net/ar/contact' },
  openGraph: {
    title: 'اتصل بنا | مساري',
    description: 'تواصل مع فريق مساري عبر واتساب أو البريد الإلكتروني لأي استفسار عن الحجوزات أو الدعم الفني.',
    url: 'https://msari.net/ar/contact',
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
