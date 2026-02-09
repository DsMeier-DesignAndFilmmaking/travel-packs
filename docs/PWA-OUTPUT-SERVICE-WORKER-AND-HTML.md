# 8. Output: Service Worker Changes, Files Modified, Runtime Reuse, HTML Network-Only

---

## 1. Exact Service Worker Changes

### Navigation: network-only (no cache, no fallback)

All document/navigation requests are handled by a single rule. No HTML is served from cache; no app-shell fallback.

```js
// ——— HARD RULE: NETWORK-ONLY NAVIGATION (non-negotiable) ———
// IF request.mode === "navigate": ALWAYS fetch from network. NEVER serve from cache. NEVER fallback. NEVER rewrite. NEVER redirect.
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkOnly(),
  'GET'
);
```

### No HTML in precache

Precache is only used when the injected manifest has entries. With `globPatterns: []` in Vite, the manifest is empty, so no assets (and no HTML) are precached.

```js
const wbManifest = self.__WB_MANIFEST;
if (Array.isArray(wbManifest) && wbManifest.length > 0) {
  precacheAndRoute(wbManifest);
}
```

### City-scoped caching only

- **City JSON**: Cache key = `/data/city-packs/{slug}.json` (slug in key).
- **City images**: Route only for URLs whose path includes `/assets/cities/`; message handler uses cache name `city-images-{slug}`.
- No routes or handlers serve or cache HTML.

```js
// City JSON only
registerRoute(
  ({ url }) => url.pathname.startsWith('/data/city-packs/') && url.pathname.endsWith('.json'),
  new CacheFirst({ cacheName: CITY_PACK_CACHE }),
  'GET'
);

// City assets/images only (path includes city segment)
registerRoute(
  ({ url }) => url.pathname.includes('/assets/cities/'),
  new CacheFirst({ cacheName: 'city-assets-v1' }),
  'GET'
);
```

**Removed / never added:**

- `createHandlerBoundToURL('/index.html')` (or any app-shell handler for navigation).
- Any navigation route that used cache or fallback.
- Precaching of `index.html` (disabled via Vite `globPatterns: []`).

---

## 2. Files Modified

| File | Change |
|------|--------|
| **src/sw.js** | Single navigation route: `request.mode === 'navigate'` → `NetworkOnly()`. No HTML fallback. Precache only when manifest has entries (empty when globPatterns: []). City JSON and city assets routes only; city images cache name = `city-images-{slug}`. REMOVE_CITY_PACK also deletes that city’s image cache. |
| **vite.config.ts** | `injectManifest.globPatterns: []`, `injectManifest.globIgnores: ['**/*']` so no precache entries (no index.html, no app shell). `workbox.navigateFallback: null` (no navigation fallback). |
| **src/app/router/AppRouter.tsx** | SPA router boot guarantee comment: reads `window.location.pathname` on boot; no redirect on init; no restore from storage; no cached state for route. |
| **src/main.tsx** | Launch URL log when path starts with `/city/` (no override of location). |
| **docs/PWA-MULTI-INSTALL-VERIFICATION.md** | Step-by-step verification for Android Chrome and iOS Safari. |
| **docs/PWA-OUTPUT-SERVICE-WORKER-AND-HTML.md** | This document. |

---

## 3. Why Runtime Reuse Is Eliminated

**Before:** The service worker could serve the same cached HTML (or a cached document response) for different navigation URLs. When the user opened the second installed city (e.g. Paris), the browser sometimes showed the first city (e.g. Istanbul) because:

- Navigation was satisfied from cache (e.g. shared or reused response).
- Or a single app-shell / fallback document was used for all routes.

So one “runtime” (same document/HTML) was reused across installs.

**After:**

1. **Every navigation is network-only.**  
   For `request.mode === 'navigate'`, the SW uses `NetworkOnly()`. It never serves a cached response and never falls back to a shell. The document is always fetched from the network for the **actual** request URL.

2. **No HTML in precache.**  
   With `globPatterns: []`, the precache manifest is empty, so `index.html` (and any other HTML) is never precached. The SW has no HTML to serve for any URL.

3. **No app-shell or fallback.**  
   There is no handler that returns a single HTML document for multiple paths. So the document URL and the response always match the launch URL (e.g. `/city/paris-france`).

4. **Router boots from the real URL.**  
   The SPA router uses `BrowserRouter`, which reads `window.location` at boot. It does not redirect on init and does not restore a route from storage. So the first paint matches the document URL the browser loaded.

**Result:** Each installed app launch gets a fresh HTML response for its own URL and boots with that URL. There is no shared or reused HTML across different city installs, so runtime reuse is eliminated.

---

## 4. Confirmation: HTML Is Network-Only

| Check | Status |
|-------|--------|
| **Navigation requests** | Handled only by the route that uses `new NetworkOnly()`. No other route matches `request.mode === 'navigate'`. |
| **Precache** | `globPatterns: []` and `globIgnores: ['**/*']` → no precache entries → no HTML (or any asset) precached. Build output: `precache 0 entries`. |
| **Fallback / app shell** | No `createHandlerBoundToURL` or similar. No route returns cached HTML for navigation. |
| **navigateFallback** | `workbox.navigateFallback: null` in Vite config. No Workbox-level navigation fallback. |
| **City routes** | City JSON and city assets routes match only `/data/city-packs/*.json` and URLs with `/assets/cities/`. They do not match document/navigation requests. |

**Conclusion:** HTML is never served from cache and is always loaded from the network for every navigation. No HTML is precached, and there is no offline or fallback HTML for any URL.
