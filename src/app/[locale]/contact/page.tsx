import type { Metadata } from 'next';
import { SettingsCmsService } from '@/services/cms';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'اتصل بنا — مساري',
  description: 'تواصل مع فريق مساري لخدمات السفر والحجز في اليمن عبر واتساب والبريد الإلكتروني.',
  alternates: { canonical: 'https://msari.net/ar/contact' },
  openGraph: {
    title: 'اتصل بنا — مساري',
    description: 'تواصل مع فريق مساري لخدمات السفر والحجز في اليمن عبر واتساب والبريد الإلكتروني.',
    url: 'https://msari.net/ar/contact',
  },
};

export default async function ContactPage() {
  const settings = await SettingsCmsService.getSettings();
  return <ContactClient settings={settings} />;
}
