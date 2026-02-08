/* global self */
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

const CITY_PACK_CACHE = 'city-pack-data-v1';
const IMAGE_CACHE = 'city-assets-images-v1';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// SPA navigation fallback: serve precached index.html for same-origin navigations.
// The browser keeps the *request* URL (e.g. /city/london) as the document URL, so
// React Router receives the deep link and lands on the correct City Pack. Do not
// fetch(event.request)—the server may redirect to / and the document URL would become /.
const navHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navHandler);
registerRoute(navigationRoute);

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