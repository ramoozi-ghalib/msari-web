'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * LocaleTemplate — page-transition wrapper + navigation polish.
 *
 * 1. Enter animation: Next re-mounts templates on every navigation, so each
 *    incoming page automatically plays .animate-page-enter (CSS-only).
 * 2. `_rsc` cleanup (PROVEN 2026-09-30): strips a stuck flight-token from the
 *    address bar after navigation completes (replaceState, no history/​scroll
 *    side effects).
 * 3. Scroll reset: every completed navigation opens at the very top
 *    (instant). Next's default top-scroll can be defeated by restoration
 *    edge cases on this stack — this makes "open from top" explicit.
 */
export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // useLayoutEffect (not useEffect): runs synchronously BEFORE the browser
  // paints, so the page never flashes at the previous scroll position —
  // it opens at the very top on the first visible frame.
  useLayoutEffect(() => {
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
    try {
      window.scrollTo(0, 0);
    } catch {
      // Never break rendering over scrolling.
    }
  }, [pathname]);

  return <div className="animate-page-enter">{children}</div>;
}
