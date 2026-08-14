'use server';

/**
 * src/actions/cms-homepage.ts
 *
 * Authenticated Server Action for Updating Homepage Content.
 * Flow: Request -> Auth & Permission Check -> Zod Validation -> Firestore Write -> Cache Invalidation.
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { adminGuard } from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { CmsClient } from '@/services/cms/cms.client';
import { HomepageContentSchema, type HomepageContentFormValues } from '@/schemas/cms-homepage.schema';

export interface CmsActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export async function updateHomepageContent(
  rawData: unknown
): Promise<CmsActionResult<HomepageContentFormValues>> {
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
  const validationResult = HomepageContentSchema.safeParse(rawData);
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
    hero: {
      titleAr: validData.hero.titleAr.trim(),
      subtitleAr: validData.hero.subtitleAr.trim(),
      backgroundImageUrl: validData.hero.backgroundImageUrl?.trim() || '/images/hero-bg.jpg',
    },
    whyMsari: {
      badgeAr: validData.whyMsari.badgeAr.trim(),
      sectionTitleAr: validData.whyMsari.sectionTitleAr.trim(),
      partnerCta: {
        titleAr: validData.whyMsari.partnerCta.titleAr.trim(),
        buttonTextAr: validData.whyMsari.partnerCta.buttonTextAr.trim(),
        href: validData.whyMsari.partnerCta.href.trim(),
      },
    },
    appDownload: {
      titleAr: validData.appDownload.titleAr.trim(),
      subtitleAr: validData.appDownload.subtitleAr.trim(),
      // store URLs are excluded intentionally as per Source-of-Truth rule
    },
    updatedAt: new Date().toISOString(),
    updatedBy: guard.user.email || guard.user.id || 'admin',
  };

  // ── Step 4: Atomic Firestore Merge Write ─────────────────────────────────
  const writeSuccess = await CmsClient.setDoc('website_homepage', 'main', payload, {
    merge: true,
  });

  if (!writeSuccess) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'تعذر حفظ البيانات في قاعدة البيانات، يرجى التحقق من اتصال الخادم والمحاولة مجدداً.',
      },
    };
  }

  // ── Step 5: Cache Invalidation (Only on Verified Write Success) ──────────
  try {
    (revalidateTag as any)('cms:homepage');
    (revalidatePath as any)('/', 'layout');
  } catch (cacheError) {
    console.warn('[updateHomepageContent] Cache revalidation notice:', cacheError);
  }

  return {
    success: true,
    data: validData,
  };
}
