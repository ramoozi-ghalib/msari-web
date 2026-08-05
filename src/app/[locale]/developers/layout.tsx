import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'بوابة المطورين — API للشركاء',
  description: 'اربط نظامك مع مخزون مساري لبيانات الفنادق اليمنية عبر API متكامل — للتطبيقات ووكالات السفر والشركاء التقنيين.',
  alternates: { canonical: 'https://msari.net/ar/developers' },
  openGraph: {
    title: 'بوابة المطورين — API للشركاء | مساري',
    description: 'اربط نظامك مع مخزون مساري لبيانات الفنادق اليمنية عبر API متكامل — للتطبيقات ووكالات السفر والشركاء التقنيين.',
    url: 'https://msari.net/ar/developers',
  },
};

export default function DevelopersLayout({ children }: { children: ReactNode }) {
  return children;
}
