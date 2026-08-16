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
    return { ...data, ...data.content };
  }
  return data;
}

function parseOverview(raw: any, curated?: any) {
  if (typeof raw === 'string') {
    return {
      history: raw,
      climate: curated?.climate || 'مناخ مميز ومعتدل يتيح للزوار الاستمتاع بكافة الأنشطة السياحية.',
      culture: curated?.culture || 'ثقافة وتراث يمني أصيل زاخر بالفنون والأسواق والتقاليد العريقة.',
      bestTimeToVisit: curated?.bestTimeToVisit || 'طوال العام مع فترات مثالية في فصلي الخريف والربيع.',
    };
  }

  if (raw && typeof raw === 'object') {
    return {
      history: raw.history || curated?.history || '',
      climate: raw.climate || curated?.climate || '',
      culture: raw.culture || curated?.culture || '',
      bestTimeToVisit: raw.bestTimeToVisit || curated?.bestTimeToVisit || '',
    };
  }

  return curated || {
    history: '',
    climate: '',
    culture: '',
    bestTimeToVisit: '',
  };
}

async function fetchEditorialGuideInternal(slug: string): Promise<DestinationEditorialData | null> {
  const cleanSlug = slug.trim().toLowerCase();
  const raw = await CmsClient.getDoc<Record<string, any>>('website_destinations', cleanSlug);

  const curated = getDestinationData(cleanSlug);

  if (raw) {
    const isPub = raw.isPublished !== false && raw.status !== 'draft';
    if (isPub) {
      const data = resolveContent(raw);
      return {
        slug: cleanSlug,
        cityId: data.cityId || raw.cityId || cleanSlug,
        tagline: data.tagline || raw.tagline || curated?.tagline || '',
        taglineEn: data.taglineEn || raw.taglineEn || curated?.taglineEn || '',
        heroImage: data.heroImage || raw.heroImage || curated?.heroImage || '',
        overview: parseOverview(data.overview ?? raw.overview, curated?.overview),
        landmarks: Array.isArray(data.landmarks) && data.landmarks.length > 0
          ? data.landmarks
          : (Array.isArray(raw.landmarks) && raw.landmarks.length > 0 ? raw.landmarks : (curated?.landmarks || [])),
        status: 'published',
        isPublished: true,
        updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
      };
    }
    return null;
  }

  // Fallback to local curated dataset if document doesn't exist in Firestore
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
   * Cached getter for a destination's editorial guide with quick revalidation.
   */
  static getEditorialGuide(slug: string): Promise<DestinationEditorialData | null> {
    return unstable_cache(
      () => fetchEditorialGuideInternal(slug),
      [`website_destination_${slug}`],
      { revalidate: process.env.NODE_ENV === 'development' ? 1 : 10, tags: ['cms:destinations', `cms:dest:${slug}`] }
    )();
  }
}
