/* global self */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';

const CITY_PACK_CACHE = 'city-pack-json-v1';

// Precache app shell & cleanup old caches
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();
clientsClaim();

// SPA navigation: respond with app shell
const appShellHandler = createHandlerBoundToURL('/index.html');

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // SPA navigation
  if (request.mode === 'navigate') {
    event.respondWith(appShellHandler({ url: request.url }));
    return;
  }

  // City pack JSON caching
  const url = new URL(request.url);
  const isCityPackJson = url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json');

  if (isCityPackJson) {
    event.respondWith(
      caches.open(CITY_PACK_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        return fetch(request);
      })
    );
  }
});

// SW messages for downloading/removing city packs
self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || !('type' in message)) return;

  const cacheCityPack = async (cityId) => {
    const cache = await caches.open(CITY_PACK_CACHE);
    const response = await fetch(`/data/city-packs/${cityId}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to download city pack: ${cityId}`);
    await cache.put(`/data/city-packs/${cityId}.json`, response.clone());
  };

  const removeCityPack = async (cityId) => {
    const cache = await caches.open(CITY_PACK_CACHE);
    await cache.delete(`/data/city-packs/${cityId}.json`);
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
