'use client';

import { useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * LocaleTemplate — page-transition wrapper + navigation polish.
 *
 * 1. Enter animation (.animate-page-enter): soft slow pop-in, CSS-only.
 * 2. `_rsc` cleanup (PROVEN 2026-09-30): strips a stuck flight-token after
 *    navigation completes (replaceState, no history/scroll side effects).
 * 3. Guaranteed top-open: the wrapper stays invisible (opacity-0) until —
 *    synchronously before paint — scroll is forced to top AND one frame is
 *    painted. Only then does the pop-in play. This eliminates the
 *    bottom-flash-then-yank entirely: the first visible frame IS the top.
 */
export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Runs synchronously BEFORE paint on every navigation (template remounts).
  useLayoutEffect(() => {
    setReady(false);
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
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    } catch {
      // Never break rendering over scrolling.
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    // Safety net (e.g. background tab throttling rAF): never trap content.
    const fallback = setTimeout(() => setReady(true), 400);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(fallback);
    };
  }, [pathname]);

  return (
    <div className={ready ? 'animate-page-enter' : 'opacity-0'}>{children}</div>
  );
}
