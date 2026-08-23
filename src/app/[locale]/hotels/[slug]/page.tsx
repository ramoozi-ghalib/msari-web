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

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
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

export default async function HotelDetailPage(props: Props) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  // Fetch nearest hotels in the same city/region (excluding current hotel)
  let nearbyHotels: Hotel[] = [];
  try {
    const nearbyRes = await getLocalHotels({ city: hotel.city, pageSize: 20 });
    const candidates = (nearbyRes.data || []).filter(h => h.id !== hotel.id && h.slug !== hotel.slug);

    if (hotel.lat && hotel.lng) {
      candidates.sort((a, b) => {
        if (a.lat && a.lng && b.lat && b.lng) {
          const distA = calculateDistanceKm(hotel.lat!, hotel.lng!, a.lat, a.lng);
          const distB = calculateDistanceKm(hotel.lat!, hotel.lng!, b.lat, b.lng);
          return distA - distB;
        }
        return 0;
      });
    }

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
