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
