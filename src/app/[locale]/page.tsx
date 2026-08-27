import type { Metadata } from 'next';
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

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Msari | Your Gateway to Hotel Booking in Yemen'
    : 'مساري | بوابتك لحجز أفضل فنادق اليمن';

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

export default async function HomePage() {
  const [{ data: hotels }, offers, cities, homepageContent, settings] = await Promise.all([
    getLocalHotels({ sort: 'recommended', pageSize: 12 }),
    getActiveOffers(),
    getActiveCities(),
    HomepageCmsService.getHomepageContent(),
    SettingsCmsService.getSettings(),
  ]);

  const featuredHotels = hotels.filter((h) => h.isFeatured);

  const appDownloadFixed = {
    ...homepageContent.appDownload,
    playStoreUrl: settings.playStoreUrl,
    appStoreUrl: settings.appStoreUrl,
  };

  return (
    <>
      <HeroSection hero={homepageContent.hero} />
      <OffersSlider offers={offers} />
      <FeaturedHotels hotels={featuredHotels} />
      <CitiesSection cities={cities} />
      <WhyMsari whyMsari={homepageContent.whyMsari} />
      <AppDownloadSection appDownload={appDownloadFixed} />
      <SocialFollowSection socialFollow={homepageContent.socialFollow} />
    </>
  );
}
