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
    badgeAr: 'المنصة الأولى لحجز الفنادق في اليمن',
    titleAr: 'حجزك أسهل... مع مساري',
    subtitleAr: 'احجز فندقك في اليمن بأفضل سعر',
    backgroundImageUrl: '/images/hero-bg.jpg',
    stats: [
      { value: '5000+', labelAr: 'مستخدم سعيد', color: '#23096E' },
      { value: '50+', labelAr: 'فندق شريك', color: '#23096E' },
      { value: '10', labelAr: 'مدن ومحافظات', color: '#FF3B30' },
    ],
  },
  whyMsari: {
    sectionTitleAr: 'المنصة التي تثق بها',
    badgeAr: 'لماذا مساري',
    features: [
      { title: 'دفع آمن', desc: 'حجز موثوق مع خيارات دفع مرنة تناسبك', color: 'from-[#23096E] to-[#3A1C8F]' },
      { title: 'دعم على مدار الساعة', desc: 'فريقنا معك للرد على استفساراتك على مدار الساعة', color: 'from-[#3A1C8F] to-[#23096E]' },
      { title: 'أفضل الأسعار', desc: 'عروض حصرية وأسعار تنافسية', color: 'from-[#FF3B30] to-[#23096E]' },
      { title: 'تغطية واسعة', desc: '10 مدن يمنية، وشراكات فنادق', color: 'from-[#FF3B30] to-[#3A1C8F]' },
      { title: 'محلي وعالمي', desc: 'فنادق يمنية وعالمية، ومقارنة الأسعار والحجز', color: 'from-[#23096E] to-[#FF3B30]' },
      { title: 'API للشركاء', desc: 'نوفر API متكامل لأي شريك تقني يريد التكامل معنا', color: 'from-[#3A1C8F] to-[#23096E]' },
    ],
    partnerCta: {
      badgeAr: 'للشركاء والمطورين',
      titleAr: 'هل أنت مزود فندق أو شريك تقني؟ انضم لشبكة مساري',
      descriptionAr: 'انضم لشبكة مساري وضاعف حجوزاتك مع نظام إدارة متكامل وربط برمجي مباشر',
      buttonTextAr: 'أضف فندقك',
      href: '/add-hotel',
    },
  },
  appDownload: {
    badgeAr: 'تطبيق مساري للهواتف الذكية',
    titleAr: 'حمّل تطبيق مساري الآن',
    subtitleAr: 'احجز فنادقك وتنقلاتك من أي مكان وفي أي وقت بسهولة وأمان',
    mockupImageUrl: '/images/app-screen.png',
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
      badgeAr: data.hero?.badgeAr || FALLBACK_HOMEPAGE.hero.badgeAr,
      badgeEn: data.hero?.badgeEn,
      titleAr: data.hero?.titleAr || FALLBACK_HOMEPAGE.hero.titleAr,
      titleEn: data.hero?.titleEn,
      subtitleAr: data.hero?.subtitleAr || FALLBACK_HOMEPAGE.hero.subtitleAr,
      subtitleEn: data.hero?.subtitleEn,
      backgroundImageUrl: data.hero?.backgroundImageUrl || FALLBACK_HOMEPAGE.hero.backgroundImageUrl,
      stats: Array.isArray(data.hero?.stats) && data.hero.stats.length > 0
        ? data.hero.stats
        : FALLBACK_HOMEPAGE.hero.stats,
    },
    whyMsari: {
      sectionTitleAr: data.whyMsari?.sectionTitleAr || FALLBACK_HOMEPAGE.whyMsari.sectionTitleAr,
      badgeAr: data.whyMsari?.badgeAr || FALLBACK_HOMEPAGE.whyMsari.badgeAr,
      features: Array.isArray(data.whyMsari?.features) && data.whyMsari.features.length > 0
        ? data.whyMsari.features.map((f: any) => ({
            title: f.titleAr || f.title || '',
            titleAr: f.titleAr || f.title || '',
            titleEn: f.titleEn,
            desc: f.descAr || f.desc || '',
            descAr: f.descAr || f.desc || '',
            descEn: f.descEn,
            icon: f.icon,
            color: f.color,
          }))
        : FALLBACK_HOMEPAGE.whyMsari.features,
      partnerCta: {
        badgeAr: data.whyMsari?.partnerCta?.badgeAr || FALLBACK_HOMEPAGE.whyMsari.partnerCta.badgeAr,
        titleAr: data.whyMsari?.partnerCta?.titleAr || FALLBACK_HOMEPAGE.whyMsari.partnerCta.titleAr,
        descriptionAr: data.whyMsari?.partnerCta?.descriptionAr || (data.whyMsari?.partnerCta as any)?.descAr || FALLBACK_HOMEPAGE.whyMsari.partnerCta.descriptionAr,
        buttonTextAr: data.whyMsari?.partnerCta?.buttonTextAr || FALLBACK_HOMEPAGE.whyMsari.partnerCta.buttonTextAr,
        href: data.whyMsari?.partnerCta?.href || (data.whyMsari?.partnerCta as any)?.buttonUrl || FALLBACK_HOMEPAGE.whyMsari.partnerCta.href,
      },
    },
    appDownload: {
      badgeAr: data.appDownload?.badgeAr || FALLBACK_HOMEPAGE.appDownload.badgeAr,
      titleAr: data.appDownload?.titleAr || FALLBACK_HOMEPAGE.appDownload.titleAr,
      subtitleAr: data.appDownload?.subtitleAr || FALLBACK_HOMEPAGE.appDownload.subtitleAr,
      mockupImageUrl: data.appDownload?.mockupImageUrl || FALLBACK_HOMEPAGE.appDownload.mockupImageUrl,
      playStoreUrl: data.appDownload?.playStoreUrl || FALLBACK_HOMEPAGE.appDownload.playStoreUrl,
      appStoreUrl: data.appDownload?.appStoreUrl || FALLBACK_HOMEPAGE.appDownload.appStoreUrl,
    },
    updatedAt: data.updatedAt ? String(data.updatedAt) : null,
  };
}

const CMS_REVALIDATE = process.env.NODE_ENV === 'development' ? 1 : 10;

export class HomepageCmsService {
  /**
   * Cached getter for homepage content (Tagged cache: 'cms:homepage').
   */
  static getHomepageContent = unstable_cache(
    fetchHomepageInternal,
    ['website_homepage_main'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:homepage'] }
  );
}
