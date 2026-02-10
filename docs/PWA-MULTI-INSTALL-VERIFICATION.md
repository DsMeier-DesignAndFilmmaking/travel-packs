# PWA Multi-Install Verification (Mandatory)

Use this checklist to prove that each installed city app opens to its own city with **no refresh required**, on **iOS Safari** and **Android Chrome**.

---

## Requirements (What We Verify)

| # | Requirement | Pass criteria |
|---|-------------|----------------|
| 1 | Install City A → opens City A | Tapping City A icon opens that city’s page immediately. |
| 2 | Install City B → opens City B (not City A) | Tapping City B icon opens City B; never opens City A. |
| 3 | Open City A again → still opens City A | Re-opening the City A icon still shows City A. |
| 4 | Open City B again → still opens City B | Re-opening the City B icon still shows City B. |
| 5 | Navigate to "/" → SPA resets and network reloads | From any city, going to "/" clears global state and does one full reload. |
| 6 | No manual refresh | Correct city (or "/" behavior) without pull-to-refresh or reload. |
| 7 | Works on Android Chrome + iOS Safari | All above hold on both platforms. |

---

## Why It Works (Implementation Reference)

- **1–4, 6–7 (correct city on open, no refresh):**  
  SW uses **network-only for all navigations** (`request.mode === 'navigate'` → `NetworkOnly()`). No HTML precache; no navigation fallback. Each install has its own **manifest** with that city’s `start_url` and `scope`. The **router** boots from `window.location.pathname` only (no storage-based redirect). So the document URL is always the launch URL and the SPA shows the correct city without refresh.

- **5 (navigate to "/" → reset + reload):**  
  **HomePage** on `pathname === '/'` runs once: calls **`clearGlobalStateOnHome()`** (sessionStorage, lastCity, `travel-packs.home.*`), sets a one-time flag, then **`window.location.replace(window.location.href)`** so "/" always gets a network reload and clean runtime.

- **Cross-install isolation:**  
  Storage is namespaced: **`travel-packs.city.<slug>.*`** for per-city data; **`travel-packs.home.*`** for home. No shared keys; "/" clears only global/home keys so City A and City B installs stay independent.

---

## Prerequisites

- Deployed app: `https://travel-packs.vercel.app/` (or your deployment URL)
- **iOS**: Safari (Add to Home Screen uses Safari)
- **Android**: Chrome
- Two different city pages, e.g.:
  - **City A**: Istanbul — `/guide/istanbul-turkiye`
  - **City B**: Paris — `/guide/paris-france`

---

## Verification Matrix (Required Outcomes)

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Install City A (e.g. Istanbul) | One home-screen icon; open it → **City A** (Istanbul). |
| 2 | Install City B (e.g. Paris) | Second home-screen icon; open it → **City B** (Paris). **Not** City A. |
| 3 | Open City A again | App shows **City A** (Istanbul). |
| 4 | Open City B again | App shows **City B** (Paris). |
| 5 | No refresh | At no step is a browser refresh needed to see the correct city. |

---

## Android Chrome

### 1. Install City A (e.g. Istanbul)

1. In Chrome, go to `https://travel-packs.vercel.app/guide/istanbul-turkiye`.
2. Confirm the page shows **Istanbul** content and the address bar shows `/guide/istanbul-turkiye`.
3. Tap the **menu** (⋮) → **“Install app”** or **“Add to Home screen”**.
4. Confirm the install prompt shows **Istanbul** (e.g. “Istanbul Pack”).
5. Complete install. A new icon appears on the home screen (e.g. “Istanbul Pack”).
6. **Tap the Istanbul icon.**  
   - **PASS**: App opens directly to **Istanbul** (Istanbul content, URL `/guide/istanbul-turkiye`).  
   - **FAIL**: Opens to another city or “/” or blank; or requires refresh to show Istanbul.

### 2. Install City B (e.g. Paris)

1. In Chrome (browser), go to `https://travel-packs.vercel.app/guide/paris-france`.
2. Confirm the page shows **Paris** content.
3. Tap **menu** → **“Install app”** / **“Add to Home screen”**.
4. Complete install. A **second** icon appears (e.g. “Paris Pack”).
5. **Tap the Paris icon (the new one).**  
   - **PASS**: App opens directly to **Paris** (Paris content). **No refresh.**  
   - **FAIL**: Opens to Istanbul or wrong city; or only shows Paris after refresh.

### 3. Open City A again

1. **Tap the Istanbul icon** (City A).  
   - **PASS**: App shows **Istanbul** (City A).  
   - **FAIL**: Shows Paris or another city.

### 4. Open City B again

1. **Tap the Paris icon** (City B).  
   - **PASS**: App shows **Paris** (City B).  
   - **FAIL**: Shows Istanbul or another city.

### 5. No refresh

- In steps 1–4, you must **not** need to pull-to-refresh or use a refresh control to see the correct city.  
- **PASS**: Correct city appears immediately every time.  
- **FAIL**: You had to refresh in any step to get the right city.

### 6. Navigate to "/" → SPA resets and network reloads

1. From **City A** (Istanbul) or **City B** (Paris), tap the app’s **home** link (e.g. “localcity” logo) to go to **"/"**.
2. **PASS**: The app navigates to "/", clears global state, and performs **one** full network reload (you may briefly see the homepage then reload). After that, "/" shows the catalog; no infinite reload loop.  
3. **FAIL**: No reload happens, or the page loops reloading, or "/" shows stale/cached content from the previous city.

---

## iOS Safari

### 1. Install City A (e.g. Istanbul)

1. In **Safari**, go to `https://travel-packs.vercel.app/guide/istanbul-turkiye`.
2. Confirm the page shows **Istanbul** content.
3. Tap the **Share** button → **“Add to Home Screen”**.
4. Confirm the name/title is Istanbul-related (e.g. “Istanbul Travel Pack”).
5. Tap **Add**. An icon appears on the home screen.
6. **Tap the Istanbul icon.**  
   - **PASS**: App opens in standalone mode to **Istanbul** (Istanbul content).  
   - **FAIL**: Opens to another city or “/” or requires refresh to show Istanbul.

### 2. Install City B (e.g. Paris)

1. In **Safari**, go to `https://travel-packs.vercel.app/guide/paris-france`.
2. Confirm the page shows **Paris** content.
3. Tap **Share** → **“Add to Home Screen”**.
4. Tap **Add**. A **second** icon appears (e.g. “Paris Travel Pack”).
5. **Tap the Paris icon.**  
   - **PASS**: App opens directly to **Paris** (Paris content). **No refresh.**  
   - **FAIL**: Opens to Istanbul or wrong city; or only correct after refresh.

### 3. Open City A again

1. **Tap the Istanbul icon.**  
   - **PASS**: App shows **Istanbul** (City A).  
   - **FAIL**: Shows Paris or another city.

### 4. Open City B again

1. **Tap the Paris icon.**  
   - **PASS**: App shows **Paris** (City B).  
   - **FAIL**: Shows Istanbul or another city.

### 5. No refresh

- At no step should you need to refresh to see the correct city.  
- **PASS**: Correct city every time without refresh.  
- **FAIL**: Refresh was required in any step.

### 6. Navigate to "/" → SPA resets and network reloads

1. From **City A** or **City B**, tap the app’s **home** link to go to **"/"**.
2. **PASS**: App navigates to "/", clears global state, and does **one** full network reload; "/" shows the catalog; no reload loop.  
3. **FAIL**: No reload, infinite reload, or "/" shows previous city’s stale state.

---

## Sign-Off Checklist

| Check | Android Chrome | iOS Safari |
|-------|----------------|------------|
| Install City A → opens City A | ☐ | ☐ |
| Install City B → opens City B (not City A) | ☐ | ☐ |
| Open City A again → still City A | ☐ | ☐ |
| Open City B again → still City B | ☐ | ☐ |
| Navigate to "/" → SPA resets and network reloads | ☐ | ☐ |
| No manual refresh required | ☐ | ☐ |

**Verified by:** _________________  
**Date:** _________________  
**Build / URL:** _________________

---

## If a Step Fails

- **Wrong city on open**: Confirm the SW is updated (no old SW serving cached HTML). Clear site data or uninstall both icons, then re-test from step 1.
- **Correct only after refresh**: Indicates navigation was still served from cache or wrong document; re-verify SW is built with network-only navigation and no HTML precache.
- **Same icon for both cities**: Confirm each city has its own manifest URL (e.g. `/manifests/city-istanbul-turkiye.json` vs `/manifests/city-paris-france.json`) and that Add to Home Screen was done from the correct city page.
- **"/" does not reset or reload**: Confirm HomePage runs the one-time reset (clearGlobalStateOnHome + replace). Check that the SW does not cache "/" (homepage fetch listener uses `cache: 'no-store'`).

This verification proves: each installed app launches to its own city with no refresh; "/" resets and reloads once; behavior holds on Android Chrome and iOS Safari.
