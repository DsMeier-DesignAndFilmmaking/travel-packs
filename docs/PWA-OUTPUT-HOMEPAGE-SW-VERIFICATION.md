# PWA Output: HomePage, Service Worker, Reset Explanation & Verification

This document provides the **updated code** for HomePage and the service worker, **why the SPA runtime reset fixes the first-city bug**, **verification steps** for multiple city installs, and confirmation that **city manifests stay unique and intact**.

---

## 1. HomePage component (updated code)

The HomePage clears global state and forces one network reload when the user lands on "/", so the next city install gets a clean runtime. The reset runs **once** per visit to "/" (guarded by a namespaced flag) to avoid infinite reload loops.

```tsx
// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HomePageView } from '@/features/home/HomePageView';
import { useCityPacks } from '@/hooks/useCityPacks';
import { cityPackRepository } from '@/services/content/cityPackRepository';
import type { CityPackSummary } from '@/types/cityPack';
import { clearGlobalStateOnHome, getStorageKey } from '@/utils/storageKeys';

const HOME_RESET_KEY = 'resetDone';

/**
 * HomePage Controller
 *
 * SPA homepage reset: when user lands on "/", we clear global state and force one
 * network reload so the next city install works correctly. State is namespaced
 * (travel-packs.home.* / travel-packs.city.<slug>.*) so installs do not conflict.
 */
export function HomePage() {
  const location = useLocation();
  const [packs, setPacks] = useState<CityPackSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const { downloadCityPack, removeCityPack, getPackStatus, listDownloadedPacks } = useCityPacks();

  // SPA reset on "/" — clear global state and one network reload for next city install
  useEffect(() => {
    if (location.pathname !== '/') return;
    const resetFlagKey = getStorageKey('home', null, HOME_RESET_KEY);
    if (localStorage.getItem(resetFlagKey)) {
      localStorage.removeItem(resetFlagKey);
      return;
    }
    clearGlobalStateOnHome();
    localStorage.setItem(resetFlagKey, '1');
    window.location.replace(window.location.href);
  }, [location.pathname]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    cityPackRepository
      .listCityPacks()
      .then((result) => {
        setPacks(result.items);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-[2px] border-[#F7F7F7] border-t-[#222222] rounded-full animate-spin"></div>
          <div className="absolute h-1.5 w-1.5 bg-[#FF385C] rounded-full shadow-[0_0_8px_rgba(255,56,92,0.4)]"></div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#B0B0B0]">
          Syncing Catalog
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-view-container flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-[1px] h-12 bg-[#FF385C] mb-8" />
        <h2 className="text-4xl font-black tracking-tighter text-[#222222] mb-4">
          Off the Grid<span className="text-[#FF385C]">.</span>
        </h2>
        <p className="text-[#717171] font-medium leading-relaxed max-w-sm mb-10">
          We're having trouble reaching the server. Check your connection or explore your cached packs.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-pill btn-pill--primary shadow-xl hover:shadow-[#FF385C]/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <HomePageView
      packs={packs}
      onDownloadPack={downloadCityPack}
      onRemovePack={removeCityPack}
      getPackStatus={getPackStatus}
      downloadedCount={listDownloadedPacks().length}
      isOnline={isOnline}
    />
  );
}
```

---

## 2. Service worker (updated code)

The SW ensures: (1) "/" is never cached so the SPA always gets a fresh document when loading the homepage; (2) all navigations are network-only so each launch uses the document URL (and thus the correct city); (3) only city data and assets are cached.

```js
/* global self */
//
// ABSOLUTE CONSTRAINTS — this app supports MULTIPLE independent installs.
// DO NOT cache HTML. DO NOT use navigationFallback. DO NOT reuse app shell.
// DO NOT merge city runtimes. DO NOT rely on refresh.
//
// Caching ONLY: city data, city JSON, city assets, city images. Cache keys include city slug.
//
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';

const CITY_PACK_CACHE = 'city-pack-data-v1';

function cityImagesCacheName(citySlug) {
  return `city-images-${citySlug}`;
}

// ——— HOMEPAGE "/" BYPASS ———
// Bypass cache for the homepage so the SPA runtime always reloads. Registered first so it runs before Workbox routes.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname !== '/') return;
  event.respondWith(fetch(event.request, { cache: 'no-store' }));
});

const wbManifest = self.__WB_MANIFEST;
if (Array.isArray(wbManifest) && wbManifest.length > 0) {
  precacheAndRoute(wbManifest);
}
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// ——— NETWORK-ONLY NAVIGATION ———
// Every navigation fetches from network. Document URL = launch URL; no cached HTML so each city install opens to its city.
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkOnly(),
  'GET'
);

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json'),
  new CacheFirst({ cacheName: CITY_PACK_CACHE })
);

registerRoute(
  ({ url }) => url.pathname.includes('/assets/cities/'),
  new CacheFirst({ cacheName: 'city-assets-v1' })
);

self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  const cacheCityPack = async (cityId, assets = []) => {
    try {
      const dataCache = await caches.open(CITY_PACK_CACHE);
      const assetCache = await caches.open(cityImagesCacheName(cityId));
      const jsonUrl = `/data/city-packs/${cityId}.json`;
      const response = await fetch(jsonUrl, { cache: 'reload' });
      if (response.ok) {
        await dataCache.put(jsonUrl, response.clone());
        if (assets.length > 0) await assetCache.addAll(assets);
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
    const cityId = event.data.payload.cityId;
    event.waitUntil(
      (async () => {
        const dataCache = await caches.open(CITY_PACK_CACHE);
        await dataCache.delete(`/data/city-packs/${cityId}.json`);
        const imgCacheName = cityImagesCacheName(cityId);
        if (await caches.has(imgCacheName)) await caches.delete(imgCacheName);
      })()
    );
  }
});
```

---

## 3. Why SPA runtime reset solves the first-city bug

**The bug:** With a single shared SPA and no reset, the **first** city you install can “stick” in memory and in storage. When you install a **second** city and open it, the browser might still load the same HTML/JS and the app might show the first city (or a route restored from storage) instead of the city for the icon you tapped.

**How the reset fixes it:**

1. **"/" is never cached**  
   The service worker intercepts requests for "/" and always does `fetch(request, { cache: 'no-store' })`. So whenever the user goes to the homepage, they get a fresh document from the network, not an old shell that was cached when they were on City A.

2. **One full reload when landing on "/"**  
   When the user navigates to "/", the HomePage effect runs once: it calls `clearGlobalStateOnHome()` (clears sessionStorage, legacy lastCity, and all `travel-packs.home.*` keys), sets a one-time flag, then does `window.location.replace(window.location.href)`. That triggers a **full page load** for "/". So the SPA runtime is reinitialized from scratch with the current URL ("/"), not from any in-memory or stored “last city” state.

3. **No route override on boot**  
   The router boots only from `window.location.pathname`; it does not read localStorage/sessionStorage to redirect to a “last city”. So after the "/" reload, the app stays on "/" and does not jump back to the first city.

4. **Next city install gets the right URL**  
   When the user later opens a **city** icon (City A or City B), the browser loads the document for that install’s `start_url` (e.g. `/city/paris-france`). Because navigations are network-only, that document is fetched from the server with the correct URL. The SPA then initializes with that URL and shows that city. The previous "/" reset ensured there was no leftover global state that could make the app think it should show the first city.

So: **SPA runtime reset on "/"** = fresh document + clean global state + no stored route override → each city install opens to its own city, and the “first city wins” bug is avoided.

---

## 4. Verification steps for multiple city installs

Use these on **Android Chrome** and **iOS Safari** (Add to Home Screen from the city page).

**Prerequisites**

- Deployed URL (e.g. `https://travel-packs.vercel.app/`)
- City A: e.g. Istanbul — `/city/istanbul-turkiye`
- City B: e.g. Paris — `/city/paris-france`

**Steps**

| Step | Action | Pass |
|------|--------|------|
| 1 | Install from City A page → tap City A icon | Opens to **City A** (correct URL and content). No refresh needed. |
| 2 | In browser, go to City B page → install → tap City B icon | Opens to **City B**, **not** City A. No refresh needed. |
| 3 | Tap City A icon again | Still opens to **City A**. |
| 4 | Tap City B icon again | Still opens to **City B**. |
| 5 | From any city, tap home (e.g. “localcity” logo) to go to "/" | App navigates to "/", clears global state, performs **one** full network reload, shows catalog. No infinite reload. |
| 6 | No manual refresh | Correct city (or "/" behavior) at every step without pull-to-refresh or manual reload. |

**Sign-off**

| Check | Android Chrome | iOS Safari |
|-------|----------------|------------|
| Install City A → opens City A | ☐ | ☐ |
| Install City B → opens City B (not City A) | ☐ | ☐ |
| Open City A again → City A | ☐ | ☐ |
| Open City B again → City B | ☐ | ☐ |
| Navigate to "/" → SPA resets and network reloads | ☐ | ☐ |
| No manual refresh required | ☐ | ☐ |

**If something fails**

- Wrong city on open: ensure no old SW is caching HTML; clear site data or uninstall both icons and re-test.
- Correct only after refresh: confirm SW uses network-only for navigations and no HTML precache.
- "/" doesn’t reset: confirm HomePage runs the one-time reset and SW does not cache "/" (homepage fetch uses `cache: 'no-store'`).

---

## 5. City manifests: unique and intact

City manifests are **per-city**, **stable**, and **real URLs**. They are not shared and are not overwritten by the homepage or by other cities.

**Uniqueness**

- Each city has its own manifest **URL**: `/manifests/city-{slug}.json` (e.g. `/manifests/city-istanbul-turkiye.json`, `/manifests/city-paris-france.json`).
- Each manifest has its own **identity**: `id`, `start_url`, and `scope` are set to that city’s path (e.g. `id: "/city/paris-france"`, `start_url: "/city/paris-france"`, `scope: "/city/paris-france"`).
- The API serves them from `api/manifest/[slug].ts` with the slug in the path; Vercel rewrites `/manifests/city-:slug.json` → `/api/manifest/:slug`. No Blob or data URI; only real HTTP URLs.

**Intact**

- On **"/"** the app calls `setHomeHead()` which **removes** any `<link rel="manifest">`. The homepage has **no** manifest, so it is not installable as a city app.
- On **/city/:slug** the app calls `injectCityManifest({ citySlug, cityName })`, which removes any existing manifest link and adds a single `<link rel="manifest" href="/manifests/city-{slug}.json">`. So the document always has exactly one manifest, and it is the one for the **current** city.
- The SW and HomePage reset do **not** change or serve manifests; they only affect caching and in-memory/global storage. Manifest links are controlled only by the router/ManifestManager and the dynamic manifest utility.

**Summary**

- **Unique:** One manifest URL per city; one install identity per city; no shared manifest.
- **Intact:** Home has no manifest; city pages get the correct manifest for the current slug; no overwriting between cities or by the "/" reset.
