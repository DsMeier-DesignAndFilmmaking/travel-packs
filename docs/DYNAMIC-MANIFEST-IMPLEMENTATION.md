# Dynamic Manifest Implementation — Route-Scoped City PWA

Static manifest behavior is eliminated. Only `/guide/*` routes have a manifest; homepage "/" has no manifest and cannot be installed.

**App identity:** Each city uses a **unique, stable, real** manifest URL (`/manifests/city-{slug}.json`). No Blob or data URI — so the browser treats each city install as a separate app and installs no longer collapse to the first installed city.

---

## 1. Files Modified or Removed

| File | Action |
|------|--------|
| **public/manifest.webmanifest** | **REMOVED** — no static manifest. |
| **src/utils/dynamicManifest.ts** | **REPLACED** — real URLs only: `getCityManifestUrl(slug)`, `injectCityManifest`, `removeManifest`, `setHomeHead`. No Blob/data URI; href = `/manifests/city-{slug}.json`. |
| **src/app/router/AppRouter.tsx** | **MODIFIED** — ManifestManager uses `setHomeHead()` when path === "/" (removes manifest), `injectCityManifest({ citySlug, cityName })` only for `/guide/:slug`. |
| **src/hooks/usePwaManifest.ts** | **REPLACED** — delegates to `injectCityManifest` / `setHomeHead`; no static manifest href. |
| **src/features/city-pack/CityPackDetailView.tsx** | **MODIFIED** — calls `usePwaManifest` with pack data so manifest uses real city name. |
| **api/dynamic-manifest.ts** | **MODIFIED** — returns **404** for non-city paths (no valid manifest for "/"). |
| **index.html** | **MODIFIED** — inline script only injects manifest for `/guide/*`; adds `scope: startUrl`; no manifest when path is "/". |
| **vite.config.ts** | **MODIFIED** — `manifest: false`; `globPatterns` no longer include `webmanifest`; `globIgnores` include `**/manifest*.webmanifest`, `**/site.webmanifest`. |
| **src/sw.js** | **UNCHANGED** — already: "/" → NetworkOnly (never cached/served offline); other navigations → network first then precached index.html. |

---

## 2. Exact Code Changes

### 2.1 Dynamic manifest utility (`src/utils/dynamicManifest.ts`)

- **`getCityManifestUrl(citySlug)`** — Returns the unique, stable, real manifest URL: `/manifests/city-{slug}.json`. Never Blob or data URI.
- **`removeManifest()`** — Removes every `<link rel="manifest">` from `<head>`.
- **`setHomeHead()`** — Calls `removeManifest()`, then sets canonical, og:url, apple-mobile-web-app-title, and document.title to home defaults. Ensures no manifest when route is "/".
- **`injectCityManifest(options)`** — Sets `<link rel="manifest" href="/manifests/city-{slug}.json">` (real URL only). Updates canonical, og:url, title, apple-mobile-web-app-title. Only for use on `/guide/*` routes.

No Blob or data URI; each city has a distinct manifest URL so the browser treats each install as a separate app.

### 2.2 AppRouter (`src/app/router/AppRouter.tsx`)

- When `path === '/'`: call `setHomeHead()` only (no manifest).
- When `path.match(/^\/city\/([^/]+)$/)`: call `injectCityManifest({ citySlug: slug, cityName })` with slug and derived city name.
- Otherwise (e.g. 404): call `setHomeHead()`.

### 2.3 API (`api/dynamic-manifest.ts`)

- If path is not a city route (`/^\/city\/[^/]+$/`): `return res.status(404).end();` — no manifest response for "/" or other non-city paths.
- City route logic unchanged: returns manifest with `start_url` and `scope` for that city.

### 2.4 index.html

- Inline script runs only when `path.indexOf('/guide/') !== -1`.
- Sets `<link rel="manifest" href="/manifests/city-{slug}.json">` (real URL only; no data URI).
- No `<link rel="manifest">` in HTML and no script branch for "/".

### 2.5 Vite config (`vite.config.ts`)

- `manifest: false` (no generated manifest).
- `injectManifest.globPatterns`: removed `webmanifest` so no manifest file is precached.
- `injectManifest.globIgnores`: added `**/manifest*.webmanifest`, `**/site.webmanifest`.

### 2.6 Service worker (`src/sw.js`)

- No code change. Already:
  - Navigation to "/" (or "") → `NetworkOnly` (never cached, never served offline).
  - Other navigations → fetch from network, on failure serve precached `index.html`.
  - No precache or cache of "/" as a document; city data/images routes unchanged.

---

## 3. Why "/" Is Now Impossible to Install

1. **No manifest link on "/"**  
   When the route is "/", `ManifestManager` calls `setHomeHead()`, which calls `removeManifest()`. So there is zero `<link rel="manifest">` in the document. Browsers that require a manifest for install (e.g. Android Chrome) will not offer install when there is no manifest.

2. **No static manifest to fall back to**  
   `public/manifest.webmanifest` has been deleted. Nothing in the app points to it. Vite PWA does not generate or inject a manifest (`manifest: false`). So no URL can load a manifest for "/".

3. **API returns 404 for "/"**  
   If something ever requested a manifest for the root path, `/api/dynamic-manifest` returns 404 for non-city paths. So there is no valid manifest document for "/".

4. **Install UI only on city routes**  
   AppShell shows the install button only when the route is `/guide/*`; `usePWAInstall.handleInstall()` does not call `prompt()` when the path is "/". So programmatic install from the homepage is blocked.

5. **SW never caches or serves "/"**  
   The service worker uses `NetworkOnly` for navigation to "/", so "/" is never cached or served offline. The PWA entry point is never the root URL.

Together, this guarantees "/" cannot be installed as the PWA and has no manifest.

---

## 4. Manual Verification Steps

1. **Homepage has no manifest**
   - Open `https://travel-packs.vercel.app/`.
   - In DevTools → Application → Manifest (or Elements → `<head>`): there must be **no** `<link rel="manifest">`.
   - Add to Home Screen / install must not be offered (or must not use "/" as start URL).

2. **City page has manifest**
   - Open `https://travel-packs.vercel.app/guide/paris-france`.
   - In DevTools → Application → Manifest: manifest should be present with `start_url` and `scope` pointing to `/guide/paris-france`.
   - In Elements, `<link rel="manifest">` should have an `href` like `data:application/manifest+json;base64,...`.

3. **Install from city page**
   - On `/guide/paris-france`, use Add to Home Screen / install.
   - Launch the installed app: it must open directly to the city page (e.g. `/guide/paris-france`), not "/".

4. **Navigation**
   - In browser: go "/" → "/guide/london-united-kingdom" → back to "/". All must load and navigate normally.
   - In installed PWA: from a city page, in-app links to "/" and to other cities should work when online.

5. **Offline**
   - Visit a city page once while online, then go offline. Reload that city URL: it should load (SW serves index.html for non-root navigations).
   - While offline, open "/": request should fail (SW does not cache or serve "/").

6. **API**
   - Request `GET /api/dynamic-manifest?start_url=/` or with Referer of "/": response must be **404**.
   - Request `GET /api/dynamic-manifest?start_url=/guide/paris-france`: response must be **200** with JSON manifest for that city.

---

## 5. Dynamic Manifest Utility API (reference)

```ts
// Only on /guide/* routes
injectCityManifest({
  citySlug: string,   // e.g. 'paris-france'
  cityName: string,  // e.g. 'Paris'
  icons?: Array<{ src, sizes, type, purpose? }>  // optional; defaults to /pwa-192x192.png, /pwa-512x512.png
});

// When route === "/"
setHomeHead();

// Remove all manifest links (used internally; also callable for strict cleanup)
removeManifest();

// Build manifest object only (e.g. for API or tests)
getCityManifestUrl(citySlug);
```

All of the above are in `@/utils/dynamicManifest`. No static manifest; no "/" in any manifest.
