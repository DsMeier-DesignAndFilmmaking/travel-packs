/* global self */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';

const CITY_PACK_CACHE = 'city-pack-json-v1';

// 1. PRECACHE SETUP
// Note: Leave self.__WB_MANIFEST exactly like this. 
// Vite's build process will replace this variable with the manifest array.
precacheAndRoute(self.__WB_MANIFEST); 

cleanupOutdatedCaches();
clientsClaim();

// 2. SPA NAVIGATION
// This ensures that deep-linked routes (e.g., /pack/antalya) still load the app shell
const appShellHandler = createHandlerBoundToURL('/index.html');

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 3. FETCH STRATEGY
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // SPA navigation handling
  if (request.mode === 'navigate') {
    event.respondWith(appShellHandler({ url: request.url }));
    return;
  }

  // City pack JSON caching (The "Offline-First" magic)
  const url = new URL(request.url);
  const isCityPackJson = url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json');

  if (isCityPackJson) {
    event.respondWith(
      caches.open(CITY_PACK_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        // Serve from cache if available, otherwise hit the network
        if (cachedResponse) return cachedResponse;
        return fetch(request);
      })
    );
  }
});

// 4. MESSAGE HANDLING (Download/Remove)
self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || !('type' in message)) return;

  const cacheCityPack = async (cityId) => {
    try {
      const cache = await caches.open(CITY_PACK_CACHE);
      // 'no-store' ensures we get a fresh version from the server when the user clicks download
      const response = await fetch(`/data/city-packs/${cityId}.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Unable to download city pack: ${cityId}`);
      await cache.put(`/data/city-packs/${cityId}.json`, response.clone());
      console.log(`Successfully cached pack: ${cityId}`);
    } catch (error) {
      console.error(`Cache failed for ${cityId}:`, error);
    }
  };

  const removeCityPack = async (cityId) => {
    const cache = await caches.open(CITY_PACK_CACHE);
    await cache.delete(`/data/city-packs/${cityId}.json`);
    console.log(`Removed pack: ${cityId}`);
  };

  switch (message.type) {
    case 'DOWNLOAD_CITY_PACK':
      event.waitUntil(cacheCityPack(message.payload.cityId));
      break;
    case 'REMOVE_CITY_PACK':
      event.waitUntil(removeCityPack(message.payload.cityId));
      break;
  }
});