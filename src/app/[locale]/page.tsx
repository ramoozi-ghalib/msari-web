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

export const metadata: Metadata = {
  title: {
    absolute: 'مساري | بوابتك لحجز أفضل فنادق اليمن',
  },
  description: 'احجز أفضل الفنادق في اليمن بسهولة مع مساري، استمتع بعروض حصرية وخيارات متعددة تناسب ميزانيتك مع خدمة عملاء مميزة على مدار الساعة.',
  alternates: {
    canonical: 'https://msari.net/ar',
    languages: {
      'ar': 'https://msari.net/ar',
      'en': 'https://msari.net/en',
      'x-default': 'https://msari.net/ar',
    },
  },
};

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
