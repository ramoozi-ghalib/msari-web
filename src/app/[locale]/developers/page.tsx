import type { Metadata } from 'next';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';
import DevelopersClient from './DevelopersClient';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Developers & Travel API Portal | Msari'
    : 'بوابة المطورين وربط واجهة برمجة التطبيقات (API) | مساري';

  const description = isEn
    ? 'Connect your travel application with Yemen largest hotel and travel inventory via Msari Travel API.'
    : 'اربط تطبيقك أو نظامك مع مخزون أكبر شبكة سفر وحجوزات فنادق في اليمن عبر واجهة مساري البرمجية (Travel API).';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/developers', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/developers`,
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

export default async function DevelopersPage() {
  const [data, settings] = await Promise.all([
    PagesCmsService.getDevelopersPage(),
    SettingsCmsService.getSettings(),
  ]);

  return <DevelopersClient data={data} whatsappNumber={settings.whatsappNumber} />;
}
