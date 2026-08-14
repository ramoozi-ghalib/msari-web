/**
 * src/schemas/cms-homepage.schema.ts
 *
 * Strict Zod validation schema for Homepage Content (website_homepage/main).
 */

import { z } from 'zod';

export const HomepageContentSchema = z.object({
  hero: z.object({
    titleAr: z.string().min(5, 'العنوان الرئيسي مطلوب ويجب أن يكون 5 أحرف على الأقل'),
    subtitleAr: z.string().min(5, 'النص الفرعي مطلوب ويجب أن يكون 5 أحرف على الأقل'),
    backgroundImageUrl: z.string().optional().default('/images/hero-bg.jpg'),
  }),
  whyMsari: z.object({
    badgeAr: z.string().min(2, 'الوسام مطلوب'),
    sectionTitleAr: z.string().min(3, 'عنوان القسم مطلوب'),
    partnerCta: z.object({
      titleAr: z.string().min(5, 'عنوان الدعوة مطلوب'),
      buttonTextAr: z.string().min(2, 'نص الزر مطلوب'),
      href: z.string().min(1, 'الرابط مطلوب'),
    }),
  }),
  appDownload: z.object({
    titleAr: z.string().min(3, 'عنوان قسم التطبيق مطلوب'),
    subtitleAr: z.string().min(5, 'النص الفرعي لقسم التطبيق مطلوب'),
  }),
});

export type HomepageContentFormValues = z.infer<typeof HomepageContentSchema>;
