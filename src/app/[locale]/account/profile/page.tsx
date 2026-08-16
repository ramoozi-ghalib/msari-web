import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'الملف الشخصي | مساري',
  description: 'إدارة وتفاصيل الملف الشخصي لحسابك في منصة مساري.',
  robots: {
    index: false,
    follow: false,
  },
};

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  const user = await requireAuth(locale);

  return <ProfileClient user={user} locale={locale} />;
}
