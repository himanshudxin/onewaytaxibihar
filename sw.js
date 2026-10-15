/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * High-Performance Offline & PWA Service Worker
 * Version: 2026.10.15-v2.0
 */

const CACHE_NAME = 'onewaytaxibihar-v3.0';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/components.css',
  '/js/data.js',
  '/js/calculator.js',
  '/js/map.js',
  '/js/api.js',
  '/js/datetime-picker.js',
  '/js/firebase-otp.js',
  '/js/view-router.js',
  '/js/booking.js',
  '/js/app.js',
  '/img/logo-reframed.png',
  '/favicon.svg',
  '/manifest.json',
  '/404.html',
  '/500.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW Install Pre-cache Notice]:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. NEVER cache API requests, bookings, payments, or admin - ALWAYS bypass SW
  if (
    req.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.includes('/checkout') ||
    url.pathname.includes('/payment')
  ) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(JSON.stringify({ 
          error: 'Offline mode active. Please check your internet connection.',
          offline: true 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Navigation / HTML requests - Network first with Cache fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((networkRes) => {
        if (networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const indexCached = await caches.match('/index.html');
        if (indexCached) return indexCached;
        return caches.match('/404.html');
      })
    );
    return;
  }

  // 3. Static Assets (Fonts, WebP Images, Minified CSS/JS) - Cache-First for maximum speed
  if (
    url.pathname.startsWith('/fonts/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.min.css') ||
    url.pathname.endsWith('.min.js')
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) return cachedRes;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 4. Default: Stale While Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch(() => null);

      return cachedRes || fetchPromise;
    })
  );
});
