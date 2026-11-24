const CACHE_NAME = 'msari-pwa-v4';

const PRECACHE_URLS = [
  '/offline.html',
  '/images/logo-icon.png',
];

const BYPASS_EXACT_PATHS = [
  '/sw.js',
  '/manifest.webmanifest',
];

const BYPASS_PREFIXES = [
  '/api/',
  '/_next/webpack-hmr',
];

const BYPASS_ROUTE_SEGMENTS = [
  '/admin',
  '/ar/admin',
  '/en/admin',
  '/login',
  '/ar/login',
  '/en/login',
  '/register',
  '/ar/register',
  '/en/register',
  '/verify-account',
  '/ar/verify-account',
  '/en/verify-account',
  '/auth/post-oauth',
  '/ar/auth/post-oauth',
  '/en/auth/post-oauth',
  '/account',
  '/ar/account',
  '/en/account',
  '/booking',
  '/ar/booking',
  '/en/booking',
];

const STATIC_ASSET_PREFIXES = [
  '/_next/static/',
  '/icons/',
  '/images/',
  '/fonts/',
];

const FONT_EXTENSIONS = /\.(?:woff2?|ttf|otf|eot)$/i;

function shouldBypass(pathname) {
  if (BYPASS_EXACT_PATHS.includes(pathname)) {
    return true;
  }

  for (const prefix of BYPASS_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  for (const route of BYPASS_ROUTE_SEGMENTS) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return true;
    }
  }

  return false;
}

function isStaticAsset(request, pathname) {
  if (request.destination === 'font' || FONT_EXTENSIONS.test(pathname)) {
    return true;
  }

  for (const prefix of STATIC_ASSET_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (shouldBypass(url.pathname)) {
    return;
  }

  // Navigation requests: Network-First with offline fallback only (never cache dynamic HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const offlineResponse = await caches.match('/offline.html');
        return offlineResponse || Response.error();
      })
    );
    return;
  }

  // Static assets: Stale-While-Revalidate
  if (isStaticAsset(request, url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cachedResponse) {
          event.waitUntil(networkFetch);
          return cachedResponse;
        }

        const freshResponse = await networkFetch;
        return freshResponse || Response.error();
      })
    );
  }
});
