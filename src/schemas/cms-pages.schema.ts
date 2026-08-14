import { z } from 'zod';

export const AboutPageSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  titleEn: z.string().min(1, 'العنوان بالإنجليزي مطلوب'),
  lastUpdatedText: z.string().min(1, 'تاريخ آخر تحديث مطلوب'),
  hero: z.object({
    badge: z.string().min(1, 'الوسام مطلوب'),
    title: z.string().min(1, 'عنوان الهيرو مطلوب'),
    subtitle: z.string().min(1, 'نص الهيرو الفرعي مطلوب'),
  }),
  stats: z.array(
    z.object({
      value: z.string().min(1, 'القيمة مطلوبة'),
      label: z.string().min(1, 'التسمية مطلوبة'),
    })
  ),
  story: z.object({
    badge: z.string().min(1, 'الوسام مطلوب'),
    title: z.string().min(1, 'عنوان القصة مطلوب'),
    paragraphs: z.array(z.string().min(1, 'الفقرة مطلوبة')),
    image: z.string().url('رابط الصورة غير صالح'),
    locationText: z.string().min(1, 'موقع الشركة مطلوب'),
  }),
  values: z.array(
    z.object({
      icon: z.string().min(1, 'الأيقونة مطلوبة'),
      title: z.string().min(1, 'عنوان القيمة مطلوب'),
      desc: z.string().min(1, 'وصف القيمة مطلوب'),
    })
  ),
  team: z.array(
    z.object({
      name: z.string().min(1, 'الاسم مطلوب'),
      role: z.string().min(1, 'الدور مطلوب'),
      emoji: z.string().min(1, 'الإيموجي مطلوب'),
    })
  ),
});

export const LegalPageSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  titleEn: z.string().min(1, 'العنوان بالإنجليزي مطلوب'),
  lastUpdatedText: z.string().min(1, 'تاريخ آخر تحديث مطلوب'),
  intro: z.string().optional(),
  sections: z.array(
    z.object({
      id: z.string().min(1, 'المعرف مطلوب'),
      title: z.string().min(1, 'عنوان القسم مطلوب'),
      content: z.array(z.string().min(1, 'المحتوى مطلوب')),
    })
  ),
});

export const DevelopersPageSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  titleEn: z.string().min(1, 'العنوان بالإنجليزي مطلوب'),
  hero: z.object({
    badge: z.string().min(1, 'الوسام مطلوب'),
    title: z.string().min(1, 'عنوان الهيرو مطلوب'),
    subtitle: z.string().min(1, 'نص الهيرو الفرعي مطلوب'),
  }),
  features: z.array(
    z.object({
      icon: z.string().min(1, 'الأيقونة مطلوبة'),
      title: z.string().min(1, 'عنوان الميزة مطلوب'),
      desc: z.string().min(1, 'وصف الميزة مطلوب'),
    })
  ),
  plans: z.array(
    z.object({
      id: z.string().min(1, 'المعرف مطلوب'),
      name: z.string().min(1, 'اسم الخطة مطلوب'),
      price: z.string().min(1, 'السعر مطلوب'),
      description: z.string().min(1, 'وصف الخطة مطلوب'),
      features: z.array(z.string().min(1, 'الميزة مطلوبة')),
      popular: z.boolean().optional(),
    })
  ),
  faq: z.array(
    z.object({
      q: z.string().min(1, 'السؤال مطلوب'),
      a: z.string().min(1, 'الإجابة مطلوبة'),
    })
  ),
});

export type AboutPageFormData = z.infer<typeof AboutPageSchema>;
export type LegalPageFormData = z.infer<typeof LegalPageSchema>;
export type DevelopersPageFormData = z.infer<typeof DevelopersPageSchema>;
