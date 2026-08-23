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

// Known coordinates for Yemeni cities / governorates
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'صنعاء': { lat: 15.3694, lng: 44.1910 },
  'sanaa': { lat: 15.3694, lng: 44.1910 },
  'sana\'a': { lat: 15.3694, lng: 44.1910 },
  'عدن': { lat: 12.7855, lng: 45.0187 },
  'aden': { lat: 12.7855, lng: 45.0187 },
  'تعز': { lat: 13.5776, lng: 44.0199 },
  'taiz': { lat: 13.5776, lng: 44.0199 },
  'المكلا': { lat: 14.5425, lng: 49.1242 },
  'mukalla': { lat: 14.5425, lng: 49.1242 },
  'سيئون': { lat: 15.9392, lng: 48.7878 },
  'seiyun': { lat: 15.9392, lng: 48.7878 },
  'حضرموت': { lat: 15.9392, lng: 48.7878 },
  'hadhramaut': { lat: 15.9392, lng: 48.7878 },
  'الحديدة': { lat: 14.7978, lng: 42.9545 },
  'hudaydah': { lat: 14.7978, lng: 42.9545 },
  'إب': { lat: 13.9667, lng: 44.1667 },
  'ibb': { lat: 13.9667, lng: 44.1667 },
  'مأرب': { lat: 15.4607, lng: 45.3253 },
  'marib': { lat: 15.4607, lng: 45.3253 },
  'ذمار': { lat: 14.5500, lng: 44.4000 },
  'dhamar': { lat: 14.5500, lng: 44.4000 },
  'شبوة': { lat: 14.5333, lng: 46.8333 },
  'shabwa': { lat: 14.5333, lng: 46.8333 },
  'سقطرى': { lat: 12.4634, lng: 53.8237 },
  'socotra': { lat: 12.4634, lng: 53.8237 },
};

function getHotelCoords(h: Hotel): { lat: number; lng: number } {
  if (typeof h.lat === 'number' && typeof h.lng === 'number' && !isNaN(h.lat) && !isNaN(h.lng)) {
    return { lat: h.lat, lng: h.lng };
  }
  const cityKey = (h.city || h.governorate || h.cityId || '').toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (cityKey.includes(key) || key.includes(cityKey)) {
      return coords;
    }
  }
  return { lat: 15.3694, lng: 44.1910 };
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

export default async function HotelDetailPage(props: Props) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  // Fetch all hotels to accurately calculate closest 3 hotels by distance
  let nearbyHotels: Hotel[] = [];
  try {
    const allRes = await getLocalHotels({ pageSize: 100 });
    const candidates = (allRes.data || []).filter(h => h.id !== hotel.id && h.slug !== hotel.slug);

    const baseCoords = getHotelCoords(hotel);
    const baseCity = (hotel.city || '').toLowerCase().trim();

    // Sort strictly by distance to base hotel
    candidates.sort((a, b) => {
      const coordsA = getHotelCoords(a);
      const coordsB = getHotelCoords(b);

      const distA = calculateDistanceKm(baseCoords.lat, baseCoords.lng, coordsA.lat, coordsA.lng);
      const distB = calculateDistanceKm(baseCoords.lat, baseCoords.lng, coordsB.lat, coordsB.lng);

      // Prioritize same city by 0 penalty, different city has geographic penalty
      const sameCityA = (a.city || '').toLowerCase().trim() === baseCity ? 0 : 50;
      const sameCityB = (b.city || '').toLowerCase().trim() === baseCity ? 0 : 50;

      return (sameCityA + distA) - (sameCityB + distB);
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
