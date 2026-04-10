import { z } from 'zod';

// ─── Reusable Base Fields ───────────────────────────────────────────────────

// IDs are cuid strings. We allow standard min/max lengths for safety.
const CuidSchema = z.string().cuid('المعرف غير صالح');

// Arrays
const AmenitiesSchema = z.array(CuidSchema).max(50, 'الحد الأقصى للمرافق هو 50').optional();
const ImagesSchema = z.array(z.string().url('عنوان الصورة غير صالح').max(1024)).max(20, 'الحد الأقصى للصور هو 20').optional();

// Default short and long strings to prevent gigantic payload abuse
const ShortString = z.string().min(2, 'يجب أن يحتوي على أكثر من حرفين').max(191, 'النص طويل جداً').trim();
const LongString = z.string().max(10000, 'الوصف يتجاوز الحد الأقصى (10000 حرف)').trim();

// ─── Hotels Schemas ─────────────────────────────────────────────────────────

export const CreateHotelSchema = z.object({
  nameAr: ShortString,
  nameEn: ShortString,
  address: ShortString,
  mapUrl: z.string().url('رابط غير صالح').max(1024).optional().or(z.literal('')),
  descriptionAr: LongString,
  stars: z.number().int().min(1, 'يبدأ من 1').max(5, 'أقصى حد هو 5 نجمات'),
  priceFrom: z.number().min(0, 'السعر يجب أن يكون موجباً').max(1000000, 'السعر غير منطقي'),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  cityId: CuidSchema,
  policyAr: LongString.optional(),
  policyEn: LongString.optional(),
  amenities: AmenitiesSchema,
  images: ImagesSchema,
}).strict(); // 🔒 مسامير ضد الـ Mass Assignment: أي حقل غير مسجل سيُرفض

export const UpdateHotelSchema = z.object({
  id: CuidSchema,
  data: CreateHotelSchema.partial(), // كل حقول الإنشاء هنا تصبح اختيارية
}).strict();

export const SetHotelDiscountSchema = z.object({
  hotelId: CuidSchema,
  percentage: z.number().int().min(0, 'نسبة غير صالحة').max(100, 'الحد الأعلى 100%'),
}).strict();

export const DeleteHotelSchema = z.object({
  id: CuidSchema,
}).strict();

// ─── Rooms Schemas ──────────────────────────────────────────────────────────

export const UpsertRoomSchema = z.object({
  hotelId: CuidSchema,
  roomData: z.object({
    id: z.string().max(191).optional(), // قد يحتوي على 'new-' للواجهة الأمامية
    nameAr: ShortString,
    nameEn: ShortString,
    descriptionAr: LongString.optional(),
    capacity: z.number().int().min(1, 'سعة الغرفة يجب أن تكون شخص واحد على الأقل').max(50, 'سعة غير منطقية للغرفة'),
    pricePerNight: z.number().min(0).max(1000000),
    isAvailable: z.boolean(),
    amenities: AmenitiesSchema,
    images: ImagesSchema,
  }).strict(),
}).strict();

export const DeleteRoomSchema = z.object({
  id: CuidSchema,
}).strict();

// ─── Cities Schemas ─────────────────────────────────────────────────────────

export const CreateCitySchema = z.object({
  nameAr: ShortString,
  nameEn: ShortString,
  governorateAr: ShortString,
  governorateEn: ShortString,
  imageUrl: z.string().url().max(1024).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
}).strict();

export const UpdateCitySchema = z.object({
  id: CuidSchema,
  data: CreateCitySchema.partial(),
}).strict();

export const DeleteCitySchema = z.object({
  id: CuidSchema,
}).strict();

// ─── Storage Schemas ────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const GetUploadUrlSchema = z.object({
  fileName: ShortString,
  fileSize: z.number().max(MAX_FILE_SIZE_BYTES, 'حجم الملف يتجاوز الحد الأقصى (5 ميغابايت)'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'نوع الملف غير مدعوم. المسموح: JPG, PNG, WebP فقط' }),
  }),
  bucket: z.enum(['hotels', 'rooms', 'destinations'], {
    errorMap: () => ({ message: 'المستودع غير مسموح به' }),
  }),
}).strict();
