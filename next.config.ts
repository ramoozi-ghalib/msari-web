import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://msari.net https://*.supabase.co https://*.supabase.in https://firebasestorage.googleapis.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.cloudfunctions.net",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'msari.net' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // ─── Legacy WordPress URL Redirects (301 Permanent SEO Preservation) ───
      { source: '/st_hotel/:slug', destination: '/hotels/:slug', permanent: true },
      { source: '/st_hotel/:slug/', destination: '/hotels/:slug', permanent: true },
      { source: '/st_location/:slug*', destination: '/hotels', permanent: true },
      { source: '/location/:slug*', destination: '/hotels', permanent: true },
      { source: '/product/:slug*', destination: '/hotels', permanent: true },
      { source: '/renting-cars', destination: '/cars', permanent: true },
      { source: '/renting-cars/', destination: '/cars', permanent: true },
      { source: '/flight', destination: '/flights', permanent: true },
      { source: '/flight/', destination: '/flights', permanent: true },
      { source: '/msari-app-privacy-policy', destination: '/privacy', permanent: true },
      { source: '/msari-app-privacy-policy/', destination: '/privacy', permanent: true },
      { source: '/app-msari', destination: '/app', permanent: true },
      { source: '/app-msari/', destination: '/app', permanent: true },
      { source: '/feed/:path*', destination: '/sitemap.xml', permanent: true },
      { source: '/feed', destination: '/sitemap.xml', permanent: true },
      { source: '/comments/feed', destination: '/sitemap.xml', permanent: true },
      { source: '/wp-content/uploads/:path*', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82/', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82/:path*', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%88%d8%ac%d9%87%d8%a7%d8%aa', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%88%d8%ac%d9%87%d8%a7%d8%aa/', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%88%d8%ac%d9%87%d8%a7%d8%aa/:path*', destination: '/hotels', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
