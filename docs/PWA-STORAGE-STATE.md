# PWA storage and cross-app state

This app supports multiple independent city installs (e.g. Paris and Istanbul as separate PWAs). Storage must be namespaced so installs do not share or overwrite each other, and global state must be cleared when the user navigates to "/" so the next city install gets a clean runtime.

## Key scheme

- **Prefix:** All app keys use `travel-packs` so they do not conflict with other origins.
- **Home (global):** `travel-packs.home.<key>` — e.g. `travel-packs.home.resetDone`. Cleared when navigating to "/".
- **City-scoped:** `travel-packs.city.<slug>.<key>` — e.g. `travel-packs.city.paris.downloaded.v1`. One namespace per city; not cleared on "/".

Implementations use `src/utils/storageKeys.ts`: `getStorageKey('home' | 'city', slug, key)` and `getCitySlugFromPath(pathname)`.

## Clear on "/"

When the user navigates to the homepage "/":

1. **sessionStorage** is cleared.
2. **Legacy** `lastCity` is removed.
3. **All** `travel-packs.home.*` keys are removed.
4. **City keys** `travel-packs.city.<slug>.*` are left intact so each install keeps its own data (e.g. downloaded pack).

This is implemented in `clearGlobalStateOnHome()` and invoked from `HomePage` before the one-time network reload on "/".

## IndexedDB

The app does not currently use IndexedDB. If added later, use DB or store names that include the city slug for city-scoped data (e.g. `travel-packs-city-<slug>`) and avoid a single global DB that would be shared by all installs.
