import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تأجير السيارات وخدمات النقل في اليمن',
  description: 'احجز خدمة تأجير السيارات والتنقل بين المدن اليمنية والاستقبال من المطار بسهولة وبأفضل الأسعار مع مساري.',
  alternates: {
    canonical: 'https://msari.net/ar/cars',
    languages: {
      'ar': 'https://msari.net/ar/cars',
      'en': 'https://msari.net/en/cars',
      'x-default': 'https://msari.net/ar/cars',
    },
  },
  openGraph: {
    title: 'تأجير السيارات وخدمات النقل في اليمن | مساري',
    description: 'احجز خدمة تأجير السيارات والتنقل بين المدن اليمنية والاستقبال من المطار بسهولة وبأفضل الأسعار مع مساري.',
    url: 'https://msari.net/ar/cars',
    siteName: 'مساري',
    locale: 'ar_YE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تأجير السيارات وخدمات النقل في اليمن | مساري',
    description: 'احجز خدمة تأجير السيارات والتنقل بين المدن اليمنية والاستقبال من المطار بسهولة وبأفضل الأسعار مع مساري.',
  },
};

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
