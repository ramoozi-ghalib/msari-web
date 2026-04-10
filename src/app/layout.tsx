import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://msari.net'),
  title: {
    default: 'مساري - منصة السفر الأولى في اليمن',
    template: '%s | مساري',
  },
  description: 'احجز فنادقك المحلية والعالمية ورحلات الطيران وخدمات النقل بسهولة. مساري توفر لك أكبر شبكة متكاملة لخدمات السفر والسياحة.',
  keywords: ['فنادق يمن', 'حجز فنادق صنعاء', 'حجز فنادق عدن', 'سفر اليمن', 'مساري', 'تاكسي مطار'],
  authors: [{ name: 'مساري', url: 'https://msari.net' }],
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    siteName: 'Msari Travel',
    locale: 'ar_YE',
    type: 'website',
    title: 'مساري - وجهتك الأولى للسفر',
    description: 'خطط لرحلتك القادمة بكل سهولة مع مساري واكتشف أفضل الوجهات السياحية والفنادق.',
    url: 'https://msari.net',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مساري - منصة السفر الأولى',
    description: 'أفضل العروض الحصرية للفنادق وتذاكر الطيران.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

// Root layout — required by Next.js 16 to contain <html> and <body>.
// The [locale] layout handles Header/Footer as a nested content wrapper.
// lang and dir default to Arabic (RTL) since this is the primary language.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
