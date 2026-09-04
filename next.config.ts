import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
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
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://msari.net https://*.supabase.co https://*.supabase.in https://firebasestorage.googleapis.com https://*.firebasestorage.app https://storage.googleapis.com https://*.googleusercontent.com https://lh3.googleusercontent.com",
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
      { protocol: 'https', hostname: '*.firebasestorage.app' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
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
      { source: '/st_location/:slug*', destination: '/destinations', permanent: true },
      { source: '/location/:slug*', destination: '/destinations', permanent: true },
      { source: '/product/:slug*', destination: '/hotels', permanent: true },
      { source: '/renting-cars', destination: '/cars', permanent: true },
      { source: '/renting-cars/', destination: '/cars', permanent: true },
      { source: '/flight', destination: '/flights', permanent: true },
      { source: '/flight/', destination: '/flights', permanent: true },
      { source: '/app-msari', destination: '/app', permanent: true },
      { source: '/app-msari/', destination: '/app', permanent: true },
      { source: '/community-blog', destination: '/blog', permanent: true },
      { source: '/community-blog/', destination: '/blog', permanent: true },
      { source: '/faq', destination: '/contact', permanent: true },
      { source: '/faq/', destination: '/contact', permanent: true },
      { source: '/become-local-expert', destination: '/add-hotel', permanent: true },
      { source: '/become-local-expert/', destination: '/add-hotel', permanent: true },
      { source: '/function-partner-page', destination: '/add-hotel', permanent: true },
      { source: '/function-partner-page/', destination: '/add-hotel', permanent: true },
      { source: '/msari-app-privacy-policy', destination: '/privacy', permanent: true },
      { source: '/msari-app-privacy-policy/', destination: '/privacy', permanent: true },

      // Legacy Sitemaps & Feeds
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/page-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/product-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/feed/:path*', destination: '/blog', permanent: true },
      { source: '/feed', destination: '/blog', permanent: true },
      { source: '/comments/feed', destination: '/blog', permanent: true },

      // Encoded Legacy Arabic URLs
      { source: '/%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82/', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d8%a8%d8%ad%d8%ab-%d8%b9%d9%86-%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d8%a8%d8%ad%d8%ab-%d8%b9%d9%86-%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82/', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d9%88%d8%ac%d9%87%d8%a7%d8%aa', destination: '/destinations', permanent: true },
      { source: '/%d8%a7%d9%84%d9%88%d8%ac%d9%87%d8%a7%d8%aa/', destination: '/destinations', permanent: true },
      { source: '/%d9%85%d8%b1%d9%83%d8%b2-%d8%a7%d9%84%d9%85%d8%b3%d8%a7%d8%b9%d8%af%d8%a9', destination: '/contact', permanent: true },
      { source: '/%d9%85%d8%b1%d9%83%d8%b2-%d8%a7%d9%84%d9%85%d8%b3%d8%a7%d8%b9%d8%af%d8%a9/', destination: '/contact', permanent: true },
      { source: '/%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9', destination: '/privacy', permanent: true },
      { source: '/%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9/', destination: '/privacy', permanent: true },
      { source: '/%d8%a7%d9%84%d8%b4%d8%b1%d9%88%d8%b7-%d9%88%d8%a7%d9%84%d8%a3%d8%ad%d9%83%d8%a7%d9%85', destination: '/terms', permanent: true },
      { source: '/%d8%a7%d9%84%d8%b4%d8%b1%d9%88%d8%b7-%d9%88%d8%a7%d9%84%d8%a3%d8%ad%d9%83%d8%a7%d9%85/', destination: '/terms', permanent: true },
      { source: '/%d8%ae%d9%8a%d8%a7%d8%b1%d8%a7%d8%aa-%d8%a7%d9%84%d8%a5%d9%84%d8%ba%d8%a7%d8%a1', destination: '/terms', permanent: true },
      { source: '/%d8%ae%d9%8a%d8%a7%d8%b1%d8%a7%d8%aa-%d8%a7%d9%84%d8%a5%d9%84%d8%ba%d8%a7%d8%a1/', destination: '/terms', permanent: true },
      { source: '/%d8%b9%d8%b1%d8%a8%d8%a9-%d8%a7%d9%84%d8%aa%d8%b3%d9%88%d9%82', destination: '/hotels', permanent: true },
      { source: '/%d8%b9%d8%b1%d8%a8%d8%a9-%d8%a7%d9%84%d8%aa%d8%b3%d9%88%d9%82/', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d8%b3%d9%84%d8%a9', destination: '/hotels', permanent: true },
      { source: '/%d8%a7%d9%84%d8%b3%d9%84%d8%a9/', destination: '/hotels', permanent: true },
      { source: '/checkout', destination: '/hotels', permanent: true },
      { source: '/checkout/', destination: '/hotels', permanent: true },
      { source: '/checkout-woo', destination: '/hotels', permanent: true },
      { source: '/checkout-woo/', destination: '/hotels', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
