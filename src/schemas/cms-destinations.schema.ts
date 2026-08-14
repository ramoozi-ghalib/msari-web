import { z } from 'zod';

const LandmarkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'اسم المعلم مطلوب'),
  nameEn: z.string().optional().default(''),
  category: z.string().min(2, 'التصنيف مطلوب'),
  image: z.string().optional().default(''),
  description: z.string().min(5, 'وصف المعلم مطلوب'),
  locationText: z.string().optional().default(''),
});

export const DestinationEditorialSchema = z.object({
  tagline: z.string().min(5, 'الوصف المختصر مطلوب'),
  taglineEn: z.string().optional().default(''),
  heroImage: z.string().url('رابط الصورة يجب أن يكون URL صالح').or(z.string().length(0)),
  overview: z.object({
    history: z.string().min(10, 'نبذة تاريخية مطلوبة'),
    climate: z.string().min(5, 'معلومات المناخ مطلوبة'),
    culture: z.string().min(5, 'معلومات الثقافة مطلوبة'),
    bestTimeToVisit: z.string().min(5, 'أفضل وقت للزيارة مطلوب'),
  }),
  landmarks: z.array(LandmarkSchema).min(0),
});

export type DestinationEditorialFormValues = z.infer<typeof DestinationEditorialSchema>;
