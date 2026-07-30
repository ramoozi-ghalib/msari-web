import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حجز رحلات الطيران في اليمن',
  description: 'قارن واحجز أفضل رحلات الطيران من وإلى اليمن بأسعار تنافسية وخيارات متعددة عبر مساري.',
  alternates: {
    canonical: 'https://msari.net/ar/flights',
    languages: {
      'ar': 'https://msari.net/ar/flights',
      'en': 'https://msari.net/en/flights',
      'x-default': 'https://msari.net/ar/flights',
    },
  },
  openGraph: {
    title: 'حجز رحلات الطيران في اليمن | مساري',
    description: 'قارن واحجز أفضل رحلات الطيران من وإلى اليمن بأسعار تنافسية وخيارات متعددة عبر مساري.',
    url: 'https://msari.net/ar/flights',
    siteName: 'مساري',
    locale: 'ar_YE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حجز رحلات الطيران في اليمن | مساري',
    description: 'قارن واحجز أفضل رحلات الطيران من وإلى اليمن بأسعار تنافسية وخيارات متعددة عبر مساري.',
  },
};

export default function FlightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
