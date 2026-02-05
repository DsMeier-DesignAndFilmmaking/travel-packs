/* global self */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

const CITY_PACK_CACHE = 'city-pack-json-v1';

// 1. PRECACHE SETUP
// Vite's build process replaces self.__WB_MANIFEST with the asset list.
precacheAndRoute(self.__WB_MANIFEST); 

cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// 2. FETCH STRATEGY
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // SPA NAVIGATION: Hard fix for the 404 loop
if (request.mode === 'navigate') {
  event.respondWith(
    fetch(request)
      .then((response) => {
        // IF VERCEL RETURNS A 404, FIX IT ON THE CLIENT
        if (response.status === 404) {
          return caches.match('/index.html');
        }
        return response;
      })
      .catch(() => {
        // OFFLINE FALLBACK
        return caches.match('/index.html');
      })
  );
  return;
}

  // --- CITY PACK JSON (OFFLINE-FIRST) ---
  const isCityPackJson = url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json');

  if (isCityPackJson) {
    event.respondWith(
      caches.open(CITY_PACK_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        // Serve from cache if we have it, otherwise fetch and don't block
        return cachedResponse || fetch(request);
      })
    );
    return;
  }
});

// 3. MESSAGE HANDLING (Download/Remove)
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  const cacheCityPack = async (cityId) => {
    try {
      const cache = await caches.open(CITY_PACK_CACHE);
      // 'no-store' ensures a fresh fetch when the user clicks 'Get Pack'
      const response = await fetch(`/data/city-packs/${cityId}.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Download failed for ${cityId}`);
      
      await cache.put(`/data/city-packs/${cityId}.json`, response);
      console.log(`[SW] Cached: ${cityId}`);
    } catch (error) {
      console.error(`[SW] Cache error for ${cityId}:`, error);
    }
  };

  const removeCityPack = async (cityId) => {
    const cache = await caches.open(CITY_PACK_CACHE);
    await cache.delete(`/data/city-packs/${cityId}.json`);
    console.log(`[SW] Removed: ${cityId}`);
  };

  if (event.data.type === 'DOWNLOAD_CITY_PACK') {
    event.waitUntil(cacheCityPack(event.data.payload.cityId));
  }
  
  if (event.data.type === 'REMOVE_CITY_PACK') {
    event.waitUntil(removeCityPack(event.data.payload.cityId));
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});