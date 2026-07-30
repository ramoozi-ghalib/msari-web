import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import OffersSlider from '@/components/home/OffersSlider';
import CitiesSection from '@/components/home/CitiesSection';
import FeaturedHotels from '@/components/home/FeaturedHotels';
import WhyMsari from '@/components/home/WhyMsari';
import AppDownloadSection from '@/components/home/AppDownloadSection';
import { getLocalHotels } from '@/actions/hotels';
import { getActiveOffers } from '@/actions/offers';
import { getActiveCities } from '@/actions/cities';

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
  console.log('[BOOT-6] Executing src/app/[locale]/page.tsx -> HomePage Render');
  const [{ data: hotels }, offers, cities] = await Promise.all([
    getLocalHotels({ sort: 'recommended', pageSize: 12 }),
    getActiveOffers(),
    getActiveCities(),
  ]);

  const featuredHotels = hotels.filter((h) => h.isFeatured);

  return (
    <>
      <HeroSection />
      <OffersSlider offers={offers} />
      <FeaturedHotels hotels={featuredHotels} />
      <CitiesSection cities={cities} />
      <WhyMsari />
      <AppDownloadSection />
    </>
  );
}

