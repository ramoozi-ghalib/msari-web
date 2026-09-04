import type { Metadata } from 'next';
import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import OffersSlider from '@/components/home/OffersSlider';
import CitiesSection from '@/components/home/CitiesSection';
import FeaturedHotels from '@/components/home/FeaturedHotels';
import WhyMsari from '@/components/home/WhyMsari';
import AppDownloadSection from '@/components/home/AppDownloadSection';
import SocialFollowSection from '@/components/home/SocialFollowSection';
import { getLocalHotels } from '@/actions/hotels';
import { getActiveOffers } from '@/actions/offers';
import { getActiveCities } from '@/actions/cities';
import { HomepageCmsService, SettingsCmsService } from '@/services/cms';

import { getLocalizedAlternates } from '@/lib/seo';

// Phase 2: كاش المسار 60s (قرار المستخدم) — TTFB يدفع مرة واحدة بالدقيقة
export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Msari | Your Gateway to Hotel Booking in Yemen'
    : 'مساري | بوابتك لحجز أفضل الفنادق في اليمن';

  const description = isEn
    ? 'Book the best hotels in Yemen with ease on Msari. Enjoy exclusive rates and multiple options for Aden, Sanaa, Mukalla, and Taiz.'
    : 'احجز أفضل الفنادق في اليمن بسهولة مع مساري، استمتع بعروض حصرية وخيارات متعددة تناسب ميزانيتك في عدن، صنعاء، تعز، والمكلا مع خدمة عملاء مميزة.';

  return {
    title: { absolute: title },
    description,
    alternates: getLocalizedAlternates('', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${locale === 'en' ? 'en' : 'ar'}`,
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

function SectionSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 my-8 ${height} rounded-3xl bg-neutral-100 animate-pulse`} aria-hidden />
  );
}

// أقسام مستقلة بجلبها الخاص — تُبثّ (stream) بعد الهيرو بدل حجب الصفحة كاملة
async function OffersSection() {
  const offers = await getActiveOffers();
  return <OffersSlider offers={offers} />;
}

async function FeaturedHotelsSection() {
  const { data: hotels } = await getLocalHotels({ sort: 'recommended', pageSize: 12 });
  return <FeaturedHotels hotels={hotels.filter((h) => h.isFeatured)} />;
}

async function CitiesSectionWrapper() {
  const cities = await getActiveCities();
  return <CitiesSection cities={cities} />;
}

export default async function HomePage() {
  // CMS مكاش أصلاً (10s) — فوق الشاشة يُرسم فوراً دون انتظار Firestore البطيء
  const [homepageContent, settings] = await Promise.all([
    HomepageCmsService.getHomepageContent(),
    SettingsCmsService.getSettings(),
  ]);

  const appDownloadFixed = {
    ...homepageContent.appDownload,
    playStoreUrl: settings.playStoreUrl,
    appStoreUrl: settings.appStoreUrl,
  };

  return (
    <>
      <HeroSection hero={homepageContent.hero} />
      <Suspense fallback={<SectionSkeleton height="h-48" />}>
        <OffersSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <FeaturedHotelsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <CitiesSectionWrapper />
      </Suspense>
      <WhyMsari whyMsari={homepageContent.whyMsari} />
      <AppDownloadSection appDownload={appDownloadFixed} />
      <SocialFollowSection socialFollow={homepageContent.socialFollow} />
    </>
  );
}
