import type { Metadata } from 'next';
import { PagesCmsService } from '@/services/cms';
import { getCurrentUser } from '@/lib/session';
import AddHotelClient from './AddHotelClient';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'List Your Hotel — Partner with Msari'
    : 'أضف فندقك — انضم كشريك فندقي مع مساري';

  const description = isEn
    ? 'List your hotel or resort in Yemen on Msari platform and reach thousands of verified travelers daily.'
    : 'اعرض فندقك أو منتجعك في اليمن أمام آلاف المسافرين يومياً وضاعف حجوزاتك مع منصة مساري الرائدة.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/add-hotel', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/add-hotel`,
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

export default async function AddHotelPage() {
  const [pageContent, user] = await Promise.all([
    PagesCmsService.getAddHotelPage(),
    getCurrentUser(),
  ]);

  return <AddHotelClient pageContent={pageContent} currentUser={user} />;
}
