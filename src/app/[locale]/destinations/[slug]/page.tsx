// src/app/[locale]/destinations/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDestinationBySlug } from '@/actions/cities';
import { safeJsonLd } from '@/lib/sanitize';
import DestinationDetailClient from './DestinationDetailClient';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

import { getLocalizedAlternates, generateBreadcrumbSchema } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const isEn = resolvedParams.locale === 'en';
  const destination = await getDestinationBySlug(resolvedParams.slug);

  if (!destination) {
    return {
      title: isEn ? 'Destination Not Found' : 'الوجهة غير موجودة',
    };
  }

  const pageTitle = isEn
    ? `Hotels in ${destination.nameEn || destination.name} - Best Accommodation & Guide | Msari`
    : `فنادق ${destination.name} - أفضل الفنادق وأماكن الإقامة في ${destination.name} | مساري`;
  const pageDesc = destination.tagline || (isEn
    ? `Discover and book top hotels in ${destination.nameEn || destination.name}, Yemen. Exclusive offers, tourist attractions, and instant booking on Msari.`
    : `اكتشف واحجز أفضل فنادق ${destination.name} اليمنية بأقل الأسعار وحسومات حصرية مع تأكيد حجز فوري عبر منصة مساري.`);
  const mainImage = destination.heroImage || 'https://msari.net/logo.png';

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [`فنادق ${destination.name}`, `أفضل فنادق ${destination.name}`, `حجز فنادق ${destination.name}`],
    alternates: getLocalizedAlternates(`/destinations/${resolvedParams.slug}`, resolvedParams.locale),
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/destinations/${resolvedParams.slug}`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
      images: [{ url: mainImage, alt: destination.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [mainImage],
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const isEn = resolvedParams.locale === 'en';
  const destination = await getDestinationBySlug(resolvedParams.slug);

  if (!destination) {
    notFound();
  }

  const destinationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: isEn ? (destination.nameEn || destination.name) : destination.name,
    description: destination.tagline || `دليل السياحة وفنادق الإقامة في ${destination.name}`,
    url: `https://msari.net/${isEn ? 'en' : 'ar'}/destinations/${resolvedParams.slug}`,
    image: destination.heroImage || '',
    includesAttraction: (destination.landmarks || []).map((a: any) => ({
      '@type': 'TouristAttraction',
      name: typeof a === 'string' ? a : a.name,
      description: typeof a === 'string' ? '' : a.description,
    })),
  };

  const breadcrumbs = isEn
    ? [
        { name: 'Home', url: '/en' },
        { name: 'Destinations', url: '/en/destinations' },
        { name: destination.nameEn || destination.name, url: `/en/destinations/${resolvedParams.slug}` },
      ]
    : [
        { name: 'الرئيسية', url: '/ar' },
        { name: 'الوجهات', url: '/ar/destinations' },
        { name: destination.name, url: `/ar/destinations/${resolvedParams.slug}` },
      ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(destinationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <DestinationDetailClient
        destination={destination}
        locale={resolvedParams.locale}
      />
    </>
  );
}
