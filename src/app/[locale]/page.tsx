import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import OffersSlider from '@/components/home/OffersSlider';
import CitiesSection from '@/components/home/CitiesSection';
import FeaturedHotels from '@/components/home/FeaturedHotels';
import WhyMsari from '@/components/home/WhyMsari';
import { getLocalHotels } from '@/actions/hotels';
import { getActiveOffers } from '@/actions/offers';
import { getActiveCities } from '@/actions/cities';

export const metadata: Metadata = {
  title: 'مساري - منصة السفر الأولى في اليمن',
  description: 'احجز فنادقك المحلية والعالمية، رحلات الطيران، وخدمات الاستقبال والنقل في اليمن بسهولة وأمان. مساري — رفيقك في كل سفرة.',
};

export default async function HomePage() {
  const [hotels, offers, cities] = await Promise.all([
    getLocalHotels(),
    getActiveOffers(),
    getActiveCities(),
  ]);

  const featuredHotels = hotels.filter((h) => h.isFeatured);

  return (
    <>
      <HeroSection />
      <OffersSlider offers={offers} />
      <CitiesSection cities={cities} />
      <FeaturedHotels hotels={featuredHotels} />
      <WhyMsari />
    </>
  );
}
