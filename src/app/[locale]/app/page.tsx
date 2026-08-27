import { Metadata } from 'next';
import AppHeroSection from '@/components/app/AppHeroSection';
import AppStatsBannerSection from '@/components/app/AppStatsBannerSection';
import AppFeaturesSection from '@/components/app/AppFeaturesSection';
import AppScreenshotsShowcase from '@/components/app/AppScreenshotsShowcase';
import AppHowItWorksSection from '@/components/app/AppHowItWorksSection';
import AppFaqSection from '@/components/app/AppFaqSection';
import AppDownloadCtaSection from '@/components/app/AppDownloadCtaSection';
import AppStickyMobileBar from '@/components/app/AppStickyMobileBar';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Msari Mobile App - Hotel Booking, Flights & Cars in Yemen | Msari'
    : 'تطبيق مساري لحجز الفنادق في اليمن والطيران والسيارات | مساري';

  const description = isEn
    ? 'Download Msari mobile app for instant and verified hotel bookings across Yemen with local payment methods, flight comparison, and car transportation.'
    : 'حمّل تطبيق مساري الذكي واستمتع بحجز فوري ومؤكد لأفضل فنادق اليمن مع طرق دفع محلية ميسرة (الكريمي، جيب، كاش)، ومقارنة أسعار الفنادق العالمية وتذاكر الطيران.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/app', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/app`,
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

export default async function AppPage(
  props: { params: Promise<{ locale: string }> }
) {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const [appContent, settings] = await Promise.all([
    PagesCmsService.getAppPage(),
    SettingsCmsService.getSettings(),
  ]);

  const heroData = {
    ...appContent?.hero,
    googlePlayUrl: settings.playStoreUrl,
    appStoreUrl: settings.appStoreUrl,
  };

  const ctaData = {
    ctaTitle: appContent?.cta?.title,
    ctaSubtitle: appContent?.cta?.subtitle,
    googlePlayUrl: settings.playStoreUrl,
    appStoreUrl: settings.appStoreUrl,
  };

  return (
    <main className="min-h-screen bg-[#F4F2F8] text-slate-900 selection:bg-[#23096E] selection:text-white pb-12 md:pb-0">
      {/* 1. Hero Section (iPhone 17 & Samsung Note 24 Ultra Mockups) */}
      <AppHeroSection isEn={isEn} data={heroData} />

      {/* 2. Stats Banner */}
      <AppStatsBannerSection isEn={isEn} stats={appContent?.stats} data={heroData} />

      {/* 3. Key Local Features */}
      <AppFeaturesSection isEn={isEn} features={appContent?.features} />

      {/* 4. Interactive App Showcase (iPhone 17 & Samsung Note 24 Ultra) */}
      <AppScreenshotsShowcase isEn={isEn} screensShowcase={appContent?.screensShowcase} />

      {/* 5. How It Works in 3 Steps */}
      <AppHowItWorksSection isEn={isEn} howItWorks={appContent?.howItWorks} />

      {/* 6. App FAQs */}
      <AppFaqSection isEn={isEn} faqs={appContent?.faqs} />

      {/* 7. Download CTA Banner */}
      <AppDownloadCtaSection isEn={isEn} data={ctaData} />

      {/* 8. Floating Sticky Mobile Bar */}
      <AppStickyMobileBar
        isEn={isEn}
        googlePlayUrl={settings.playStoreUrl}
        appStoreUrl={settings.appStoreUrl}
      />
    </main>
  );
}
