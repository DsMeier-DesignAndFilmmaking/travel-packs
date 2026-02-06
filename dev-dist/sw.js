import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

self.skipWaiting();
clientsClaim();

// 1. PRECACHE CORE ASSETS
// This is replaced by Vite with the list of JS/CSS/HTML files needed for the app shell.
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// 2. STYLING & FONTS (Your Request)
// Ensures the Airbnb-inspired look works offline even if not explicitly pre-cached.
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'ui-assets-cache',
  })
);

// 3. SELECTIVE CITY PACK DATA (The Goal)
// Caches only the JSON for the city the user is currently viewing.
registerRoute(
  ({ url }) => url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json'),
  new CacheFirst({
    cacheName: 'city-pack-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5, // Keep the last 5 cities visited
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// 4. SPA NAVIGATION FALLBACK
// Ensures that refreshing the page on /city/london works while offline.
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

// 5. MANUAL MESSAGE LISTENER
// This allows your React components to trigger a "Download" for a specific city.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'DOWNLOAD_CITY_PACK') {
    const { cityId } = event.data.payload;
    const urlToCache = `/data/city-packs/${cityId}.json`;
    
    event.waitUntil(
      caches.open('city-pack-data').then((cache) => {
        return fetch(urlToCache).then((response) => {
          if (response.ok) {
            return cache.put(urlToCache, response);
          }
        });
      })
    );
  }
});