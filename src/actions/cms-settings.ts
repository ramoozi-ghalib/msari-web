'use server';

/**
 * src/actions/cms-settings.ts
 *
 * Authenticated Server Action for Updating Website General Settings.
 * Flow: Request -> Auth & Permission Check -> Zod Validation -> Firestore Write -> Cache Invalidation.
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { adminGuard } from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { CmsClient } from '@/services/cms/cms.client';
import { WebsiteSettingsSchema, type WebsiteSettingsFormValues } from '@/schemas/cms-settings.schema';

export interface CmsActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export async function updateWebsiteSettings(
  rawData: unknown
): Promise<CmsActionResult<WebsiteSettingsFormValues>> {
  // ── Step 1: Authentication & Authorization Guard ─────────────────────────
  const guard = await adminGuard(Policies.canAccessAdmin);
  if (!guard.ok) {
    return {
      success: false,
      error: {
        code: guard.error.error.code,
        message: guard.error.error.message,
      },
    };
  }

  // ── Step 2: Server-Side Validation with Zod ──────────────────────────────
  const validationResult = WebsiteSettingsSchema.safeParse(rawData);
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    const firstErrorMessage = validationResult.error.issues[0]?.message || 'بيانات غير صالحة';

    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstErrorMessage,
        fieldErrors,
      },
    };
  }

  const validData = validationResult.data;

  // ── Step 3: Format & Prepare Payload for Firestore ──────────────────────
  const payload = {
    whatsappNumber: validData.whatsappNumber.replace(/\D/g, ''),
    supportPhone: validData.supportPhone.trim(),
    infoEmail: validData.infoEmail.trim().toLowerCase(),
    privacyEmail: validData.privacyEmail.trim().toLowerCase(),
    legalEmail: validData.legalEmail.trim().toLowerCase(),
    workingHoursAr: validData.workingHoursAr.trim(),
    workingHoursEn: validData.workingHoursEn?.trim() || 'Daily 8 AM — 10 PM',
    headquartersAr: validData.headquartersAr.trim(),
    headquartersEn: validData.headquartersEn?.trim() || "Sana'a & Aden — Yemen",
    playStoreUrl: validData.playStoreUrl.trim(),
    appStoreUrl: validData.appStoreUrl.trim(),
    socialLinks: validData.socialLinks || {},
    updatedAt: new Date().toISOString(),
    updatedBy: guard.user.email || guard.user.id || 'admin',
  };

  // ── Step 4: Atomic Firestore Merge Write ─────────────────────────────────
  const writeSuccess = await CmsClient.setDoc('website_settings', 'general', payload, {
    merge: true,
  });

  if (!writeSuccess) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'تعذر حفظ الإعدادات في قاعدة البيانات، يرجى التحقق من اتصال الخادم والمحاولة مجدداً.',
      },
    };
  }

  // ── Step 5: Cache Invalidation (Only on Verified Write Success) ──────────
  try {
    (revalidateTag as any)('cms:settings');
    (revalidatePath as any)('/', 'layout');
  } catch (cacheError) {
    console.warn('[updateWebsiteSettings] Cache revalidation notice:', cacheError);
  }

  return {
    success: true,
    data: validData,
  };
}
