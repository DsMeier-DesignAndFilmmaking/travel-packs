# PWA Page-Scoped Fixes — Implementation Summary

Only `/guide/*` is installable and offline-capable. Homepage `/` is online-only and non-installable. SPA navigation is unchanged.

---

## 1. Files Modified

| File | Change |
|------|--------|
| `public/manifest.webmanifest` | Made non-installable for home: `display: "browser"`, description updated, removed `maskable` purpose from icons. |
| `api/dynamic-manifest.ts` | When path is `/` or non-city, return manifest with `display: "browser"` and early exit; city manifests use `scope: startUrl`. |
| `src/components/layout/AppShell.tsx` | Install button shown only on `/guide/*` via `useIsInstallableRoute()`. |
| `src/hooks/usePWAInstall.ts` | `handleInstall()` returns without calling `prompt()` when path is `/` or not `/guide/*`. |
| `src/sw.js` | Root `/` uses `NetworkOnly`; all other navigations use network-first then precached `index.html`. |

**Not changed:** `vite.config.ts` (already had `navigateFallback: null`), `vercel.json` (SPA rewrite kept), `AppRouter.tsx` / `ManifestManager` (still points to static manifest on home, which is now non-installable).

---

## 2. Exact Code Changes

### 2.1 `public/manifest.webmanifest`

- `display`: `"standalone"` → `"browser"`.
- `description`: Clarified that install is from a city page.
- Icons: `purpose`: `"any maskable"` → `"any"` so home manifest is not used for install UI.

### 2.2 `api/dynamic-manifest.ts`

- After resolving `startPath`, added `isCityRoute = /^\/city\/[^/]+$/.test(startPath)`.
- If `!isCityRoute`: return 200 with a manifest that has `display: "browser"`, `start_url: origin/`, `scope: origin/`; no standalone install from this response.
- City branch unchanged except `scope`: `origin + '/'` → `startUrl` (city-scoped).

### 2.3 `src/components/layout/AppShell.tsx`

- Import `useLocation`.
- Added `useIsInstallableRoute()`: returns `true` only when `pathname` matches `/^\/city\/[^/]+$/`.
- Install button rendered only when `isInstallableRoute && !isInstalled && installPrompt`.

### 2.4 `src/hooks/usePWAInstall.ts`

- In `handleInstall()`: if `path === '/'` or `!path.startsWith('/guide/')`, return without calling `installPrompt.prompt()`.

### 2.5 `src/sw.js`

- Replaced single `NavigationRoute(navHandler)` with:
  1. Route for `request.mode === 'navigate'` and `pathname === '/' || pathname === ''` → `new NetworkOnly()` (no cache, no fallback).
  2. Route for all other `navigate` requests → custom handler: `fetch(request)` then on failure call `createHandlerBoundToURL('/index.html')(params)`.
- Import `NetworkOnly` from `workbox-strategies`; removed `NavigationRoute` import.

---

## 3. Service Worker Fetch Logic

- **Navigation to `/` (or `""`)**: Handled by first route → `NetworkOnly`. Always goes to network; never cached, never served from cache. Offline → request fails (browser shows offline/error).
- **Navigation to `/guide/*` or any other path**: Handled by second route → fetch from network; on failure (e.g. offline), serve precached `/index.html`. Document URL remains the requested path (SPA and deep links intact).
- **Precache**: Unchanged — `precacheAndRoute(self.__WB_MANIFEST)` still precaches assets including `index.html`. That precache is used only as fallback for non-root navigations.
- **City data / images**: Unchanged — existing `CacheFirst` routes for `/data/city-packs/*.json` and `/assets/cities/` remain.

---

## 4. Manifest Logic

- **Home `/`**:  
  - ManifestManager (in AppRouter) sets `<link rel="manifest">` to `/manifest.webmanifest`.  
  - That file now has `display: "browser"` and is not used as a standalone PWA.  
  - If the API is used with referer/path `/`, response is the same non-installable manifest.
- **City `/guide/:slug`**:  
  - ManifestManager sets manifest to `/api/dynamic-manifest?start_url=/guide/...` (or inline/data URI from index.html on first load).  
  - API returns manifest with `start_url` = that city URL, `scope` = that URL, `display: "standalone"`, city-specific name/short_name.  
  - No manifest configuration references `/` as an installable start_url or scope.

---

## 5. Vite Config

- No changes. `navigateFallback: null` was already set; no global navigate fallback. `injectManifest` and precache behavior unchanged.

---

## 6. Navigation Preservation

- **SPA routing**: Unchanged. React Router still handles `/` and `/guide/:slug`; no redirects or route guards added.
- **Online**: All navigations (including `/`) go to the network; Vercel serves `index.html` for all routes via existing rewrite; SW does not block or redirect.
- **Offline**: Only non-root navigations (e.g. `/guide/paris`) get a fallback (precached `index.html`). Root `/` has no fallback and fails when offline, as required.
- **Vercel**: `vercel.json` rewrites `(.*)` → `/index.html` only; no SW overrides, no headers that cache `/`.

---

## 7. Verification Checklist

| Check | How to verify |
|-------|----------------|
| **Online navigation works** | In browser: open `/`, click to `/guide/paris`, back to `/`, direct open `/guide/london`. All load and navigate normally. |
| **Offline behavior is city-only** | With SW active: go to `/guide/paris` once online, go offline. Reload `/guide/paris` → loads. Reload `/` or open `/` → fails/offline page. |
| **Install blocked on homepage** | On `/`: no “Install App” in header; if `beforeinstallprompt` fires and something called `prompt()`, `handleInstall()` exits without calling it. Share → Add to Home Screen uses manifest with `display: browser` (non-standalone). |
| **Install works on city page** | On `/guide/paris`: “Install App” visible when prompt available; tap Install → install uses city start_url; launched PWA opens at that city URL. |

---

## 8. Root Cause (Addressed)

- **start_url "/"**: Static `manifest.webmanifest` and API (when path was `/`) returned `start_url: "/"` and `display: "standalone"` → fixed by making home manifest `display: "browser"` and API early-return for non-city.
- **Install from home**: AppShell showed Install on every route and `handleInstall()` did not check path → fixed by route check in AppShell and in `handleInstall()`.
- **"/" cached/served offline**: Single `NavigationRoute` served precached `index.html` for all navigations including `/` → fixed by dedicated `NetworkOnly` for `/` and fallback-only for other navigations.

No app-shell model, no redirect to `/`, no blocking of online `/` fetches. Page-scoped PWA with normal SPA behavior.
