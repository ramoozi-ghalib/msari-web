import { notFound } from 'next/navigation';
import { getHotelBySlug, getLocalHotels, getHotelsByIds } from '@/actions/hotels';
import { safeJsonLd } from '@/lib/sanitize';
import HotelDetailClient from './HotelDetailClient';
import type { Hotel } from '@/types';

import { getLocalizedAlternates, generateBreadcrumbSchema } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(props: Props) {
  const { locale, slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    return { title: 'فندق غير موجود' };
  }

  const isEn = locale === 'en';

  // ── SEO title (Arabic): `فندق {name} - {city} | مساري` ──
  // Smart assembly: strip a leading فندق to avoid duplication, and append the
  // city only when the name doesn't already contain it. Hotel display names
  // elsewhere are untouched — this affects the SEO title only.
  const rawName = (hotel.name || '').trim();
  const cleanName = rawName.replace(/^\s*فندق\s+/, '').trim() || rawName;
  const cityName = (hotel.city || '').trim();
  const nameHasCity = !!cityName && cleanName.includes(cityName);
  const seoHotelName = `فندق ${cleanName}${nameHasCity || !cityName ? '' : ` - ${cityName}`}`;

  // ── Sales meta description, composed from real fields only ──
  // (price/stars/top amenities) so every hotel gets a unique description.
  const topAmenities = (hotel.amenities || [])
    .map(a => (typeof a?.name === 'string' ? a.name.trim() : ''))
    .filter(Boolean)
    .slice(0, 2);
  const priceBit = hotel.priceFrom > 0 ? ` ابتداءً من $${hotel.priceFrom} لليلة،` : '';
  const starsBit = hotel.stars ? ` ${hotel.stars} نجوم،` : '';
  const amenBit = topAmenities.length > 0 ? ` ${topAmenities.join('، ')}،` : '';
  const pageTitle = isEn
    ? `${hotel.name} - Hotels in ${hotel.city || 'Yemen'} | Msari`
    : `${seoHotelName} | مساري`;
  const pageDesc = isEn
    ? `Book your stay at ${hotel.name} in ${hotel.city || 'Yemen'} via Msari platform at the best available rates with instant confirmation.`
    : `احجز ${seoHotelName} عبر مساري:${priceBit}${starsBit}${amenBit} تأكيد حجز فوري وأفضل الأسعار المتاحة.`;
  const mainImage = hotel.images && hotel.images.length > 0 ? hotel.images[0] : 'https://msari.net/icon.png';

  const keywords = isEn
    ? undefined
    : [
        seoHotelName,
        cityName ? `فنادق ${cityName}` : '',
        cityName ? `أفضل فنادق ${cityName}` : '',
        cityName ? `حجز فنادق ${cityName}` : '',
        cleanName ? `أسعار ${cleanName}` : '',
        cleanName && cityName && !nameHasCity ? `${cleanName} ${cityName}` : '',
      ].filter(Boolean);

  return {
    title: pageTitle,
    description: pageDesc,
    ...(keywords ? { keywords } : {}),
    alternates: getLocalizedAlternates(`/hotels/${slug}`, locale),
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `https://msari.net/${locale === 'en' ? 'en' : 'ar'}/hotels/${slug}`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
      images: [{ url: mainImage, alt: hotel.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
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
  const { locale, slug } = await props.params;
  const isEn = locale === 'en';
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  // Fetch all hotels to accurately calculate closest 3 hotels by distance
  // CLOSURE Phase 2: مرحلتان — قائمة خفيفة بلا أسعار غرف للترتيب الجغرافي،
  // ثم جلب كامل للثلاثة المختارة فقط (بدل تكرير أسعار الغرف لـ100 فندق).
  let nearbyHotels: Hotel[] = [];
  try {
    const allRes = await getLocalHotels({ pageSize: 100, skipRoomPrices: true });
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

    nearbyHotels = await getHotelsByIds(candidates.slice(0, 3).map(h => h.id));
  } catch {
    // Graceful fallback
  }

  // Real coordinates only — never assert a fallback city as the hotel's location.
  const hasRealCoords =
    typeof hotel.lat === 'number' && typeof hotel.lng === 'number' &&
    !isNaN(hotel.lat) && !isNaN(hotel.lng);
  const schemaAmenities = (hotel.amenities || [])
    .map(a => (typeof a?.name === 'string' ? a.name.trim() : ''))
    .filter(Boolean)
    .slice(0, 8);

  const hotelSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: hotel.description || `فندق ${hotel.name} في ${hotel.city}`,
    url: `https://msari.net/${isEn ? 'en' : 'ar'}/hotels/${slug}`,
    image: hotel.images || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.city || 'Yemen',
      streetAddress: hotel.address || hotel.city || 'Yemen',
      addressCountry: 'YE',
    },
    priceRange: hotel.priceFrom ? `$${hotel.priceFrom}` : '$$',
    // starRating = official category classification (NOT guest reviews).
    // Never emit aggregateRating: rating/reviewCount in our data are placeholders.
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.stars || 3,
    },
    ...(hasRealCoords
      ? { geo: { '@type': 'GeoCoordinates', latitude: hotel.lat, longitude: hotel.lng } }
      : {}),
    ...(schemaAmenities.length > 0
      ? { amenityFeature: schemaAmenities.map(n => ({ '@type': 'LocationFeatureSpecification', name: n })) }
      : {}),
  };

  const breadcrumbs = isEn
    ? [
        { name: 'Home', url: '/en' },
        { name: 'Hotels in Yemen', url: '/en/hotels' },
        { name: hotel.name, url: `/en/hotels/${slug}` },
      ]
    : [
        { name: 'الرئيسية', url: '/ar' },
        { name: 'فنادق اليمن', url: '/ar/hotels' },
        { name: hotel.name, url: `/ar/hotels/${slug}` },
      ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

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
