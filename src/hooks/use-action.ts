'use client';

import { useState, useTransition } from 'react';
import type { ActionResponse } from '@/types/action.types';

type ActionFunction<TArgs extends any[], TData> = (...args: TArgs) => Promise<ActionResponse<TData>>;

interface UseActionOptions<TData> {
  /** Triggered when the action succeeds */
  onSuccess?: (data?: TData) => void;
  /** Triggered on any server rejection */
  onError?: (error: { code: string; message: string }) => void;
  /** Triggered specifically when Zod validation fails, providing granular field issues */
  onValidationError?: (fieldErrors: Record<string, string[] | undefined>) => void;
  /** Triggered when session is invalid or expired */
  onUnauthorized?: () => void;
}

export function useAction<TArgs extends any[], TData>(
  action: ActionFunction<TArgs, TData>,
  options?: UseActionOptions<TData>
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  const execute = (...args: TArgs) => {
    // Reset state before execution
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const result = await action(...args);

        if (!result.success) {
          setError(result.error);
          
          // Granular Validation Handling
          if (result.error.code === 'VALIDATION_ERROR' && result.error.fieldErrors) {
            setFieldErrors(result.error.fieldErrors);
            options?.onValidationError?.(result.error.fieldErrors);
          } 
          // Auth Rejection Routing Handle
          else if (result.error.code === 'UNAUTHORIZED') {
            options?.onUnauthorized?.();
          }
          
          // General Hook Catch-all
          options?.onError?.(result.error);
          return;
        }

        options?.onSuccess?.(result.data);
      } catch (err) {
        // Fallback for extreme crashes (e.g., Network failure, Vercel panics)
        const catastrophicError = { code: 'NETWORK_ERROR', message: 'حدث خطأ في الاتصال بالخادم.' };
        setError(catastrophicError);
        options?.onError?.(catastrophicError);
      }
    });
  };

  const resetState = () => {
    setError(null);
    setFieldErrors({});
  };

  return { execute, isPending, error, fieldErrors, resetState };
}
