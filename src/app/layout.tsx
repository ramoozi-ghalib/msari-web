import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

import { Cairo, Inter } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

import { SEO_VERIFICATIONS } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://msari.net'),
  applicationName: 'مساري',
  verification: SEO_VERIFICATIONS,
  title: 'مساري | بوابتك لحجز أفضل الفنادق في اليمن',
  description: 'احجز أفضل الفنادق في اليمن بسهولة مع مساري، استمتع بعروض حصرية وخيارات متعددة تناسب ميزانيتك في عدن، صنعاء، تعز، والمكلا.',
  authors: [{ name: 'مساري', url: 'https://msari.net' }],
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'مساري',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    siteName: 'مساري',
    locale: 'ar_YE',
    type: 'website',
    title: 'مساري | بوابتك لحجز أفضل الفنادق في اليمن',
    description: 'احجز أفضل الفنادق في اليمن بسهولة مع مساري، استمتع بعروض حصرية وخيارات متعددة تناسب ميزانيتك.',
    url: 'https://msari.net',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مساري | بوابتك لحجز أفضل الفنادق في اليمن',
    description: 'احجز أفضل الفنادق في اليمن بسهولة مع مساري، استمتع بعروض حصرية وخيارات متعددة تناسب ميزانيتك.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#23096E',
};

// Root layout — required by Next.js 16 to contain <html> and <body>.
// The [locale] layout handles Header/Footer as a nested content wrapper.
// lang and dir default to Arabic (RTL) since this is the primary language.
import AuthProvider from '@/components/providers/AuthProvider';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
