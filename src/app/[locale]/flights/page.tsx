import type { Metadata } from 'next';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';
import FlightsClient from './FlightsClient';

export const metadata: Metadata = {
  title: 'حجز طيران رخيص — عروض تذاكر الطيران | مساري',
  description: 'ابحث عن أرخص تذاكر الطيران، قارن بين مئات الخطوط الجوية واحجز رحلتك القادمة بأفضل سعر مع مساري.',
  alternates: { canonical: 'https://msari.net/ar/flights' },
  openGraph: {
    title: 'حجز طيران رخيص — مساري',
    description: 'ابحث عن أرخص تذاكر الطيران وقارن بين مئات الخطوط الجوية مع مساري.',
    url: 'https://msari.net/ar/flights',
  },
};

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
