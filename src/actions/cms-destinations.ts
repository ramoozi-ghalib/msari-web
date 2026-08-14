'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { adminGuard } from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { CmsClient } from '@/services/cms/cms.client';
import { DestinationEditorialSchema, type DestinationEditorialFormValues } from '@/schemas/cms-destinations.schema';
export interface CmsActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export async function updateDestinationEditorial(
  slug: string,
  rawData: unknown
): Promise<CmsActionResult<DestinationEditorialFormValues>> {
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

  if (!slug || slug.trim() === '') {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'رابط الوجهة مطلوب',
      },
    };
  }
  const cleanSlug = slug.trim().toLowerCase();

  const validationResult = DestinationEditorialSchema.safeParse(rawData);
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

  const payload = {
    ...validData,
    slug: cleanSlug,
    cityId: cleanSlug,
    status: 'published',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    updatedBy: guard.user.email || guard.user.id || 'admin',
  };

  const writeSuccess = await CmsClient.setDoc('website_destinations', cleanSlug, payload, {
    merge: true,
  });

  if (!writeSuccess) {
    return {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'تعذر حفظ البيانات، يرجى المحاولة لاحقاً',
      },
    };
  }

  try {
    (revalidateTag as any)('cms:destinations');
    (revalidateTag as any)(`cms:dest:${cleanSlug}`);
    (revalidatePath as any)('/', 'layout');
  } catch (cacheError) {
    console.warn('[updateDestinationEditorial] Cache revalidation notice:', cacheError);
  }

  return {
    success: true,
    data: validData,
  };
}
