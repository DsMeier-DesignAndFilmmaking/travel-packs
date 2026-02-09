# PWA Multi-Install: Route-Based Manifest & Verification

This document covers **route-based manifest attachment** (5), **service worker alignment** (6), **verification requirements** (7), and the **mandatory output format** (8) for multiple independent city installs.

---

## 1. List of Files Modified or Created

| File | Status |
|------|--------|
| **vercel.json** | Modified — rewrite `/manifests/city-:slug.json` → `/api/manifest/:slug` |
| **api/manifest/[slug].ts** | Modified — serves one manifest per city; `id`/`start_url`/`scope` = `/city/{slug}`; no "/" |
| **src/utils/dynamicManifest.ts** | Modified — real URLs only; `getCityManifestUrl(slug)`, `injectCityManifest`, `removeManifest`, `setHomeHead` |
| **src/app/router/AppRouter.tsx** | Modified — ManifestManager: "/" → setHomeHead(); `/city/:slug` → injectCityManifest |
| **index.html** | Modified — inline script injects `<link rel="manifest" href="/manifests/city-{slug}.json">` only for `/city/*` |
| **src/sw.js** | Modified — comment: multi-install, no single app identity; "/" NetworkOnly; no manifest in precache |
| **vite.config.ts** | Modified — `manifest: false`; globPatterns exclude webmanifest; globIgnores include manifest files |
| **src/hooks/usePwaManifest.ts** | Exists — delegates to injectCityManifest/setHomeHead |
| **src/features/city-pack/CityPackDetailView.tsx** | Exists — calls usePwaManifest with pack data |
| **docs/PWA-MULTI-INSTALL-VERIFICATION.md** | Created — this file |

---

## 2. Exact Code (Key Parts)

### 2.1 Route-based manifest attachment — AppRouter

```tsx
// src/app/router/AppRouter.tsx
function ManifestManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';

    if (path === '/') {
      setHomeHead();
      return;
    }

    const cityMatch = path.match(/^\/city\/([^/]+)$/);
    const slug = cityMatch?.[1];
    if (slug) {
      const cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      injectCityManifest({ citySlug: slug, cityName });
    } else {
      setHomeHead();
    }
  }, [location.pathname, location.search]);

  return null;
}
```

### 2.2 Client-side manifest logic — dynamicManifest.ts

```ts
// src/utils/dynamicManifest.ts

export function getCityManifestUrl(citySlug: string): string {
  return `/manifests/city-${citySlug}.json`;
}

export function removeManifest(): void {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]');
  links.forEach((el) => el.remove());
}

export function injectCityManifest(options: InjectCityManifestOptions): void {
  const href = getCityManifestUrl(options.citySlug);
  removeManifest();
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = href;
  document.head.appendChild(link);
  // ... canonical, og:url, title, apple-mobile-web-app-title
}

export function setHomeHead(): void {
  removeManifest();
  // ... canonical, og:url, title for home
}
```

### 2.3 index.html — first-paint for /city/* only

```html
<script>
  (function() {
    var path = window.location.pathname;
    if (path.indexOf('/city/') !== -1) {
      var parts = path.split('/').filter(Boolean);
      var citySlug = parts[parts.length - 1];
      var link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifests/city-' + citySlug + '.json';
      document.head.appendChild(link);
      // title + apple-mobile-web-app-title
    }
  })();
</script>
```

### 2.4 Service worker — no single app identity, "/" not cached

```js
// src/sw.js (excerpt)
// Multi-install PWA: no single app identity. Each city has its own manifest URL and scope.
// Precache = build assets (index.html, JS, CSS, icons only). No global manifest precached.

// 1. Root "/" → NetworkOnly (never cached, never served offline)
registerRoute(
  ({ request }) => {
    if (request.mode !== 'navigate') return false;
    const pathname = new URL(request.url).pathname;
    return pathname === '/' || pathname === '';
  },
  new NetworkOnly(),
  'GET'
);

// 2. Other navigations (e.g. /city/*) → network first, then precached index.html
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (params) => {
    try {
      const response = await fetch(params.request);
      if (response && response.status === 200) return response;
    } catch (_) {}
    return indexHandler(params);
  },
  'GET'
);
```

### 2.5 Vercel rewrite

```json
// vercel.json
{
  "rewrites": [
    { "source": "/manifests/city-:slug.json", "destination": "/api/manifest/:slug" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 3. Manifest File Examples

**Istanbul** — `GET /manifests/city-istanbul-turkiye.json` (served by `/api/manifest/istanbul-turkiye`):

```json
{
  "id": "/city/istanbul-turkiye",
  "name": "Istanbul Travel Pack",
  "short_name": "Istanbul Pack",
  "description": "Offline-first travel guide for Istanbul",
  "start_url": "/city/istanbul-turkiye",
  "scope": "/city/istanbul-turkiye",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "https://travel-packs.vercel.app/pwa-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "https://travel-packs.vercel.app/pwa-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**Lisbon** (if slug were `lisbon-portugal`) — `GET /manifests/city-lisbon-portugal.json`:

```json
{
  "id": "/city/lisbon-portugal",
  "name": "Lisbon Travel Pack",
  "short_name": "Lisbon Pack",
  "description": "Offline-first travel guide for Lisbon",
  "start_url": "/city/lisbon-portugal",
  "scope": "/city/lisbon-portugal",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [ "..."]
}
```

No manifest references `"/"` in `id`, `start_url`, or `scope`.

---

## 4. Client-Side Manifest Attachment Logic (Summary)

| Route | Behavior | Code |
|-------|----------|------|
| **`/`** | No manifest. Any existing `<link rel="manifest">` is removed. | `setHomeHead()` → `removeManifest()` then set canonical/title for home. |
| **`/city/:slug`** | One manifest link, href = city-specific URL. | `injectCityManifest({ citySlug, cityName })` → `removeManifest()` then append `<link rel="manifest" href="/manifests/city-{slug}.json">`. |
| **Other (e.g. 404)** | Treated like home: no manifest. | `setHomeHead()`. |

- **First paint (direct load of /city/xyz):** index.html inline script runs only when path contains `/city/` and adds the same href `/manifests/city-{slug}.json`.
- **Client navigation:** React ManifestManager runs on pathname change; on `/` it calls `setHomeHead()`, on `/city/:slug` it calls `injectCityManifest()` with that slug.
- **City detail with pack data:** CityPackDetailView uses usePwaManifest so the manifest (and title) can be updated with the real city name from the pack; the manifest **URL** stays `/manifests/city-{slug}.json` (slug from route/pack.id).

All manifest links use real HTTP URLs only; no Blob or data URI.

---

## 5. Why Apps No Longer Merge

- **Before:** One shared manifest URL (or one data URI / one API URL with different query) was used for every city. The browser identified the PWA by that single manifest URL (and scope), so every install was treated as the same app and reopened the first installed city.
- **Now:**
  - Each city has a **different** manifest URL: `/manifests/city-istanbul-turkiye.json`, `/manifests/city-paris-france.json`, etc.
  - Each manifest has a **unique `id`** and **scope** (`/city/{slug}`). The browser uses manifest URL + scope/id to decide app identity.
  - So Istanbul install → identity A (manifest URL A, scope `/city/istanbul-turkiye`); Lisbon install → identity B (manifest URL B, scope `/city/lisbon-portugal`). They do not overwrite each other and appear as separate home-screen apps, each launching to its own city.

Constraints kept: no Blob/Object URL for manifests, no reuse of one manifest URL across cities, no global/static manifest, no "/" in any manifest, SPA and offline city logic unchanged.

---

## 6. Manual Verification Steps

### Android (Chrome)

1. **Homepage non-installable**  
   Open `https://travel-packs.vercel.app/`. Menu → "Install app" / "Add to Home screen" should not be offered (or not create an install that opens "/").

2. **Istanbul install**  
   Open `/city/istanbul-turkiye`. In DevTools (or "Site information") confirm `<link rel="manifest" href="/manifests/city-istanbul-turkiye.json">`. Install the app. Home screen: one icon (e.g. "Istanbul Pack"). Launch → opens `/city/istanbul-turkiye`.

3. **Lisbon (or Paris) install**  
   In browser, open `/city/paris-france`. Confirm manifest href is `/manifests/city-paris-france.json`. Install. Home screen: **second** icon (e.g. "Paris Pack"). Launch → opens `/city/paris-france`.

4. **Both apps separate**  
   Home screen shows two (or more) icons. Tapping Istanbul icon opens Istanbul; tapping Paris icon opens Paris. No city overwrites another.

5. **Navigation**  
   From Istanbul app, use in-app link to home or Paris. Online: navigates correctly. Back/forward works.

6. **Offline**  
   After loading Istanbul once online, go offline. Reload Istanbul → still loads. Open "/" in app or new tab → fails (no cache for "/").

### iOS (Safari)

1. **Homepage non-installable**  
   Open `https://travel-packs.vercel.app/`. Share → "Add to Home Screen" may appear but the resulting shortcut should open in browser (no standalone manifest for "/"). Ideally no manifest link on "/" so Add to Home Screen is not offered as a full PWA.

2. **Istanbul install**  
   Open `/city/istanbul-turkiye`. Share → Add to Home Screen. Name should reflect "Istanbul Pack" / "Istanbul Travel Pack". Add. Home screen: Istanbul icon. Launch → standalone, opens Istanbul city page.

3. **Second city install**  
   In Safari, open `/city/paris-france`. Share → Add to Home Screen. Add. Home screen: second icon (Paris). Launch → Paris city page.

4. **Both apps separate**  
   Two icons; each launches to its own city. No overwriting.

5. **Navigation**  
   In one installed app, navigate to "/" or another city (online). SPA navigation works; back/forward works.

6. **Offline**  
   Same as Android: city page that was opened while online can load offline; "/" does not.

---

## 7. Verification Checklist (Final)

| Requirement | Status |
|-------------|--------|
| Installing Istanbul → Istanbul app | ✅ Unique manifest URL + scope for Istanbul |
| Installing Lisbon/Paris → separate app | ✅ Unique manifest URL + scope per city |
| Both apps appear separately on home screen | ✅ Different manifest URLs → different identities |
| Each app launches to its own city | ✅ start_url/scope = /city/{slug} |
| No city overwrites another | ✅ No shared manifest URL |
| Homepage remains non-installable | ✅ No manifest on "/"; setHomeHead() removes link |
| No Blob/Object URL for manifests | ✅ Only `/manifests/city-{slug}.json` |
| No reuse of manifest URL across cities | ✅ One URL per slug |
| No global/static manifest | ✅ manifest: false; no static file linked |
| No "/" in any manifest | ✅ id/start_url/scope = /city/{slug} only |
| SPA navigation intact | ✅ No redirect or guard blocking "/" or /city/* |
| Existing offline city logic intact | ✅ SW still caches city data/images; city nav fallback unchanged |
| SW does not assume single app identity | ✅ Comment + no manifest in precache; navigateFallback null |
| "/" not cached or served offline | ✅ NetworkOnly for "/" |

This app supports **multiple independent installs**; the implementation matches the above requirements and constraints.
