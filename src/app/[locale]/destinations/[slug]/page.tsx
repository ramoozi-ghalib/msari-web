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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const destination = await getDestinationBySlug(resolvedParams.slug);

  if (!destination) {
    return {
      title: 'الوجهة غير موجودة',
    };
  }

  const pageTitle = `فنادق ${destination.name} - أفضل الفنادق وأماكن الإقامة في ${destination.name}`;
  const pageDesc = destination.tagline || `اكتشف واحجز أفضل فنادق ${destination.name} اليمنية بأقل الأسعار وحسومات حصرية مع تأكيد حجز فوري عبر منصة مساري.`;
  const mainImage = destination.heroImage || 'https://msari.net/images/logo-dark.png';

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [`فنادق ${destination.name}`, `أفضل فنادق ${destination.name}`, `حجز فنادق ${destination.name}`],
    alternates: {
      canonical: `https://msari.net/ar/destinations/${resolvedParams.slug}`,
      languages: {
        'ar': `https://msari.net/ar/destinations/${resolvedParams.slug}`,
        'en': `https://msari.net/en/destinations/${resolvedParams.slug}`,
        'x-default': `https://msari.net/ar/destinations/${resolvedParams.slug}`,
      },
    },
    openGraph: {
      title: `${pageTitle} | مساري`,
      description: pageDesc,
      url: `https://msari.net/ar/destinations/${resolvedParams.slug}`,
      siteName: 'مساري',
      locale: 'ar_YE',
      type: 'website',
      images: [{ url: mainImage, alt: destination.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | مساري`,
      description: pageDesc,
      images: [mainImage],
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const destination = await getDestinationBySlug(resolvedParams.slug);

  if (!destination) {
    notFound();
  }

  const destinationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.name,
    description: destination.tagline || `دليل السياحة وفنادق الإقامة في ${destination.name}`,
    url: `https://msari.net/ar/destinations/${resolvedParams.slug}`,
    image: destination.heroImage || '',
    includesAttraction: (destination.landmarks || []).map((a: any) => ({
      '@type': 'TouristAttraction',
      name: typeof a === 'string' ? a : a.name,
      description: typeof a === 'string' ? '' : a.description,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://msari.net/ar' },
      { '@type': 'ListItem', position: 2, name: 'الوجهات', item: 'https://msari.net/ar/hotels' },
      { '@type': 'ListItem', position: 3, name: `فنادق ${destination.name}`, item: `https://msari.net/ar/destinations/${resolvedParams.slug}` },
    ],
  };

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
