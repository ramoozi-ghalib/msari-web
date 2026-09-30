'use client';

import { useEffect } from 'react';

/**
 * LocaleTemplate — page-transition wrapper + flight-param cleanup.
 *
 * 1. Enter animation: Next re-mounts templates on every navigation, so each
 *    incoming page automatically plays .animate-page-enter (CSS-only).
 * 2. `_rsc` cleanup (PROVEN 2026-09-30): RSC flight requests can answer 307
 *    to the same URL, and in some flows (refresh mid-navigation, proxy
 *    normalization) the `_rsc` token sticks in the address bar AFTER the
 *    page fully loads. The server ignores it and canonicals are clean, so it
 *    is safe to strip here: this effect runs only on template (re)mount,
 *    i.e. after a navigation has completed — never mid-flight — and uses
 *    replaceState (no history entry, no scroll jump).
 */
export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('_rsc')) {
        url.searchParams.delete('_rsc');
        const clean =
          url.pathname +
          (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') +
          url.hash;
        window.history.replaceState(null, '', clean);
      }
    } catch {
      // Never break rendering over URL cosmetics.
    }
  }, []);

  return <div className="animate-page-enter">{children}</div>;
}
