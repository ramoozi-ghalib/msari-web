/**
 * src/services/cms/destinations.cms.ts
 *
 * CMS Service for Destination Editorial Content (website_destinations/{slug}).
 */

import { unstable_cache } from 'next/cache';
import { CmsClient } from './cms.client';
import type { DestinationEditorialData } from './types';
import { getDestinationData } from '@/data/destinations';

function resolveContent(data: Record<string, any>): Record<string, any> {
  if (data.content && typeof data.content === 'object' && !Array.isArray(data.content)) {
    return { ...data.content, ...data };
  }
  return data;
}

async function fetchEditorialGuideInternal(slug: string): Promise<DestinationEditorialData | null> {
  const cleanSlug = slug.trim().toLowerCase();
  const raw = await CmsClient.getDoc<Record<string, any>>('website_destinations', cleanSlug);

  if (raw) {
    const isPub = raw.isPublished !== false && raw.status !== 'draft';
    if (isPub) {
      const data = resolveContent(raw);
      return {
        slug: cleanSlug,
        cityId: data.cityId || raw.cityId || cleanSlug,
        tagline: data.tagline || raw.tagline || '',
        taglineEn: data.taglineEn || raw.taglineEn || '',
        heroImage: data.heroImage || raw.heroImage || '',
        overview: data.overview || raw.overview || {
          history: '',
          climate: '',
          culture: '',
          bestTimeToVisit: '',
        },
        landmarks: Array.isArray(data.landmarks) ? data.landmarks : (Array.isArray(raw.landmarks) ? raw.landmarks : []),
        status: 'published',
        isPublished: true,
        updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
      };
    }
    return null;
  }

  // Fallback to local curated dataset if document doesn't exist in Firestore
  const curated = getDestinationData(cleanSlug);
  if (!curated) return null;

  return {
    slug: cleanSlug,
    cityId: curated.id,
    tagline: curated.tagline,
    heroImage: curated.heroImage,
    overview: curated.overview,
    landmarks: curated.landmarks,
    status: 'published',
    isPublished: true,
    updatedAt: null,
  };
}

export class DestinationsCmsService {
  /**
   * Cached getter for a destination's editorial guide.
   */
  static getEditorialGuide(slug: string): Promise<DestinationEditorialData | null> {
    return unstable_cache(
      () => fetchEditorialGuideInternal(slug),
      [`website_destination_${slug}`],
      { revalidate: 86400, tags: ['cms:destinations', `cms:dest:${slug}`] }
    )();
  }
}
