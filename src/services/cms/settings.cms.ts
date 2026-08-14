/**
 * src/services/cms/settings.cms.ts
 *
 * CMS Service for Website General Settings (website_settings/general).
 */

import { unstable_cache } from 'next/cache';
import { CmsClient } from './cms.client';
import type { WebsiteSettingsData } from './types';

const FALLBACK_SETTINGS: WebsiteSettingsData = {
  whatsappNumber: '967733644466',
  supportPhone: '+967 733 644 466',
  infoEmail: 'info@msari.net',
  privacyEmail: 'privacy@msari.net',
  legalEmail: 'legal@msari.net',
  workingHoursAr: 'يومياً ٨ ص — ١٠ م',
  workingHoursEn: 'Daily 8 AM — 10 PM',
  headquartersAr: 'صنعاء وعدن — اليمن',
  headquartersEn: "Sana'a & Aden — Yemen",
  playStoreUrl: 'https://play.google.com/store/apps/details?id=net.msari.app',
  appStoreUrl: 'https://apps.apple.com',
  socialLinks: {
    facebook: 'https://facebook.com/msari.travel',
    instagram: 'https://instagram.com/msari.travel',
    twitter: 'https://twitter.com/msari_travel',
  },
  updatedAt: null,
};

async function fetchSettingsInternal(): Promise<WebsiteSettingsData> {
  const data = await CmsClient.getDoc<Partial<WebsiteSettingsData>>('website_settings', 'general');

  if (!data) {
    return FALLBACK_SETTINGS;
  }

  return {
    whatsappNumber: (data.whatsappNumber || FALLBACK_SETTINGS.whatsappNumber).replace(/\D/g, ''),
    supportPhone: data.supportPhone || FALLBACK_SETTINGS.supportPhone,
    infoEmail: data.infoEmail || FALLBACK_SETTINGS.infoEmail,
    privacyEmail: data.privacyEmail || FALLBACK_SETTINGS.privacyEmail,
    legalEmail: data.legalEmail || FALLBACK_SETTINGS.legalEmail,
    workingHoursAr: data.workingHoursAr || FALLBACK_SETTINGS.workingHoursAr,
    workingHoursEn: data.workingHoursEn || FALLBACK_SETTINGS.workingHoursEn,
    headquartersAr: data.headquartersAr || FALLBACK_SETTINGS.headquartersAr,
    headquartersEn: data.headquartersEn || FALLBACK_SETTINGS.headquartersEn,
    playStoreUrl: data.playStoreUrl || FALLBACK_SETTINGS.playStoreUrl,
    appStoreUrl: data.appStoreUrl || FALLBACK_SETTINGS.appStoreUrl,
    socialLinks: data.socialLinks || FALLBACK_SETTINGS.socialLinks,
    updatedAt: data.updatedAt ? String(data.updatedAt) : null,
  };
}

export class SettingsCmsService {
  /**
   * Cached getter for website settings (Tagged cache: 'cms:settings').
   */
  static getSettings = unstable_cache(
    fetchSettingsInternal,
    ['website_settings_general'],
    { revalidate: 3600, tags: ['cms:settings'] }
  );
}
