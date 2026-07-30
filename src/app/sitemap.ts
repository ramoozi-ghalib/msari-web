import type { MetadataRoute } from 'next';
import { generateSlugFromHotel } from '@/lib/api-client';

export const revalidate = 86400; // Revalidate every 24 hours at runtime

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://msari.net';
  const locales = ['ar', 'en'];

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/hotels', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/flights', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/cars', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Routes
  for (const locale of locales) {
    for (const route of staticRoutes) {
      const localePrefix = locale === 'ar' ? '/ar' : '/en';
      entries.push({
        url: `${baseUrl}${localePrefix}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  // 2. Dynamic Entries with Safety Timeout for Static Export Build Safety
  try {
    const fetchWithTimeout = <T>(promise: Promise<T>, ms = 3000): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Sitemap fetch timeout')), ms)),
      ]);

    const { db } = await import('@/lib/firebase-admin');

    const hotelsSnap = await fetchWithTimeout(db.collection('hotels').get(), 3000);
    hotelsSnap.docs.forEach((doc) => {
      const d = doc.data();
      if (d.isPublished !== false && d.isDeleted !== true) {
        const nameEn = typeof d.name === 'object' ? (d.name?.en || d.name?.ar) : (d.nameEn || d.name || '');
        const slug = generateSlugFromHotel(doc.id, nameEn);
        const lastMod = d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date();

        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/hotels/${slug}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    });

    const destSnap = await fetchWithTimeout(db.collection('destinations').get(), 3000);
    destSnap.docs.forEach((doc) => {
      const d = doc.data();
      if (d.isDeleted !== true) {
        const nameEn = d.nameEn || d.name || doc.id;
        const slug = nameEn.toLowerCase().replace(/\s+/g, '-');
        const lastMod = d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date();

        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/destinations/${slug}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    });
  } catch (error) {
    console.error('Sitemap dynamic fetch skipped during build fallback:', error);
  }

  return entries;
}
