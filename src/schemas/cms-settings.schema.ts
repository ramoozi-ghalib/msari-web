/**
 * src/schemas/cms-settings.schema.ts
 *
 * Strict Zod validation schema for Website Settings (website_settings/general).
 */

import { z } from 'zod';

export const WebsiteSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .min(5, 'رقم الواتساب مطلوب')
    .regex(/^[\d+\s-]+$/, 'رقم الواتساب يجب أن يحتوي على أرقام ورمز الدولة فقط'),
  supportPhone: z
    .string()
    .min(5, 'رقم هاتف الدعم مطلوب'),
  infoEmail: z
    .string()
    .email('البريد الإلكتروني العام غير صالح'),
  privacyEmail: z
    .string()
    .email('بريد الخصوصية غير صالح'),
  legalEmail: z
    .string()
    .email('البريد القانوني غير صالح'),
  workingHoursAr: z
    .string()
    .min(2, 'ساعات العمل باللغة العربية مطلوبة'),
  workingHoursEn: z
    .string()
    .optional()
    .default('Daily 8 AM — 10 PM'),
  headquartersAr: z
    .string()
    .min(2, 'عنوان المقر الرئيسي بالعربية مطلوب'),
  headquartersEn: z
    .string()
    .optional()
    .default("Sana'a & Aden — Yemen"),
  playStoreUrl: z
    .string()
    .url('رابط Google Play يجب أن يكون رابط URL صحيح'),
  appStoreUrl: z
    .string()
    .url('رابط App Store يجب أن يكون رابط URL صحيح'),
  socialLinks: z
    .record(z.string())
    .optional()
    .default({}),
});

export type WebsiteSettingsFormValues = z.infer<typeof WebsiteSettingsSchema>;
