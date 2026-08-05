import { Metadata } from 'next';
import AppHeroSection from '@/components/app/AppHeroSection';
import AppStatsBannerSection from '@/components/app/AppStatsBannerSection';
import AppFeaturesSection from '@/components/app/AppFeaturesSection';
import AppScreenshotsShowcase from '@/components/app/AppScreenshotsShowcase';
import AppHowItWorksSection from '@/components/app/AppHowItWorksSection';
import AppDownloadCtaSection from '@/components/app/AppDownloadCtaSection';

export const metadata: Metadata = {
  title: 'تطبيق مساري حجز الفنادق والطيران والسيارات | مساري',
  description: 'حمّل تطبيق مساري واستمتع بتجربة حجز مميزة وسريعة لأفضل الفنادق في اليمن، ومقارنة أسعار الفنادق حول العالم وحجز رحلات الطيران والسيارات.',
  alternates: { canonical: 'https://msari.net/ar/app' },
  openGraph: {
    title: 'تطبيق مساري حجز الفنادق والطيران والسيارات | مساري',
    description: 'حمّل تطبيق مساري واستمتع بتجربة حجز مميزة وسريعة لأفضل الفنادق في اليمن.',
    url: 'https://msari.net/ar/app',
  },
};

export default async function AppPage(
  props: { params: Promise<{ locale: string }> }
) {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  return (
    <main className="min-h-screen bg-[#F4F2F8] text-slate-900 selection:bg-[#23096E] selection:text-white">
      {/* 1. Hero Section */}
      <AppHeroSection isEn={isEn} />

      {/* 2. Stats Banner */}
      <AppStatsBannerSection isEn={isEn} />

      {/* 3. Key Features */}
      <AppFeaturesSection isEn={isEn} />

      {/* 4. Interactive App Showcase */}
      <AppScreenshotsShowcase isEn={isEn} />

      {/* 5. How It Works in 3 Steps */}
      <AppHowItWorksSection isEn={isEn} />

      {/* 6. Final Conversion Download CTA */}
      <AppDownloadCtaSection isEn={isEn} />
    </main>
  );
}
