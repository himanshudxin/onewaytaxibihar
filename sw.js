/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * High-Performance Offline & PWA Service Worker
 * Version: 2026.10.11
 */

const CACHE_NAME = 'onewaytaxibihar-v3.6';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/cabs',
  '/cabs.html',
  '/booking',
  '/booking.html',
  '/driver',
  '/driver.html',
  '/fare-chart',
  '/fare-chart.html',
  '/patna-to-gaya-cab',
  '/patna-to-gaya-cab.html',
  '/patna-to-muzaffarpur-cab',
  '/patna-to-muzaffarpur-cab.html',
  '/patna-to-darbhanga-cab',
  '/patna-to-darbhanga-cab.html',
  '/patna-to-bhagalpur-cab',
  '/patna-to-bhagalpur-cab.html',
  '/404.html',
  '/500.html',
  '/css/style.css',
  '/css/components.css?v=3.0',
  '/js/brand-logo.js?v=20261017_wa_v4',
  '/js/data.js?v=20261017_wa_v4',
  '/js/calculator.js?v=20261017_wa_v4',
  '/js/map.js?v=20261017_wa_v4',
  '/js/api.js?v=20261017_wa_v4',
  '/js/datetime-picker.js?v=20261017_wa_v4',
  '/js/firebase-otp.js?v=20261017_wa_v4',
  '/js/booking.js?v=20261017_wa_v4',
  '/js/app.js?v=20261017_wa_v4',
  '/favicon.svg',
  '/img/logo-reframed.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/phonepe-qr.png',
  '/manifest.json',
  '/driver-manifest.json',
  '/driver-icon.svg',
  '/images/driver-icon-192.png',
  '/images/driver-icon-512.png'
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

  // 1. NEVER cache API requests or non-GET requests - ALWAYS Network First
  if (req.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
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

  // 3. Static Assets (CSS, JS, Images, Fonts) - Stale While Revalidate
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
