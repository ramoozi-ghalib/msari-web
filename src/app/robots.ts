import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/*/admin/',
          '/account/',
          '/*/account/',
          '/booking/',
          '/*/booking/',
          '/flights/booking/',
          '/*/flights/booking/',
          '/cars/booking/',
          '/*/cars/booking/',
          '/flights/search/',
          '/*/flights/search/',
          '/favorites/',
          '/*/favorites/',
          '/auth/',
          '/*/auth/',
          '/*?bookingError=*',
        ],
      },
    ],
    sitemap: 'https://msari.net/sitemap.xml',
  };
}
