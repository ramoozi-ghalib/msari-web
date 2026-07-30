'use server';

import { z } from 'zod';
import { randomBytes } from 'crypto';
import { adminGuard } from '@/lib/action-guard';

const createKeySchema = z.object({
  name: z.string().min(3, 'اسم الوكالة مطلوب'),
  plan: z.string().min(1, 'الخطة مطلوبة'),
});

export type ApiKeyCreateState = {
  message: string;
  newKey?: {
    id: string;
    name: string;
    keyString: string;
    createdAt: string;
    expiresAt: string;
    plan: string;
    status: 'active';
    requestsUsage: number;
  };
  errors?: z.ZodIssue[];
};

export async function createApiKey(
  prevState: ApiKeyCreateState,
  formData: FormData
): Promise<ApiKeyCreateState> {
  // ── SECURITY: Auth check must be the first operation ──────────────────────
  const guard = await adminGuard();
  if (!guard.ok) {
    return { message: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  const validatedFields = createKeySchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'فشلت العملية. يرجى مراجعة الحقول.',
      errors: validatedFields.error.issues,
    };
  }

  const { name, plan } = validatedFields.data;

  // Generate a cryptographically secure API key string
  const key = `msari_live_${randomBytes(16).toString('hex')}`;

  // TODO: Save the hashed key to the database (not the plaintext key itself)
  // await prisma.apiKey.create({ data: { name, plan, hashedKey: await hash(key) } });

  const newKeyObject = {
    id: `key_${Date.now()}`,
    name,
    keyString: key,
    createdAt: new Date().toISOString().split('T')[0],
    expiresAt: '2026-12-31',
    plan,
    status: 'active' as const,
    requestsUsage: 0,
  };

  return {
    message: 'تم إنشاء المفتاح بنجاح! يرجى نسخه الآن.',
    newKey: newKeyObject,
  };
}