'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const isSecureContextForSw =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecureContextForSw) {
      return;
    }

    let registrationRef: ServiceWorkerRegistration | null = null;
    let refreshing = false;
    const hadController = Boolean(navigator.serviceWorker.controller);

    const handleControllerChange = () => {
      if (!hadController || refreshing) {
        return;
      }
      refreshing = true;
      window.location.reload();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && registrationRef) {
        registrationRef.update().catch(() => {});
      }
    };

    const handleUpdateFound = () => {
      const installingWorker = registrationRef?.installing;
      if (!installingWorker) {
        return;
      }

      installingWorker.addEventListener('statechange', () => {
        if (
          installingWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          installingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        registrationRef = registration;
        registration.addEventListener('updatefound', handleUpdateFound);

        if (registration.waiting && navigator.serviceWorker.controller) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (registrationRef) {
        registrationRef.removeEventListener('updatefound', handleUpdateFound);
      }
    };
  }, []);

  return null;
}

export default ServiceWorkerRegister;
