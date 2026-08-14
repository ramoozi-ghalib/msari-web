/**
 * src/services/cms/destinations.cms.ts
 *
 * CMS Service for Destination Editorial Content (website_destinations/{slug}).
 */

import { unstable_cache } from 'next/cache';
import { CmsClient } from './cms.client';
import type { DestinationEditorialData } from './types';
import { getDestinationData } from '@/data/destinations';

async function fetchEditorialGuideInternal(slug: string): Promise<DestinationEditorialData | null> {
  const cleanSlug = slug.trim().toLowerCase();
  const data = await CmsClient.getDoc<Record<string, any>>('website_destinations', cleanSlug);

  if (data) {
    const status = data.status || (data.isPublished ? 'published' : 'draft');
    if (status === 'published') {
      return {
        slug: cleanSlug,
        cityId: data.cityId || cleanSlug,
        tagline: data.tagline || '',
        taglineEn: data.taglineEn || '',
        heroImage: data.heroImage || '',
        overview: data.overview || {
          history: '',
          climate: '',
          culture: '',
          bestTimeToVisit: '',
        },
        landmarks: Array.isArray(data.landmarks) ? data.landmarks : [],
        status: 'published',
        isPublished: true,
        updatedAt: data.updatedAt ? String(data.updatedAt) : null,
      };
    }
    // Explicit draft or archived in CMS -> do not expose draft edits
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
