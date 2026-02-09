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
import { CacheFirst, NetworkOnly } from 'workbox-strategies';

// Cache names: city-scoped where needed. Keys always include slug (e.g. /data/city-packs/{slug}.json).
const CITY_PACK_CACHE = 'city-pack-data-v1';

function cityImagesCacheName(citySlug) {
  return `city-images-${citySlug}`;
}

// ——— 1. "/" HTML NEVER CACHED ———
// Same-origin request for pathname "/" → always network, no-store. Registered first so it wins over any other route.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname !== '/') return;
  event.respondWith(fetch(event.request, { cache: 'no-store' }));
});

// Vite PWA injects manifest here. When globPatterns: [], manifest is empty — no precache (city-scoped caching only).
const wbManifest = self.__WB_MANIFEST;
if (Array.isArray(wbManifest) && wbManifest.length > 0) {
  precacheAndRoute(wbManifest);
}
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// ——— 2. NAVIGATION = NETWORK ONLY (no SPA runtime reuse) ———
// Every document request goes to network. No cached HTML, no fallback. Launch URL = document URL.
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkOnly(),
  'GET'
);

// Install: do not redirect or override the client URL. First launch uses the document's start_url (from manifest) as-is.
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

// ——— 6. OFFLINE CACHING: city data and assets ONLY (never "/" HTML) ———
registerRoute(
  ({ url }) => url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json'),
  new CacheFirst({ cacheName: CITY_PACK_CACHE })
);
registerRoute(
  ({ url }) => url.pathname.includes('/assets/cities/'),
  new CacheFirst({ cacheName: 'city-assets-v1' })
);

// 5. MESSAGE HANDLING (Manual Trigger from "Get" Button)
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  // Logic to "pre-warm" a specific city pack
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