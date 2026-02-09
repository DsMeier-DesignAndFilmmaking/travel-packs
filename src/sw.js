/* global self */
//
// ABSOLUTE CONSTRAINTS — this app supports MULTIPLE independent installs.
// DO NOT cache HTML. DO NOT use navigationFallback. DO NOT reuse app shell.
// DO NOT merge city runtimes. DO NOT rely on refresh.
//
// Caching ONLY: city data, city JSON, city assets, city images. Cache keys include city slug.
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

// Vite PWA injects manifest here. When globPatterns: [], manifest is empty — no precache (city-scoped caching only).
const wbManifest = self.__WB_MANIFEST;
if (Array.isArray(wbManifest) && wbManifest.length > 0) {
  precacheAndRoute(wbManifest);
}
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// ——— HARD RULE: NETWORK-ONLY NAVIGATION (non-negotiable) ———
// IF request.mode === "navigate": ALWAYS fetch from network. NEVER serve from cache. NEVER fallback. NEVER rewrite. NEVER redirect.
// Fixes multi-install bug: each app launch gets fresh HTML and boots with the correct URL (window.location.pathname).
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkOnly(),
  'GET'
);

// Install: do not redirect or override the client URL. First launch uses the document's start_url (from manifest) as-is.
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

// 3. CITY JSON ONLY — cache key = /data/city-packs/{slug}.json (slug in key)
registerRoute(
  ({ url }) => url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json'),
  new CacheFirst({
    cacheName: CITY_PACK_CACHE,
  })
);

// 4. CITY ASSETS/IMAGES — only URLs whose path includes /assets/cities/ (path = key, must include city segment)
registerRoute(
  ({ url }) => url.pathname.includes('/assets/cities/'),
  new CacheFirst({
    cacheName: 'city-assets-v1',
  })
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