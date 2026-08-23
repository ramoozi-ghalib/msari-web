import { notFound } from 'next/navigation';
import { getHotelBySlug, getLocalHotels } from '@/actions/hotels';
import { safeJsonLd } from '@/lib/sanitize';
import HotelDetailClient from './HotelDetailClient';
import type { Hotel } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    return { title: 'فندق غير موجود' };
  }

  const pageTitle = `${hotel.name} - فنادق ${hotel.city || 'اليمن'}`;
  const pageDesc = hotel.description || `احجز إقامتك في ${hotel.name} بمدينة ${hotel.city || 'اليمن'} عبر منصة مساري بأفضل الأسعار المتاحة مع تأكيد حجز فوري.`;
  const mainImage = hotel.images && hotel.images.length > 0 ? hotel.images[0] : 'https://msari.net/images/logo-dark.png';

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: `https://msari.net/ar/hotels/${slug}`,
      languages: {
        'ar': `https://msari.net/ar/hotels/${slug}`,
        'en': `https://msari.net/en/hotels/${slug}`,
        'x-default': `https://msari.net/ar/hotels/${slug}`,
      },
    },
    openGraph: {
      title: `${pageTitle} | مساري`,
      description: pageDesc,
      url: `https://msari.net/ar/hotels/${slug}`,
      siteName: 'مساري',
      locale: 'ar_YE',
      type: 'website',
      images: [{ url: mainImage, alt: hotel.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | مساري`,
      description: pageDesc,
      images: [mainImage],
    },
  };
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getProximityDistance(baseHotel: Hotel, target: Hotel): number {
  // 1. Precise GPS Distance if coordinates exist
  if (
    typeof baseHotel.lat === 'number' &&
    typeof baseHotel.lng === 'number' &&
    typeof target.lat === 'number' &&
    typeof target.lng === 'number'
  ) {
    return calculateDistanceKm(baseHotel.lat, baseHotel.lng, target.lat, target.lng);
  }

  // 2. Address / District keyword similarity matching
  let proximityScore = 30; // base score for same city
  if (baseHotel.address && target.address) {
    const cleanWords = (text: string) =>
      text
        .toLowerCase()
        .replace(/[,،.-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['شارع', 'اليمن', 'فندق', 'مدينة', 'حي', 'منطقة'].includes(w));

    const baseWords = cleanWords(baseHotel.address);
    const targetWords = cleanWords(target.address);
    const common = baseWords.filter(w => targetWords.includes(w));
    if (common.length > 0) {
      proximityScore -= Math.min(25, common.length * 8);
    }
  }

  return proximityScore;
}

export default async function HotelDetailPage(props: Props) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  // Fetch true nearest 3 hotels by distance in the same city/region
  let nearbyHotels: Hotel[] = [];
  try {
    const nearbyRes = await getLocalHotels({ city: hotel.city, pageSize: 50 });
    const candidates = (nearbyRes.data || []).filter(h => h.id !== hotel.id && h.slug !== hotel.slug);

    // Sort strictly by proximity distance to current hotel
    candidates.sort((a, b) => {
      const distA = getProximityDistance(hotel, a);
      const distB = getProximityDistance(hotel, b);
      return distA - distB;
    });

    nearbyHotels = candidates.slice(0, 3);
  } catch {
    // Graceful fallback
  }

  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: hotel.description || `فندق ${hotel.name} في ${hotel.city}`,
    url: `https://msari.net/ar/hotels/${slug}`,
    image: hotel.images || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.city || 'Yemen',
      streetAddress: hotel.address || hotel.city || 'Yemen',
      addressCountry: 'YE',
    },
    priceRange: hotel.priceFrom ? `$${hotel.priceFrom}` : '$$',
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.stars || 4,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://msari.net/ar' },
      { '@type': 'ListItem', position: 2, name: 'فنادق اليمن', item: 'https://msari.net/ar/hotels' },
      { '@type': 'ListItem', position: 3, name: hotel.name, item: `https://msari.net/ar/hotels/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(hotelSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <HotelDetailClient hotel={hotel!} nearbyHotels={nearbyHotels} />
    </>
  );
}
