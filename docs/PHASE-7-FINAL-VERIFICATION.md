# Phase 7 — Final Verification & Root Cause Summary

## Root cause summary

**Why the UI was locked**

1. **Service worker used CacheFirst for city pack JSON**  
   All requests to `/data/city-packs/*.json` (including `index.json` and each city’s pack) were handled with **CacheFirst** and stored in the cache `city-pack-data-v1`. After the first successful response (or after “Download Pack”), every later request was **served from cache**. The network was not tried again, so:
   - Changes to JSON content (e.g. copy, new sections) never appeared.
   - The same cached response was reused across reloads and sessions.

2. **Single long‑lived cache name**  
   The cache name was fixed (`city-pack-data-v1`). There was no versioning or invalidation on deploy, so:
   - New deployments did not change the cache name.
   - The new service worker still used the same cache and kept serving old entries.

3. **No cache invalidation**  
   There was no logic to:
   - Prefer the network when online.
   - Delete or version the data cache when the app or SW was updated.

**Result:** CityPackDetailView (and the home list) always received the same cached pack/index data, so the UI looked “locked” and did not reflect new code or new content until the user cleared site data or the cache manually.

---

## How the fix prevents this permanently

1. **NetworkFirst for city pack JSON**  
   The service worker now uses **NetworkFirst** (with an 8s timeout) for `/data/city-packs/*.json`:
   - When **online**: the network is tried first; the response is cached and returned. UI updates (code and data) show on the next load.
   - When **offline or timeout**: the SW falls back to cache so the app still works offline.

2. **Build‑versioned cache name**  
   The data cache name is now `city-pack-data-${BUILD_VERSION}` where `BUILD_VERSION` is injected at build time (timestamp). So:
   - Each production build gets a **new cache name**.
   - Old cache entries live under the old name and are no longer used.

3. **Activate handler cleans old caches**  
   On `activate`, the service worker deletes any cache whose name starts with `city-pack-data-` and is **not** the current version. So:
   - After a new deploy and SW update, the new SW removes old data caches.
   - No manual clearing is needed for normal updates.

4. **Client prefers no‑store when possible**  
   `cityPackRepository` calls `getJson(..., { cache: 'no-store' })` for list and pack. When the request is **not** intercepted by the SW (e.g. before the SW controls the page), the browser does not use its HTTP cache, reinforcing fresh data when the SW is not in the loop.

5. **SW update and reload**  
   Existing logic (skipWaiting + reload on controllerchange) ensures that after a new deploy, the client can activate the new SW and reload once, so the next load uses the new SW (and thus NetworkFirst and the new versioned cache).

Together, these ensure that **when online, the UI always gets fresh data from the network first**, and **after a new deploy, old cached data is abandoned** via the new cache name and activate cleanup.

---

## Exact files changed

| File | Change |
|------|--------|
| **src/sw.js** | Switched city pack JSON from CacheFirst to NetworkFirst (8s timeout). Cache name set to `city-pack-data-${BUILD_VERSION}` with `BUILD_VERSION` placeholder. Added activate handler to delete old `city-pack-data-*` caches. Removed temporary audit logs. |
| **scripts/inject-build-version.js** | **NEW.** Reads `src/sw.js`, replaces `__BUILD_VERSION__` with timestamp (or `dev`), backs up original to `.cache/sw-original.js`, writes injected content to `src/sw.js`. |
| **scripts/restore-sw.js** | **NEW.** Restores `src/sw.js` from `.cache/sw-original.js` after build so the repo keeps the placeholder. |
| **package.json** | `build` script: run inject → generate-manifests → tsc → vite build → restore. `dev` unchanged. |
| **.gitignore** | Added `.cache` (used for SW backup). |
| **vite.config.ts** | Added `define: { __BUILD_VERSION__: JSON.stringify(buildVersion) }` with `buildVersion` from `process.env.BUILD_ENV === 'dev' ? 'dev' : String(Date.now())`. |
| **src/main.tsx** | Added `console.log('[App] Build version:', __BUILD_VERSION__)` and kept `[PWA launch]` log for city path. |
| **src/components/layout/AppShell.tsx** | Footer line: `build <span data-build-version>{__BUILD_VERSION__}</span>` for visible build version. |
| **src/vite-env.d.ts** | Added `declare const __BUILD_VERSION__: string`. |
| **src/services/content/contentClient.ts** | `getJson(path, options?)` with optional `options.cache` (default `'default'`). |
| **src/services/content/cityPackRepository.ts** | `listCityPacks()` and `getCityPackBySlug(slug)` call `getJson(..., { cache: 'no-store' })`. |
| **src/pwa/registerServiceWorker.ts** | Improved `[SW]` logging: registered scope, update found, waiting worker, controller change + reload. |
| **src/features/city-pack/CityPackDetailView.tsx** | Removed temporary HMR force-test line. |

No changes were made to manifest `start_url`/`scope` (already correct per Phase 4).

---

## Final verification checklist

### 1. Local dev

- [ ] Run `npm run dev`, open e.g. `http://localhost:5173/guide/paris-france`.
- [ ] **CityPackDetailView reflects new UI changes:** Edit text or layout in `CityPackDetailView.tsx`, save → UI updates (HMR or reload).
- [ ] **No stale UI:** Change content in `public/data/city-packs/paris-france.json`, save → reload city page → new content appears (dev server serves fresh file; SW uses NetworkFirst).
- [ ] **Build version:** Footer shows “build” plus a number; console shows `[App] Build version: <value>`.
- [ ] **SW:** Console shows `[SW] Registered; scope: ...`. No stale city data after editing JSON.

### 2. Vercel preview URL

- [ ] Deploy to Vercel (or run `npm run build && npm run preview` locally).
- [ ] Open preview URL, go to a city detail page.
- [ ] **CityPackDetailView reflects new UI:** Deploy a change to `CityPackDetailView.tsx` (or any UI), redeploy → open preview again → new UI is visible (new HTML/JS; SW may need one reload).
- [ ] **No stale UI:** Deploy a change to a city JSON file, redeploy → reload city page → new data appears (NetworkFirst + new cache name on new deploy).
- [ ] **Build version:** Footer shows a timestamp; each new deploy shows a **new** timestamp after reload.
- [ ] **Service worker updates:** After a new deploy, first load may use old SW; when new SW is found, console shows “New content available; activating and reloading.” and page reloads; next load uses new SW and new build version.

### 3. Installed PWA (Add to Home Screen)

- [ ] From a city page (e.g. `/guide/paris-france`), use “Add to Home Screen” (or browser install).
- [ ] Close the app, open again from the home screen icon → city detail loads (start_url = that city).
- [ ] **CityPackDetailView reflects new UI:** Deploy a new version, open PWA → if prompt “New content available” and reload, or manually reload → new UI is visible.
- [ ] **No stale UI:** Deploy new JSON/content, open PWA and reload (or accept update) → city detail shows new content (NetworkFirst + versioned cache).
- [ ] **Service worker updates correctly:** After deploy, opening the PWA can show “New content available”; after reload, new SW is active and footer build version updates. Old data caches are removed on activate.

### 4. Summary checks

| Check | Expected |
|-------|----------|
| CityPackDetailView reflects new UI changes | Yes, when online and after reload/update (HMR in dev). |
| No stale UI across reloads | Yes; NetworkFirst + versioned cache + activate cleanup. |
| Service worker updates correctly | Yes; skipWaiting + reload on controllerchange; new SW uses new cache name and cleans old caches. |

---

## Quick reference: data flow after fix

```
User opens city page (dev / preview / PWA)
  → Document: always from network (NetworkOnly for navigate; "/" no-store).
  → JS/CSS: from network (hashed URLs on deploy).
  → City pack JSON: fetch(/data/city-packs/{slug}.json, { cache: 'no-store' })
      → SW intercepts: NetworkFirst(city-pack-data-{BUILD_VERSION})
      → Online: network first → cache response → return → UI shows fresh data.
      → Offline/timeout: return from cache if present.
  → CityPackDetailView receives pack from that response → UI reflects current data.
On new deploy:
  → New SW with new BUILD_VERSION → new cache name.
  → Activate: delete all caches named city-pack-data-* except current.
  → Next fetch uses empty cache for that name → network → fresh data.
```

This document is the Phase 7 final verification checklist and root cause summary. Use the checklist to confirm behavior in local dev, Vercel preview, and installed PWA.
