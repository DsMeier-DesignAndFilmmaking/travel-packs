/* global self */
//
// ABSOLUTE CONSTRAINTS (multi-city PWA — do not violate)
// 1. Do NOT cache "/" HTML — homepage fetch uses cache: 'no-store'; navigations are NetworkOnly.
// 2. Do NOT reuse SPA runtime across city installs — every launch gets fresh document URL; no app shell precache.
// 3. Do NOT use Blob URLs — manifests and assets use real HTTP URLs only (see dynamicManifest).
// 4. Do NOT merge city runtime state — storage is namespaced per city (travel-packs.city.<slug>.*); only city data cached here.
// 5. Keep dynamic city manifests functional — do not cache or rewrite manifest URLs; they are real /manifests/city-{slug}.json.
// 6. Offline caching ONLY for city assets/data — never for "/" or any HTML. Only routes below may cache.
//
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly, NetworkFirst } from 'workbox-strategies';

// Build version: replaced at build time by scripts/inject-build-version.js for cache busting.
const BUILD_VERSION = '__BUILD_VERSION__';
const CITY_PACK_CACHE = `city-pack-data-${BUILD_VERSION}`;

function cityImagesCacheName(citySlug) {
  return `city-images-${citySlug}`;
}

const CITY_PACK_JSON_RE = /^\/data\/city-packs\/[^/]+\.json$/;
const NETWORK_TIMEOUT_MS = 8000;

// ——— 1. "/" HTML NEVER CACHED ———
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isNav = event.request.mode === 'navigate';

  if (path === '/') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // ——— 2. City pack JSON: NetworkFirst so UI updates reflect immediately when online; fallback to cache for offline ———
  if (CITY_PACK_JSON_RE.test(path)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CITY_PACK_CACHE);
        try {
          const networkPromise = fetch(event.request);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT_MS)
          );
          const response = await Promise.race([networkPromise, timeoutPromise]);
          if (response && response.ok) {
            await cache.put(event.request, response.clone());
            return response;
          }
        } catch (_) {
          // Offline or timeout: use cache
        }
        const cached = await cache.match(event.request);
        return cached || (await fetch(event.request));
      })()
    );
    return;
  }

  if (isNav) {
    // Navigate handled by Workbox NetworkOnly below
  }
});

// Vite PWA injects manifest here. When globPatterns: [], manifest is empty — no precache (city-scoped caching only).
const wbManifest = self.__WB_MANIFEST;
if (Array.isArray(wbManifest) && wbManifest.length > 0) {
  precacheAndRoute(wbManifest);
}
cleanupOutdatedCaches();
// skipWaiting is not called here so new SW waits until user clicks Update (ReloadPrompt); config has skipWaiting: false.
clientsClaim();

// ——— 2a. /city/* document: NetworkFirst so UI changes are pulled from Vercel before falling back to cache ———
const CITY_PAGES_CACHE = 'city-pages-v1';
registerRoute(
  ({ request, url }) => request.mode === 'navigate' && url.pathname.startsWith('/city/'),
  new NetworkFirst({ cacheName: CITY_PAGES_CACHE, networkTimeoutSeconds: 8 }),
  'GET'
);

// ——— 2b. All other navigations: network only (no HTML cache). ———
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkOnly(),
  'GET'
);

// Install: do not skipWaiting here; new SW stays waiting until ReloadPrompt calls updateServiceWorker(true).
self.addEventListener('install', function(event) {
  event.waitUntil(Promise.resolve());
});

// Activate: delete old city-pack-data-* caches from previous builds so new deploys get fresh data after SW update.
self.addEventListener('activate', function(event) {
  const currentCache = CITY_PACK_CACHE;
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name.startsWith('city-pack-data-') && name !== currentCache)
          .map((name) => {
            console.log('[SW] Deleting outdated cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ——— 6. OFFLINE CACHING: city assets (city-pack JSON handled above with audit logging) ———
registerRoute(
  ({ url }) => url.pathname.includes('/assets/cities/'),
  new CacheFirst({ cacheName: 'city-assets-v1' })
);

// 5. MESSAGE HANDLING
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  // ReloadPrompt calls updateServiceWorker(true) → workbox-window sends SKIP_WAITING; then we activate and reload.
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // Pre-warm a specific city pack (Download button)
  const cacheCityPack = async (cityId, assets = []) => {
    try {
      const dataCache = await caches.open(CITY_PACK_CACHE);
      const assetCache = await caches.open(cityImagesCacheName(cityId));
      
      // Fetch the JSON pack
      const jsonUrl = `/data/city-packs/${cityId}.json`;
      const response = await fetch(jsonUrl, { cache: 'reload' });
      
      if (response.ok) {
        await dataCache.put(jsonUrl, response.clone());
        
        // OPTIONAL: If the JSON contains a list of image URLs, 
        // you could iterate and add them to assetCache here.
        if (assets.length > 0) {
          await assetCache.addAll(assets);
        }
      }
      
      console.log(`[SW] ${cityId} Pack is now available offline.`);
    } catch (error) {
      console.error(`[SW] Failed to store ${cityId}:`, error);
    }
  };

  if (event.data.type === 'DOWNLOAD_CITY_PACK') {
    event.waitUntil(cacheCityPack(event.data.payload.cityId, event.data.payload.assets));
  }
  
  if (event.data.type === 'REMOVE_CITY_PACK') {
    const cityId = event.data.payload.cityId;
    event.waitUntil(
      (async () => {
        const dataCache = await caches.open(CITY_PACK_CACHE);
        await dataCache.delete(`/data/city-packs/${cityId}.json`);
        const imgCacheName = cityImagesCacheName(cityId);
        if (await caches.has(imgCacheName)) await caches.delete(imgCacheName);
      })()
    );
  }
});