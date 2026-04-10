/**
 * action-utils.ts — Shared utilities for strict Server actions
 */

/**
 * clampLimit: Bounds a limit parameter to prevent runaway queries and memory exhaustion.
 * @param value The raw input limit (usually from an action parameter)
 * @param defaultValue Fallback if missing or invalid (default: 10)
 * @param max The absolute ceiling allowed (default: 100)
 */
export function clampLimit(value: unknown, defaultValue = 10, max = 100): number {
  if (value === undefined || value === null) return defaultValue;
  const num = Number(value);
  if (isNaN(num) || num <= 0) return defaultValue;
  return Math.max(1, Math.min(num, max));
}

import { z } from 'zod';

import type { ActionResponse } from '@/types/action.types';

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  rawData: unknown
): ActionResponse<T> {
  const result = schema.safeParse(rawData);
  if (!result.success) {
    const errorDetails = result.error.flatten();
    console.warn('[Validation Error]', errorDetails);
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات غير صالحة',
        fieldErrors: errorDetails.fieldErrors,
      },
    };
  }
  return { success: true, data: result.data };
}

