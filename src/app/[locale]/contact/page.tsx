import type { Metadata } from 'next';
import { SettingsCmsService } from '@/services/cms';
import ContactClient from './ContactClient';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn ? 'Contact Us — Msari' : 'اتصل بنا — مساري لخدمات السفر والحجز';
  const description = isEn
    ? 'Get in touch with Msari support team for hotel bookings and travel inquiries in Yemen via WhatsApp, phone, and email.'
    : 'تواصل مع فريق خدمة عملاء مساري لخدمات السفر وحجز الفنادق في اليمن عبر واتساب، الهاتف، والبريد الإلكتروني على مدار الساعة.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/contact', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/contact`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function ContactPage() {
  const settings = await SettingsCmsService.getSettings();
  return <ContactClient settings={settings} />;
}
