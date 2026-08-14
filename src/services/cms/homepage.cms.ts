/**
 * src/services/cms/homepage.cms.ts
 *
 * CMS Service for Homepage Editorial Content (website_homepage/main).
 */

import { unstable_cache } from 'next/cache';
import { CmsClient } from './cms.client';
import type { HomepageContentData } from './types';

const FALLBACK_HOMEPAGE: HomepageContentData = {
  hero: {
    titleAr: 'اكتشف أجمل وجهات اليمن\nمع مساري',
    subtitleAr: 'منصة يمنية متخصصة لحجز الفنادق ورحلات الطيران وتأجير السيارات بسهولة وأمان',
    backgroundImageUrl: '/images/hero-bg.jpg',
    stats: [
      { value: '5000+', labelAr: 'مستخدم سعيد', color: '#23096E' },
      { value: '50+', labelAr: 'فندق', color: '#23096E' },
      { value: '10', labelAr: 'مدن', color: '#FF3B30' },
    ],
  },
  whyMsari: {
    sectionTitleAr: 'المنصة التي تثق بها',
    badgeAr: '✨ لماذا مساري؟',
    partnerCta: {
      titleAr: 'هل أنت مزود فندق أو شريك تقني؟ انضم لشبكة مساري',
      buttonTextAr: 'انضم كشريك',
      href: '/developers',
    },
  },
  appDownload: {
    titleAr: 'حمّل تطبيق مساري',
    subtitleAr: 'تجربة سفر متكاملة في جيبك — احجز، تابع حجوزاتك، واستفد من عروض التطبيق الحصرية',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=net.msari.app',
    appStoreUrl: 'https://apps.apple.com',
  },
  updatedAt: null,
};

async function fetchHomepageInternal(): Promise<HomepageContentData> {
  const data = await CmsClient.getDoc<Partial<HomepageContentData>>('website_homepage', 'main');

  if (!data) {
    return FALLBACK_HOMEPAGE;
  }

  return {
    hero: {
      titleAr: data.hero?.titleAr || FALLBACK_HOMEPAGE.hero.titleAr,
      subtitleAr: data.hero?.subtitleAr || FALLBACK_HOMEPAGE.hero.subtitleAr,
      backgroundImageUrl: data.hero?.backgroundImageUrl || FALLBACK_HOMEPAGE.hero.backgroundImageUrl,
      stats: Array.isArray(data.hero?.stats) && data.hero.stats.length > 0
        ? data.hero.stats
        : FALLBACK_HOMEPAGE.hero.stats,
    },
    whyMsari: {
      sectionTitleAr: data.whyMsari?.sectionTitleAr || FALLBACK_HOMEPAGE.whyMsari.sectionTitleAr,
      badgeAr: data.whyMsari?.badgeAr || FALLBACK_HOMEPAGE.whyMsari.badgeAr,
      partnerCta: {
        titleAr: data.whyMsari?.partnerCta?.titleAr || FALLBACK_HOMEPAGE.whyMsari.partnerCta.titleAr,
        buttonTextAr: data.whyMsari?.partnerCta?.buttonTextAr || FALLBACK_HOMEPAGE.whyMsari.partnerCta.buttonTextAr,
        href: data.whyMsari?.partnerCta?.href || FALLBACK_HOMEPAGE.whyMsari.partnerCta.href,
      },
    },
    appDownload: {
      titleAr: data.appDownload?.titleAr || FALLBACK_HOMEPAGE.appDownload.titleAr,
      subtitleAr: data.appDownload?.subtitleAr || FALLBACK_HOMEPAGE.appDownload.subtitleAr,
      playStoreUrl: data.appDownload?.playStoreUrl || FALLBACK_HOMEPAGE.appDownload.playStoreUrl,
      appStoreUrl: data.appDownload?.appStoreUrl || FALLBACK_HOMEPAGE.appDownload.appStoreUrl,
    },
    updatedAt: data.updatedAt ? String(data.updatedAt) : null,
  };
}

export class HomepageCmsService {
  /**
   * Cached getter for homepage content (Tagged cache: 'cms:homepage').
   */
  static getHomepageContent = unstable_cache(
    fetchHomepageInternal,
    ['website_homepage_main'],
    { revalidate: 3600, tags: ['cms:homepage'] }
  );
}
