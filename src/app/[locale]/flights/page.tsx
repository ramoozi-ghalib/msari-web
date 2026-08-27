import type { Metadata } from 'next';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';
import FlightsClient from './FlightsClient';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Cheap Flight Booking & Airfare Comparison | Msari'
    : 'حجز طيران رخيص — مقارنة عروض تذاكر الطيران | مساري';

  const description = isEn
    ? 'Search and compare cheap flights and airlines. Book your next flight tickets with best rates and support on Msari.'
    : 'ابحث عن أرخص تذاكر الطيران، قارن بين مئات الخطوط الجوية واحجز رحلتك القادمة بأفضل سعر وأسهل إجراءات مع مساري.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/flights', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/flights`,
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

export default async function FlightsPage() {
  const [pageContent, settings] = await Promise.all([
    PagesCmsService.getFlightsPage(),
    SettingsCmsService.getSettings(),
  ]);

  return (
    <FlightsClient 
      pageContent={pageContent} 
      whatsappNumber={settings.whatsappNumber} 
    />
  );
}
