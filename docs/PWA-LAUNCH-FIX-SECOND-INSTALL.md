# PWA Launch Fix: Second Install Opens First City

## Root cause

When the user installed a **second** city (e.g. Paris) and opened it, the app showed the **first** installed city (e.g. Istanbul). After a refresh, the correct city appeared.

**Cause:** The service worker handled navigation requests with the **default cache behavior**. For same-origin navigations, the browser can satisfy `fetch(request)` from the HTTP cache. On some platforms (especially mobile), that cache can be shared or keyed in a way that returns a document that was originally fetched for a **different** URL (e.g. `/guide/istanbul-turkiye` when the actual request was `/guide/paris-france`). So the **response body** (or the way the document URL was resolved) could effectively be for the first city, and the newly opened app showed the wrong city until a refresh forced a real network request.

**Contributing factors:**

- One SW controls all clients for the origin; multiple installed “apps” (Istanbul, Paris) are separate home-screen icons but same origin.
- Navigation to `/guide/paris-france` was handled with `fetch(params.request)` without disabling cache, so a previously cached document could be reused.
- The router and app do **not** restore route from localStorage/sessionStorage; the only source of “which city” is the current URL. So if the document URL or the response was wrong, the app would render the wrong city.

**What we do not change:**

- We do **not** assume a single app identity; each city still has its own manifest URL and scope.
- We do **not** remove `clients.claim()` or `skipWaiting()`; they are required for offline and updates. Client isolation is ensured by **never reusing a cached document from another URL** for navigation.

---

## Files modified

| File | Change |
|------|--------|
| **src/sw.js** | For non-"/" navigation requests: clone the request with `cache: 'no-store'` before `fetch()`, so the network (or SW) never reuses a cached document from another path. Fallback still uses the **original** `params` so the document URL stays the request URL. |
| **src/app/router/AppRouter.tsx** | Comment: router uses only `window.location`; no storage for route; no “last city” restore. |
| **src/main.tsx** | Log launch pathname when path starts with `/guide/` so support can confirm which city the PWA launched to. |
| **docs/PWA-LAUNCH-FIX-SECOND-INSTALL.md** | This document. |

---

## Exact code changes

### 1. Service worker (`src/sw.js`)

**Before:** Navigation handler used `fetch(params.request)` with default cache.

**After:** Build a new request from the navigation request with `cache: 'no-store'`, then fetch that. Fallback to `indexHandler(params)` unchanged so the document URL remains the original request URL.

```js
// 2. All other navigations (e.g. /guide/*): network first with cache bypass, then precached index.html when offline.
// CRITICAL: Use cache: 'no-store' so we never reuse a cached document from a different URL (prevents second
// install opening first city). Document URL is always the request URL; we never substitute another path.
const indexHandler = createHandlerBoundToURL('/index.html');
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (params) => {
    const navRequest = params.request;
    const freshRequest = new Request(navRequest, { cache: 'no-store' });
    try {
      const response = await fetch(freshRequest);
      if (response && response.status === 200) return response;
    } catch (_) {}
    return indexHandler(params);
  },
  'GET'
);
```

### 2. Router comment (`src/app/router/AppRouter.tsx`)

- Added a short comment above the router/logger: route comes only from `window.location`; no localStorage/sessionStorage for route; no “last city” restore; each installed app must show the city for its `start_url`.

### 3. Launch log (`src/main.tsx`)

- Replaced the generic `[PWA launch] window.location.href` log with a log that runs when `window.location.pathname.startsWith('/guide/')`, logging that pathname so the launch URL (and thus which city app opened) can be verified.

---

## Why first-city reuse is eliminated

1. **Navigation always uses a non-cached request**  
   For every navigation to `/guide/*`, the SW uses `new Request(navRequest, { cache: 'no-store' })` and then `fetch(freshRequest)`. The browser does not satisfy this from the HTTP cache, so we do not get a document that was stored for another URL (e.g. the first installed city). The response is either a fresh network response for the **current** request URL or, when offline, the precached shell via `indexHandler(params)`, which is still tied to the **same** request URL. So the document URL and content are always for the launched city.

2. **Document URL is never overridden**  
   We never substitute another path: we do not have a single app-shell URL, and the fallback returns a response for the **original** `params.request`. The browser sets the document URL from that request, so each launch keeps the correct `start_url`.

3. **Router does not override URL**  
   The router uses only the current `window.location` (BrowserRouter). There is no “last city” or route in localStorage/sessionStorage, so even if the platform were to open an existing window, we would not redirect it to a different city from our code.

4. **Manifest and scope remain per-city**  
   Each city still has its own manifest URL and scope; we did not introduce a shared app identity or merge apps at runtime.

---

## Verification matrix

Use this to confirm that each installed city opens to its own city and that no refresh is required.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Install City A (e.g. Istanbul) from `/guide/istanbul-turkiye` | One icon (e.g. “Istanbul Pack”) on home screen. |
| 2 | Open City A | App opens **directly to Istanbul** (no redirect, no refresh needed). |
| 3 | Install City B (e.g. Paris) from `/guide/paris-france` | **Second** icon (e.g. “Paris Pack”) on home screen. |
| 4 | Open City B (tap Paris icon) | App opens **directly to Paris** (not Istanbul). No refresh needed. |
| 5 | Open City A again (tap Istanbul icon) | App shows **Istanbul** again. |
| 6 | Open City B again (tap Paris icon) | App shows **Paris** again. |
| 7 | No refresh | At no step should the user need to refresh to see the correct city. |

### Android Chrome

- Repeat the matrix: install Istanbul, open it; install Paris, open it; confirm Paris opens to Paris and Istanbul to Istanbul without refresh.
- In DevTools (or remote debugging), confirm `[PWA launch] city from start_url: /guide/paris-france` (or the relevant path) when opening the Paris app.

### iOS Safari

- Same matrix: Add Istanbul to Home Screen, open; Add Paris to Home Screen, open Paris icon.
- Confirm Paris opens to Paris and Istanbul to Istanbul without refresh.
- If possible, confirm the launch URL (e.g. via Safari’s inspector or a simple on-screen debug) when opening each icon.

---

## Constraints preserved

- No merging of city apps at runtime.
- No app-shell navigation that forces a single URL.
- No reliance on refresh to fix routing.
- Normal browser navigation and SPA routing unchanged.
- Offline city packs and existing SW caching (e.g. city data, images) unchanged.
- Each installed city continues to behave as an isolated app instance; the fix only ensures the **document and router** are driven by the **actual launch URL** and that the SW never serves a cached document from another city’s URL.
