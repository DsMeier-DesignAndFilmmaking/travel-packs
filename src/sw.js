/* global self */
// Multi-install PWA: no single app identity. Each city has its own manifest URL and scope.
// Precache = build assets (index.html, JS, CSS, icons only). No global manifest precached.
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';

const CITY_PACK_CACHE = 'city-pack-data-v1';
const IMAGE_CACHE = 'city-assets-images-v1';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// ——— NAVIGATION: "/" never cached/served offline; "/city/*" may use cache when offline ———
// 1. Root "/" must NEVER be cached or served offline. Network only.
registerRoute(
  ({ request }) => {
    if (request.mode !== 'navigate') return false;
    const pathname = new URL(request.url).pathname;
    return pathname === '/' || pathname === '';
  },
  new NetworkOnly(),
  'GET'
);

// 2. All other navigations (e.g. /city/*): network first, then precached index.html so SPA and deep links work offline. Document URL is preserved.
const indexHandler = createHandlerBoundToURL('/index.html');
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (params) => {
    try {
      const response = await fetch(params.request);
      if (response && response.status === 200) return response;
    } catch (_) {}
    return indexHandler(params);
  },
  'GET'
);

// Install: do not redirect or override the client URL. First launch uses the document's start_url (from manifest) as-is.
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

// 3. SELECTIVE CITY DATA CACHING
// We use a CacheFirst strategy for city JSON files.
registerRoute(
  ({ url }) => url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json'),
  new CacheFirst({
    cacheName: CITY_PACK_CACHE,
  })
);

// 4. CITY IMAGES (Selective)
registerRoute(
  ({ url }) => url.pathname.includes('/assets/cities/'),
  new CacheFirst({
    cacheName: IMAGE_CACHE,
  })
);

// 5. MESSAGE HANDLING (Manual Trigger from "Get" Button)
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  // Logic to "pre-warm" a specific city pack
  const cacheCityPack = async (cityId, assets = []) => {
    try {
      const dataCache = await caches.open(CITY_PACK_CACHE);
      const assetCache = await caches.open(IMAGE_CACHE);
      
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
    event.waitUntil(
      caches.open(CITY_PACK_CACHE).then(cache => cache.delete(`/data/city-packs/${event.data.payload.cityId}.json`))
    );
  }
});