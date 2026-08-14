'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { adminGuard } from '@/lib/action-guard';
import { Policies } from '@/lib/policies';
import { CmsClient } from '@/services/cms/cms.client';
import { AboutPageSchema, LegalPageSchema, DevelopersPageSchema } from '@/schemas/cms-pages.schema';

export type CmsActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; fieldErrors?: Record<string, string[]> };
};

export async function updateAboutPage(rawData: unknown): Promise<CmsActionResult> {
  const guard = await adminGuard(Policies.canAccessAdmin);
  if (!guard.ok) {
    return { success: false, error: { code: guard.error.error.code, message: guard.error.error.message } };
  }

  const parseResult = AboutPageSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات النموذج غير صالحة',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      },
    };
  }

  const payload = {
    ...parseResult.data,
    type: 'content_page',
    slug: 'about',
    status: 'published',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    updatedBy: guard.user.email || guard.user.id || 'admin',
  };

  const writeSuccess = await CmsClient.setDoc('website_pages', 'about', payload, { merge: true });
  if (!writeSuccess) {
    return { success: false, error: { code: 'DATABASE_ERROR', message: 'تعذر حفظ الصفحة في قاعدة البيانات.' } };
  }

  try {
    (revalidateTag as any)('cms:pages');
    (revalidateTag as any)('cms:page:about');
    (revalidatePath as any)('/', 'layout');
  } catch (cacheError) {
    console.warn('[updateAboutPage] Cache revalidation notice:', cacheError);
  }

  return { success: true, data: payload };
}

export async function updateLegalPage(slug: 'privacy' | 'terms', rawData: unknown): Promise<CmsActionResult> {
  const guard = await adminGuard(Policies.canAccessAdmin);
  if (!guard.ok) {
    return { success: false, error: { code: guard.error.error.code, message: guard.error.error.message } };
  }

  const parseResult = LegalPageSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات النموذج غير صالحة',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      },
    };
  }

  const payload = {
    ...parseResult.data,
    type: 'legal_page',
    slug,
    status: 'published',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    updatedBy: guard.user.email || guard.user.id || 'admin',
  };

  const writeSuccess = await CmsClient.setDoc('website_pages', slug, payload, { merge: true });
  if (!writeSuccess) {
    return { success: false, error: { code: 'DATABASE_ERROR', message: 'تعذر حفظ الصفحة في قاعدة البيانات.' } };
  }

  try {
    (revalidateTag as any)('cms:pages');
    (revalidateTag as any)(`cms:page:${slug}`);
    (revalidatePath as any)('/', 'layout');
  } catch (cacheError) {
    console.warn('[updateLegalPage] Cache revalidation notice:', cacheError);
  }

  return { success: true, data: payload };
}

export async function updateDevelopersPage(rawData: unknown): Promise<CmsActionResult> {
  const guard = await adminGuard(Policies.canAccessAdmin);
  if (!guard.ok) {
    return { success: false, error: { code: guard.error.error.code, message: guard.error.error.message } };
  }

  const parseResult = DevelopersPageSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات النموذج غير صالحة',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      },
    };
  }

  const payload = {
    ...parseResult.data,
    type: 'developers_page',
    slug: 'developers',
    status: 'published',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    updatedBy: guard.user.email || guard.user.id || 'admin',
  };

  const writeSuccess = await CmsClient.setDoc('website_pages', 'developers', payload, { merge: true });
  if (!writeSuccess) {
    return { success: false, error: { code: 'DATABASE_ERROR', message: 'تعذر حفظ الصفحة في قاعدة البيانات.' } };
  }

  try {
    (revalidateTag as any)('cms:pages');
    (revalidateTag as any)('cms:page:developers');
    (revalidatePath as any)('/', 'layout');
  } catch (cacheError) {
    console.warn('[updateDevelopersPage] Cache revalidation notice:', cacheError);
  }

  return { success: true, data: payload };
}
