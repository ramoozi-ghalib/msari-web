import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/actions/hotels';
import HotelDetailClient from './HotelDetailClient';

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

export default async function HotelDetailPage(props: Props) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HotelDetailClient hotel={hotel!} />
    </>
  );
}
