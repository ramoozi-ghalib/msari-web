import type { NextConfig } from "next";

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
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://msari.net https://*.supabase.co https://*.supabase.in",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in",
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
      // Admin route protection — redirect to login if session cookie missing
      {
        source: '/admin',
        destination: '/auth/login?redirect=/admin',
        permanent: false,
        missing: [{ type: 'cookie', key: 'msari_admin_session' }],
      },
      {
        source: '/admin/:path*',
        destination: '/auth/login?redirect=/admin',
        permanent: false,
        missing: [{ type: 'cookie', key: 'msari_admin_session' }],
      },
      // Legacy WordPress URL redirects
      { source: '/st_hotel/:slug*', destination: '/hotels', permanent: true },
      { source: '/st_location/:slug*', destination: '/hotels', permanent: true },
      { source: '/location/:slug*', destination: '/hotels', permanent: true },
      {
        source: '/%d8%a7%d9%84%d9%81%d9%86%d8%a7%d8%af%d9%82/',
        destination: '/hotels',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
