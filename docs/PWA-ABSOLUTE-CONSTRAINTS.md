# PWA absolute constraints

These constraints are **non-negotiable** for the multi-city PWA. Do not cache "/" HTML, reuse the SPA runtime across installs, use Blob URLs, or merge city state. Dynamic city manifests must stay functional; offline caching is for city assets/data only.

---

## 1. Do not cache "/" HTML

- **Service worker:** A `fetch` listener runs **first** for same-origin requests with `pathname === '/'`. It calls `event.respondWith(fetch(event.request, { cache: 'no-store' }))`, so the homepage is never read from or written to cache.
- **Vite PWA:** `injectManifest.globPatterns: []` and `globIgnores: ['**/*']` so the precache manifest is empty — no HTML (including index.html or "/") is precached.
- **Navigation:** All navigations use `NetworkOnly()`, so no document request is ever served from cache.

**Files:** `src/sw.js` (homepage bypass + network-only navigation), `vite.config.ts` (globPatterns).

---

## 2. Do not reuse SPA runtime across city installs

- **Service worker:** Every `request.mode === 'navigate'` is handled with `NetworkOnly()`. The document is always fetched from the network, so the URL of the document is the launch URL (e.g. `/guide/paris-france`). The SPA then boots from `window.location.pathname` with no stored route override.
- **Vite PWA:** `navigateFallback: null` — no app shell fallback, so there is no single cached shell reused for all cities.
- **App:** Router does not read localStorage/sessionStorage to redirect; HomePage on "/" clears global state and forces one reload so the next city install gets a clean runtime.

**Files:** `src/sw.js`, `vite.config.ts`, `src/app/router/AppRouter.tsx`, `src/pages/HomePage.tsx`.

---

## 3. Do not use Blob URLs

- **Manifests:** Manifest `href` is always a real HTTP URL: `/manifests/city-{slug}.json`. No `Blob` or `createObjectURL` or data URI. The API serves these at `/api/manifest/[slug]` (Vercel rewrite).
- **Assets:** Cached city assets are stored by real request URL (e.g. `/data/city-packs/paris-france.json`, `/assets/cities/...`). No Blob URLs for manifest or app shell.

**Files:** `src/utils/dynamicManifest.ts` (getCityManifestUrl, injectCityManifest), `api/manifest/[slug].ts`. No use of `Blob` or `createObjectURL` in app or API code.

---

## 4. Do not merge city runtime state

- **Storage:** All city-scoped state uses keys `travel-packs.city.<slug>.<key>`. Each install (and each route) only reads/writes the key for the **current** pathname’s slug. No code reads another city’s keys or combines state from multiple cities.
- **Router:** Boots from `window.location.pathname` only; no "last city" or stored route used to redirect.
- **Clear on "/":** Only global/home keys (`travel-packs.home.*`) and sessionStorage are cleared; city keys are left intact so City A and City B installs stay independent.

**Files:** `src/utils/storageKeys.ts`, `src/hooks/useCityPacks.ts` (slug from pathname, storage key per slug), `src/pages/HomePage.tsx` (clearGlobalStateOnHome).

---

## 5. Keep dynamic city manifests functional

- **Per-city manifest URL:** `/manifests/city-{slug}.json` — unique per city, served by API, real URL only.
- **Document head:** On `/guide/:slug`, `injectCityManifest({ citySlug, cityName })` sets `<link rel="manifest" href="/manifests/city-{slug}.json">`. On "/", `setHomeHead()` removes any manifest link.
- **Service worker:** Does not cache or rewrite manifest URLs. No route serves or alters `/manifests/*` responses.
- **Manifest content:** Each manifest has its own `id`, `start_url`, and `scope` (e.g. `/guide/paris-france`), so each install has a distinct identity.

**Files:** `src/utils/dynamicManifest.ts`, `src/app/router/AppRouter.tsx` (ManifestManager), `api/manifest/[slug].ts`, `vercel.json` (rewrite). SW does not add routes for manifest URLs.

---

## 6. Offline caching only for city assets/data, never "/" HTML

- **What is cached:**  
  - City pack JSON: `/data/city-packs/*.json` (CacheFirst, `city-pack-data-v1`).  
  - City assets: URLs whose path includes `/assets/cities/` (CacheFirst, `city-assets-v1`).  
  - Per-city image caches: `city-images-{slug}` (used in DOWNLOAD_CITY_PACK handler).
- **What is not cached:**  
  - Any request for pathname "/" (handled by the fetch listener with `cache: 'no-store'`).  
  - Any navigation (all navigations use NetworkOnly).  
  - No precache entries (globPatterns: []).

**Files:** `src/sw.js` — only the two `registerRoute` calls for city JSON and city assets may cache; the "/" listener and the navigation route ensure no HTML is cached.

---

## Summary table

| Constraint | Primary enforcement |
|------------|---------------------|
| 1. No "/" HTML cache | SW fetch listener (pathname === '/') + NetworkOnly navigation + empty precache |
| 2. No SPA runtime reuse | NetworkOnly for all navigations + null navigateFallback + router boot from URL only |
| 3. No Blob URLs | dynamicManifest uses only `/manifests/city-{slug}.json`; no Blob/createObjectURL |
| 4. No merged city state | storageKeys + useCityPacks slug from pathname; only current city's keys used |
| 5. Dynamic manifests functional | Real manifest URL per city; setHomeHead/injectCityManifest; SW does not touch manifests |
| 6. Offline = city only | SW caches only city-pack JSON and city assets routes; "/" and navigate never cached |
