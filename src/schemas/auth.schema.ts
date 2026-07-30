/**
 * auth.schema.ts — Zod validation schemas for authentication inputs.
 *
 * These schemas are used in TWO places:
 *  1. Server-side: inside the Auth.js authorize function (security enforcement)
 *  2. Client-side: via React Hook Form resolver (UX feedback — not security)
 *
 * The server-side use is mandatory. The client-side use is optional convenience.
 */
import { z } from 'zod';

// ─── Login ────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string({ required_error: 'البريد الإلكتروني مطلوب' })
    .email('بريد إلكتروني غير صالح')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'كلمة المرور مطلوبة' })
    .min(1, 'كلمة المرور مطلوبة'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Register (future use) ────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z
    .string({ required_error: 'الاسم مطلوب' })
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً')
    .trim(),
  email: z
    .string({ required_error: 'البريد الإلكتروني مطلوب' })
    .email('بريد إلكتروني غير صالح')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'كلمة المرور مطلوبة' })
    .min(10, 'كلمة المرور يجب أن تكون 10 أحرف على الأقل')
    .max(128, 'كلمة المرور طويلة جداً'),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'رقم الهاتف غير صالح')
    .optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
