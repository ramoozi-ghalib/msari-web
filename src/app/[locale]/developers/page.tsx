import type { Metadata } from 'next';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';
import DevelopersClient from './DevelopersClient';

export const metadata: Metadata = {
  title: 'بوابة المطورين — مساري',
  description: 'اربط نظامك مع مخزون أكبر شبكة سفر في اليمن عبر واجهة مساري البرمجية (API).',
  alternates: { canonical: 'https://msari.net/ar/developers' },
  openGraph: {
    title: 'بوابة المطورين — مساري',
    description: 'اربط نظامك مع مخزون أكبر شبكة سفر في اليمن عبر واجهة مساري البرمجية (API).',
    url: 'https://msari.net/ar/developers',
  },
};

export default async function DevelopersPage() {
  const [data, settings] = await Promise.all([
    PagesCmsService.getDevelopersPage(),
    SettingsCmsService.getSettings(),
  ]);

  return <DevelopersClient data={data} whatsappNumber={settings.whatsappNumber} />;
}
