import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مساري | حجز فنادق اليمن',
    short_name: 'مساري',
    description:
      'احجز أفضل الفنادق في اليمن بسهولة مع مساري — عدن، صنعاء، تعز، المكلا، إب وسيئون.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'ar',
    theme_color: '#23096E',
    background_color: '#F4F2F8',
    categories: ['travel', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'الفنادق',
        short_name: 'الفنادق',
        description: 'تصفح واحجز أفضل الفنادق في اليمن',
        url: '/ar/hotels',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'حجوزاتي',
        short_name: 'حجوزاتي',
        description: 'عرض وإدارة حجوزاتك الفندقية',
        url: '/ar/account/bookings',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
