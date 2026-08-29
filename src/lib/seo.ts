// src/lib/seo.ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://msari.net';

export const SEO_VERIFICATIONS = {
  google: 'fPFdK8uTzr7rYRNAcDDh9QGCq0n6sYcE6Id7zbK5t5I',
  other: {
    'msvalidate.01': 'FA9C2AB7AE1B1D81344C938B8A9FFC29',
    'yandex-verification': 'a2836217dc31fa3a',
  },
};

/**
 * Builds localized canonical and hreflang alternates for a given relative path.
 * Normalizes leading/trailing slashes and handles locale prefixing.
 */
export function getLocalizedAlternates(path: string, locale: string = 'ar') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedPath = cleanPath === '/' ? '' : cleanPath;

  const currentLocale = locale === 'en' ? 'en' : 'ar';
  const canonicalUrl = `${SITE_URL}/${currentLocale}${normalizedPath}`;
  const arUrl = `${SITE_URL}/ar${normalizedPath}`;
  const enUrl = `${SITE_URL}/en${normalizedPath}`;

  return {
    canonical: canonicalUrl,
    languages: {
      'ar': arUrl,
      'x-default': arUrl, // Arabic is the default primary market
    },
  };
}

/**
 * Generates Organization and TravelAgency Schema.org JSON-LD
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['TravelAgency', 'Organization'],
    '@id': `${SITE_URL}/#organization`,
    name: 'مساري (Msari Travel)',
    alternateName: 'مساري لحجوزات الفنادق والسياحة',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      caption: 'مساري',
      inLanguage: 'ar',
    },
    image: `${SITE_URL}/logo.png`,
    description: 'منصة مساري لحجز أفضل الفنادق في اليمن بأقل الأسعار وتوفير خدمات الطيران والنقل المساندة.',
    telephone: '+967733644466',
    email: 'info@msari.net',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sanaa / Aden',
      addressCountry: 'YE',
    },
    sameAs: [
      'https://www.facebook.com/msaritravel',
      'https://twitter.com/msaritravel',
      'https://www.instagram.com/msaritravel',
      'https://youtube.com/@msaritravel',
      'https://t.me/msaritravel',
      'https://www.tiktok.com/@msaritravel',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Yemen',
    },
  };
}

/**
 * Generates WebSite Schema.org JSON-LD with Sitelinks SearchBox
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'مساري',
    alternateName: 'حجوزات فنادق اليمن',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: ['ar', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/hotels?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates BreadcrumbList Schema.org JSON-LD
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
    })),
  };
}
