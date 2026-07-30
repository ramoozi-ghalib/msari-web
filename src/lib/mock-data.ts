/**
 * mock-data.ts — ملف البيانات الوهمية
 *
 * [FIX C-1] تم إفراغ هذا الملف من جميع البيانات الوهمية.
 *
 * البيانات الحقيقية تُجلَب من قاعدة البيانات عبر:
 *  - getLocalHotels()  → src/actions/hotels.ts
 *  - getActiveCities() → src/actions/cities.ts
 *  - getOffers()       → src/actions/offers.ts
 *
 * إذا كنت بحاجة لبيانات اختبارية، استخدم prisma/seed.ts
 *
 * @deprecated هذا الملف قيد الإزالة الكاملة. لا تستورد منه.
 */

export const mockHotels  = [] as const;
export const mockCities  = [] as const;
export const mockOffers  = [] as const;
