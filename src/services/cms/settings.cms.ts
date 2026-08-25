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
  footerDescriptionAr: 'منصة السفر الأولى في اليمن — نوفر لك أفضل خيارات الإقامة والطيران وخدمات النقل بأمان وموثوقية.',
  footerDescriptionEn: "Yemen's #1 Travel Platform — providing premium hotel bookings, flights, and transportation.",
  copyrightTextAr: 'جميع الحقوق محفوظة لـ شركة مساري للخدمات السياحية.',
  copyrightTextEn: 'All rights reserved to Msari Tourism Services Company.',
  socialLinks: {
    facebook: 'https://facebook.com/msariapp',
    instagram: 'https://instagram.com/msariapp',
    twitter: 'https://twitter.com/msariapp',
    linkedin: 'https://linkedin.com/company/msariapp',
  },
  contactFaqs: [
    { q: 'كيف يمكنني تأكيد حجزي؟', a: 'بعد إتمام الحجز، ستظهر لك صفحة تأكيد وستصلك رسالة واتساب تحتوي على تفاصيل حجزك كاملة.' },
    { q: 'هل يمكنني إلغاء أو تعديل الحجز؟', a: 'نعم، يمكنك التواصل معنا عبر واتساب وسنقوم بمساعدتك في الإلغاء أو التعديل خلال 24 ساعة.' },
    { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل الحوالات البنكية، الدفع عند الوصول، والدفع عبر واتساب. وجاري تفعيل الدفع الإلكتروني قريباً.' },
    { q: 'هل تشملون فنادق خارج اليمن؟', a: 'نعم، لدينا قسم مخصص للفنادق العالمية يمكنك تصفحه والتواصل معنا للحجز المباشر.' },
  ],
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
    footerDescriptionAr: data.footerDescriptionAr || FALLBACK_SETTINGS.footerDescriptionAr,
    footerDescriptionEn: data.footerDescriptionEn || FALLBACK_SETTINGS.footerDescriptionEn,
    copyrightTextAr: data.copyrightTextAr || FALLBACK_SETTINGS.copyrightTextAr,
    copyrightTextEn: data.copyrightTextEn || FALLBACK_SETTINGS.copyrightTextEn,
    socialLinks: data.socialLinks || FALLBACK_SETTINGS.socialLinks,
    contactFaqs: Array.isArray(data.contactFaqs) && data.contactFaqs.length > 0 ? data.contactFaqs : FALLBACK_SETTINGS.contactFaqs,
    updatedAt: data.updatedAt ? String(data.updatedAt) : null,
  };
}

const CMS_REVALIDATE = process.env.NODE_ENV === 'development' ? 1 : 10;

export class SettingsCmsService {
  /**
   * Cached getter for website settings (Tagged cache: 'cms:settings').
   */
  static getSettings = unstable_cache(
    fetchSettingsInternal,
    ['website_settings_general'],
    { revalidate: CMS_REVALIDATE, tags: ['cms:settings'] }
  );
}
