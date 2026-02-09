# PWA Multi-Install Verification (Mandatory)

Use this checklist to prove that each installed city app opens to its own city with **no refresh required**, on **iOS Safari** and **Android Chrome**.

---

## Prerequisites

- Deployed app: `https://travel-packs.vercel.app/` (or your deployment URL)
- **iOS**: Safari (Add to Home Screen uses Safari)
- **Android**: Chrome
- Two different city pages, e.g.:
  - **City A**: Istanbul — `/city/istanbul-turkiye`
  - **City B**: Paris — `/city/paris-france`

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

1. In Chrome, go to `https://travel-packs.vercel.app/city/istanbul-turkiye`.
2. Confirm the page shows **Istanbul** content and the address bar shows `/city/istanbul-turkiye`.
3. Tap the **menu** (⋮) → **“Install app”** or **“Add to Home screen”**.
4. Confirm the install prompt shows **Istanbul** (e.g. “Istanbul Pack”).
5. Complete install. A new icon appears on the home screen (e.g. “Istanbul Pack”).
6. **Tap the Istanbul icon.**  
   - **PASS**: App opens directly to **Istanbul** (Istanbul content, URL `/city/istanbul-turkiye`).  
   - **FAIL**: Opens to another city or “/” or blank; or requires refresh to show Istanbul.

### 2. Install City B (e.g. Paris)

1. In Chrome (browser), go to `https://travel-packs.vercel.app/city/paris-france`.
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

---

## iOS Safari

### 1. Install City A (e.g. Istanbul)

1. In **Safari**, go to `https://travel-packs.vercel.app/city/istanbul-turkiye`.
2. Confirm the page shows **Istanbul** content.
3. Tap the **Share** button → **“Add to Home Screen”**.
4. Confirm the name/title is Istanbul-related (e.g. “Istanbul Travel Pack”).
5. Tap **Add**. An icon appears on the home screen.
6. **Tap the Istanbul icon.**  
   - **PASS**: App opens in standalone mode to **Istanbul** (Istanbul content).  
   - **FAIL**: Opens to another city or “/” or requires refresh to show Istanbul.

### 2. Install City B (e.g. Paris)

1. In **Safari**, go to `https://travel-packs.vercel.app/city/paris-france`.
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

---

## Sign-Off Checklist

| Check | Android Chrome | iOS Safari |
|-------|-----------------|------------|
| Install City A → opens City A | ☐ | ☐ |
| Install City B → opens City B | ☐ | ☐ |
| Open City A again → City A | ☐ | ☐ |
| Open City B again → City B | ☐ | ☐ |
| No refresh required | ☐ | ☐ |

**Verified by:** _________________  
**Date:** _________________  
**Build / URL:** _________________

---

## If a Step Fails

- **Wrong city on open**: Confirm the SW is updated (no old SW serving cached HTML). Clear site data or uninstall both icons, then re-test from step 1.
- **Correct only after refresh**: Indicates navigation was still served from cache or wrong document; re-verify SW is built with network-only navigation and no HTML precache.
- **Same icon for both cities**: Confirm each city has its own manifest URL (e.g. `/manifests/city-istanbul-turkiye.json` vs `/manifests/city-paris-france.json`) and that Add to Home Screen was done from the correct city page.

This verification proves the multi-install fix: each installed app launches to its own city with no refresh, on iOS Safari and Android Chrome.
