/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

const CITY_PACK_CACHE = 'city-pack-json-v1';

// Precache app shell & cleanup old caches
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();
clientsClaim();

// SPA navigation: respond with app shell
const appShellHandler = createHandlerBoundToURL('/index.html');

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // SPA navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(appShellHandler({ url: request.url } as any));
    return;
  }

  // City pack JSON requests
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

// --- Types for SW messages ---
type SwDownloadMessage = { type: 'DOWNLOAD_CITY_PACK'; payload: { cityId: string } };
type SwRemoveMessage = { type: 'REMOVE_CITY_PACK'; payload: { cityId: string } };
type SwMessage = SwDownloadMessage | SwRemoveMessage;

// --- Cache / remove city packs ---
async function cacheCityPack(cityId: string) {
  const cache = await caches.open(CITY_PACK_CACHE);
  const url = `/data/city-packs/${cityId}.json`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) throw new Error(`Unable to download city pack: ${cityId}`);
  await cache.put(url, response.clone());
}

async function removeCityPack(cityId: string) {
  const cache = await caches.open(CITY_PACK_CACHE);
  await cache.delete(`/data/city-packs/${cityId}.json`);
}

// --- Listen for messages from main thread ---
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const message = event.data as SwMessage | undefined;
  if (!message || !('type' in message)) return;

  switch (message.type) {
    case 'DOWNLOAD_CITY_PACK':
      event.waitUntil(cacheCityPack(message.payload.cityId));
      break;
    case 'REMOVE_CITY_PACK':
      event.waitUntil(removeCityPack(message.payload.cityId));
      break;
  }
});
