import type { MetadataRoute } from 'next';
import { generateSlugFromHotel } from '@/lib/api-client';

export const revalidate = 86400; // Revalidate every 24 hours at runtime

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://msari.net';
  const locales = ['ar', 'en'];

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/hotels', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/destinations', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/flights', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/cars', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/cars/airport', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/cars/transport', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/hotels/international', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/app', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/add-hotel', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/developers', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Routes (Localized)
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

  // 2. Dynamic Entries (Hotels, Destinations, Blog Articles)
  try {
    const fetchWithTimeout = <T>(promise: Promise<T>, ms = 4000): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Sitemap fetch timeout')), ms)),
      ]);

    const { db } = await import('@/lib/firebase-admin');

    // 2.1 Dynamic Hotels
    const hotelsSnap = await fetchWithTimeout(db.collection('hotels').get(), 4000);
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
            priority: 0.85,
          });
        }
      }
    });

    // 2.2 Dynamic Destinations (From website_destinations or destinations)
    const destSnap = await fetchWithTimeout(db.collection('website_destinations').get(), 4000);
    if (!destSnap.empty) {
      destSnap.docs.forEach((doc) => {
        const slug = doc.id;
        const d = doc.data();
        const lastMod = d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date();

        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/destinations/${slug}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }

    // 2.3 Dynamic Published Blog Articles
    const blogSnap = await fetchWithTimeout(
      db.collection('web_blog').where('status', '==', 'published').get(),
      4000
    );
    blogSnap.docs.forEach((doc) => {
      const slug = doc.id;
      const d = doc.data();
      const lastMod = d.updatedAt?.toDate ? d.updatedAt.toDate() : (d.publishedAt ? new Date(d.publishedAt) : new Date());

      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/blog/${slug}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  } catch (error) {
    console.error('Sitemap dynamic fetch skipped during build fallback:', error);
  }

  return entries;
}
