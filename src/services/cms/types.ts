/**
 * src/services/cms/types.ts
 *
 * Unified TypeScript Contracts for Website Management Domain (CMS).
 */

export interface WebsiteSettingsData {
  whatsappNumber: string;
  supportPhone: string;
  infoEmail: string;
  privacyEmail: string;
  legalEmail: string;
  workingHoursAr: string;
  workingHoursEn: string;
  headquartersAr: string;
  headquartersEn: string;
  playStoreUrl: string;
  appStoreUrl: string;
  socialLinks: Record<string, string>;
  updatedAt?: string | null;
}

export interface HomepageContentData {
  hero: {
    titleAr: string;
    subtitleAr: string;
    backgroundImageUrl: string;
    stats: Array<{
      value: string;
      labelAr: string;
      color?: string;
    }>;
  };
  whyMsari: {
    sectionTitleAr: string;
    badgeAr?: string;
    partnerCta: {
      titleAr: string;
      buttonTextAr?: string;
      href?: string;
    };
  };
  appDownload: {
    titleAr: string;
    subtitleAr: string;
    playStoreUrl: string;
    appStoreUrl: string;
  };
  updatedAt?: string | null;
}

export interface AboutPageData {
  type: 'content_page';
  slug: 'about';
  title: string;
  titleEn: string;
  lastUpdatedText: string;
  status: 'draft' | 'published' | 'archived';
  isPublished: boolean;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  stats: Array<{
    value: string;
    label: string;
  }>;
  story: {
    badge: string;
    title: string;
    paragraphs: string[];
    image: string;
    locationText: string;
  };
  values: Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
  team: Array<{
    name: string;
    role: string;
    emoji: string;
  }>;
}

export interface LegalPageData {
  type: 'legal_page';
  slug: 'privacy' | 'terms';
  title: string;
  titleEn: string;
  lastUpdatedText: string;
  status: 'draft' | 'published' | 'archived';
  isPublished: boolean;
  intro?: string;
  sections: Array<{
    id: string;
    title: string;
    content: string[];
  }>;
}

export interface DevelopersPageData {
  type: 'developers_page';
  slug: 'developers';
  title: string;
  titleEn: string;
  status: 'draft' | 'published' | 'archived';
  isPublished: boolean;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  features: Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
  plans: Array<{
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
  }>;
  faq: Array<{
    q: string;
    a: string;
  }>;
}

export interface LandmarkData {
  id: string;
  name: string;
  nameEn: string;
  category: 'تاريخي' | 'طبيعي' | 'معماري' | 'ثقافي' | 'ترفيهي' | string;
  image: string;
  description: string;
  locationText: string;
}

export interface DestinationEditorialData {
  slug: string;
  cityId: string;
  tagline: string;
  taglineEn?: string;
  heroImage: string;
  overview: {
    history: string;
    climate: string;
    culture: string;
    bestTimeToVisit: string;
  };
  landmarks: LandmarkData[];
  status: 'draft' | 'published' | 'archived';
  isPublished: boolean;
  updatedAt?: string | null;
}
