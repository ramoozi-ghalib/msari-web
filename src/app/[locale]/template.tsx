'use client';

import { useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * LocaleTemplate — page-transition wrapper + navigation polish.
 *
 * PROVEN 2026-09-30: Next does NOT reliably remount this template on every
 * navigation, so state-based hiding arrives one frame late (bottom flash
 * when coming from mid/low scroll). The `key={pathname}` on <Inner/>
 * FORCES a true remount per route: fresh `ready=false` → first paint is
 * hidden → scroll locked to top pre-paint → pop-in plays from the header.
 */
export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <Inner key={pathname}>{children}</Inner>;
}

function Inner({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  // Runs synchronously BEFORE first paint of every fresh mount.
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
  }, []);

  return (
    <div className={ready ? 'animate-page-enter' : 'opacity-0'}>{children}</div>
  );
}
