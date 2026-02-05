/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

const CITY_PACK_CACHE = 'city-pack-json-v1';

self.__WB_MANIFEST;
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// SPA offline navigation support using only precached app shell.
const appShellHandler = createHandlerBoundToURL('/index.html');
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(appShellHandler(event));
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isCityPackJson =
    requestUrl.pathname.startsWith('/data/city-packs/') &&
    requestUrl.pathname.endsWith('.json') &&
    !requestUrl.pathname.endsWith('/index.json');

  if (isCityPackJson) {
    event.respondWith(
      caches.open(CITY_PACK_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) {
          return cached;
        }

        // No global caching: only return network responses unless explicitly cached by message.
        return fetch(event.request);
      })
    );
  }
});

type SwDownloadMessage = {
  type: 'DOWNLOAD_CITY_PACK';
  payload: {
    cityId: string;
  };
};

type SwRemoveMessage = {
  type: 'REMOVE_CITY_PACK';
  payload: {
    cityId: string;
  };
};

type SwMessage = SwDownloadMessage | SwRemoveMessage;

async function cacheCityPack(cityId: string) {
  const cache = await caches.open(CITY_PACK_CACHE);
  const response = await fetch(`/data/city-packs/${cityId}.json`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Unable to download city pack: ${cityId}`);
  }

  await cache.put(`/data/city-packs/${cityId}.json`, response.clone());
}

async function removeCityPack(cityId: string) {
  const cache = await caches.open(CITY_PACK_CACHE);
  await cache.delete(`/data/city-packs/${cityId}.json`);
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const message = event.data as SwMessage | undefined;

  if (!message || !('type' in message)) {
    return;
  }

  if (message.type === 'DOWNLOAD_CITY_PACK') {
    const { cityId } = message.payload;
    event.waitUntil(cacheCityPack(cityId));
  }

  if (message.type === 'REMOVE_CITY_PACK') {
    const { cityId } = message.payload;
    event.waitUntil(removeCityPack(cityId));
  }
});
