'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { getSafeRedirect } from '@/lib/safeRedirect';

interface GoogleSignInButtonProps {
  locale?: string;
  redirectTo?: string;
  label?: string;
  disabled?: boolean;
}

export default function GoogleSignInButton({
  locale = 'ar',
  redirectTo = '/',
  label,
  disabled = false,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const isEn = locale === 'en';
  const safeLocale = isEn ? 'en' : 'ar';
  const safeRedirect = getSafeRedirect(redirectTo);

  const buttonText =
    label || (isEn ? 'Continue with Google' : 'المتابعة باستخدام Google');
  const loadingText = isEn ? 'Connecting to Google...' : 'جارٍ التحويل إلى Google...';
  const dividerText = isEn ? 'or' : 'أو';

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const callbackUrl = `/${safeLocale}/auth/post-oauth?redirect=${encodeURIComponent(safeRedirect)}`;
      await signIn('google', { callbackUrl });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5">
      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-neutral-200/80" />
        <span className="bg-white px-3 text-xs font-bold text-neutral-400 shrink-0">
          {dividerText}
        </span>
        <div className="w-full border-t border-neutral-200/80" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || disabled}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-[0.99] px-4 py-3 text-sm font-bold text-neutral-800 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <span className="h-5 w-5 rounded-full border-2 border-neutral-300 border-t-[var(--brand-primary)] animate-spin shrink-0" />
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0"
          >
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
        )}
        <span>{loading ? loadingText : buttonText}</span>
      </button>
    </div>
  );
}
