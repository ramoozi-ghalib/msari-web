import type { Metadata } from 'next';
import { PagesCmsService } from '@/services/cms';
import CarsClient from './CarsClient';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Car Rental & Airport Transfers in Yemen | Msari'
    : 'خدمات السيارات وتوصيلات المطار والنقل في اليمن | مساري';

  const description = isEn
    ? 'Book private cars for airport transfers and intercity transportation across Yemen with safety and comfort on Msari.'
    : 'احجز سيارة خاصة لتوصيلات المطار، أو التنقل بين المدن في رحلتك عبر اليمن بأمان وراحة تامة وأفضل الأسعار مع مساري.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/cars', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/cars`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CarsPage() {
  const pageContent = await PagesCmsService.getCarsPage();
  return <CarsClient pageContent={pageContent} />;
}
