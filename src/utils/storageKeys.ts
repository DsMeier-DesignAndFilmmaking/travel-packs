/**
 * Storage key namespacing and clear-on-home behavior for multi-city PWA installs.
 *
 * ABSOLUTE: Do NOT merge city runtime state. Each install uses only travel-packs.city.<slug>.* for that slug; never read/write another city's keys.
 *
 * KEY SCHEME
 * - All app keys use prefix "travel-packs". Home: travel-packs.home.<key>. City: travel-packs.city.<slug>.<key>.
 * - City-scoped keys are one namespace per city; not cleared on "/". Never merged across installs.
 *
 * CLEAR ON "/"
 * - When the user navigates to "/", we clear global state only: sessionStorage, lastCity, travel-packs.home.*. City keys left intact.
 */

const APP_PREFIX = 'travel-packs';

/**
 * Parses pathname to get city slug when on a city route (/guide/:slug).
 */
export function getCitySlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/guide\/([^/]+)$/);
  return match?.[1] ?? null;
}

/**
 * Builds a storage key so installs do not conflict.
 * - scope 'home': travel-packs.home.<key>
 * - scope 'city' with slug: travel-packs.city.<slug>.<key>
 */
export function getStorageKey(scope: 'home' | 'city', slug: string | null, key: string): string {
  if (scope === 'home') {
    return `${APP_PREFIX}.home.${key}`;
  }
  if (scope === 'city' && slug) {
    return `${APP_PREFIX}.city.${slug}.${key}`;
  }
  return `${APP_PREFIX}.home.${key}`;
}

const HOME_KEY_PREFIX = `${APP_PREFIX}.home.`;

/**
 * Clears global state when navigating to "/".
 * Removes legacy "lastCity", clears sessionStorage, and all travel-packs.home.* keys.
 * Does not remove city-scoped keys (travel-packs.city.<slug>.*).
 */
export function clearGlobalStateOnHome(): void {
  sessionStorage.clear();
  localStorage.removeItem('lastCity');
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(HOME_KEY_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
