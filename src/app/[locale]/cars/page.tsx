import type { Metadata } from 'next';
import { PagesCmsService } from '@/services/cms';
import CarsClient from './CarsClient';

export const metadata: Metadata = {
  title: 'خدمات السيارات وتوصيلات المطار — مساري',
  description: 'احجز سيارة خاصة لتوصيلات المطار، أو التنقل بين المدن في رحلتك عبر اليمن بأمان وراحة تامة.',
  alternates: { canonical: 'https://msari.net/ar/cars' },
  openGraph: {
    title: 'خدمات السيارات وتوصيلات المطار — مساري',
    description: 'احجز سيارة خاصة لتوصيلات المطار، أو التنقل بين المدن في رحلتك عبر اليمن.',
    url: 'https://msari.net/ar/cars',
  },
};

export default async function CarsPage() {
  const pageContent = await PagesCmsService.getCarsPage();
  return <CarsClient pageContent={pageContent} />;
}
