/**
 * src/services/cms/types.ts
 *
 * Unified TypeScript Contracts for Website Management Domain (CMS).
 */

export interface ContactFaqItem {
  q: string;
  a: string;
}

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
  footerDescriptionAr: string;
  footerDescriptionEn?: string;
  copyrightTextAr: string;
  copyrightTextEn?: string;
  socialLinks: Record<string, string>;
  contactFaqs: ContactFaqItem[];
  updatedAt?: string | null;
}

export interface HomepageFeatureItem {
  title?: string;
  titleAr?: string;
  titleEn?: string;
  desc?: string;
  descAr?: string;
  descEn?: string;
  icon?: string;
  color?: string;
}


export interface HomepageContentData {
  hero: {
    badgeAr?: string;
    badgeEn?: string;
    titleAr: string;
    titleEn?: string;
    subtitleAr: string;
    subtitleEn?: string;
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
    features: HomepageFeatureItem[];
    partnerCta: {
      badgeAr?: string;
      titleAr: string;
      descriptionAr?: string;
      buttonTextAr?: string;
      href?: string;
    };
  };
  appDownload: {
    badgeAr?: string;
    titleAr: string;
    subtitleAr: string;
    mockupImageUrl?: string;
    samsungScreenImageUrl?: string;
    iphoneScreenImageUrl?: string;
    qrImageUrl?: string;
    playStoreUrl: string;
    appStoreUrl: string;
  };
  socialFollow?: {
    isVisible?: boolean;
    titleAr?: string;
    subtitleAr?: string;
    whatsappUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    xUrl?: string;
    telegramUrl?: string;
  };
  seo?: {
    metaTitleAr?: string;
    metaDescAr?: string;
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
    satisfiedClientsCount?: string;
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
  cta?: {
    title: string;
    subtitle: string;
    buttonText: string;
    link: string;
  };
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

export interface AppPageData {
  slug: 'app';
  title: string;
  titleEn: string;
  isPublished: boolean;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    downloads: string;
    rating: string;
    mockupImage1?: string;
    mockupImage2?: string;
  };
  stats: Array<{ value: string; label: string }>;
  features: Array<{ title: string; desc: string; icon: string; badge?: string; color?: string }>;
  screensShowcase: Array<{ id: number; title: string; headline: string; subtitle: string; image: string; icon?: string }>;
  howItWorks: Array<{ step: string; title: string; desc: string }>;
  cta: { title: string; subtitle: string };
}

export interface CarsPageData {
  slug: 'cars';
  title: string;
  titleEn: string;
  isPublished: boolean;
  hero: {
    badge?: string;
    title: string;
    subtitle: string;
    bgImage?: string;
  };
  fleet: Array<{ id?: string; nameAr?: string; nameEn?: string; tag: string; desc: string; cap: number; bags: number; price: number; img: string }>;
  features: Array<{ title: string; desc: string; icon: string }>;
}

export interface CarsAirportPageData {
  slug: 'cars_airport';
  title: string;
  titleEn: string;
  isPublished: boolean;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bgImage?: string;
  };
  packages: Array<{ name: string; desc: string; passengers: number; price: number; emoji: string }>;
  airports: Array<{ name: string; city: string; code: string; emoji?: string }>;
  features: Array<{ title: string; desc: string; icon: string }>;
}

export interface CarsTransportPageData {
  slug: 'cars_transport';
  title: string;
  titleEn: string;
  isPublished: boolean;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bgImage?: string;
  };
  routes: Array<{ from: string; to: string; duration: string; price: number; popular?: boolean }>;
  features: Array<{ title: string; desc: string; icon: string }>;
}

export interface AddHotelPageData {
  slug: 'add_hotel';
  title: string;
  titleEn: string;
  isPublished: boolean;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  benefits: Array<{ emoji: string; title: string; desc: string }>;
  formHeader?: {
    title: string;
    subtitle: string;
  };
  successState?: {
    title: string;
    desc: string;
    buttonText: string;
  };
}

export interface InternationalHotelsPageData {
  slug: 'international_hotels';
  title: string;
  titleEn: string;
  isPublished: boolean;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bgImage?: string;
  };
  topDestinations: Array<{ city: string; country: string; emoji: string; hotels: number; img: string }>;
  features: Array<{ title: string; desc: string; icon: string }>;
  cta?: {
    title: string;
    subtitle: string;
  };
}

export interface FlightsPageData {
  slug: 'flights';
  title: string;
  titleEn: string;
  isPublished: boolean;
  hero: {
    title: string;
    subtitle: string;
    bgImage?: string;
  };
  features: Array<{ title: string; desc: string; icon: string }>;
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
