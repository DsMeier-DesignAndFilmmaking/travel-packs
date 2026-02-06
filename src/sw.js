/* global self */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Separate cache names for clarity
const CITY_PACK_CACHE = 'city-pack-data-v1';
const IMAGE_CACHE = 'city-assets-images-v1';

// 1. PRECACHE SETUP (The "App Shell")
// This only caches common UI (JS, CSS, Icons). 
// It does NOT include city-specific JSON from your /data folder.
precacheAndRoute(self.__WB_MANIFEST); 

cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// 2. SMART NAVIGATION (SPA Support)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse.status === 404) {
        return caches.match('/index.html');
      }
      return networkResponse;
    } catch (error) {
      return caches.match('/index.html');
    }
  }
);

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