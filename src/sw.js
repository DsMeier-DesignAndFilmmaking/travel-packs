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

// SPA navigation fallback: serve precached index.html. Request URL (including path and query) is preserved as the document URL—no stripping. Deep links like /city/london?foo=bar stay intact.
const navHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navHandler);
registerRoute(navigationRoute);

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