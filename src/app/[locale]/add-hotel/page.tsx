import type { Metadata } from 'next';
import { PagesCmsService } from '@/services/cms';
import AddHotelClient from './AddHotelClient';

export const metadata: Metadata = {
  title: 'أضف فندقك — انضم كشريك في مساري',
  description: 'اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر مع منصة مساري.',
  alternates: { canonical: 'https://msari.net/ar/add-hotel' },
  openGraph: {
    title: 'أضف فندقك — انضم كشريك في مساري',
    description: 'اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر مع منصة مساري.',
    url: 'https://msari.net/ar/add-hotel',
  },
};

export default async function AddHotelPage() {
  const pageContent = await PagesCmsService.getAddHotelPage();
  return <AddHotelClient pageContent={pageContent} />;
}
