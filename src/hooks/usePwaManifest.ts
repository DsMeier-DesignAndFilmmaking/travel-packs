/**
 * usePwaManifest — Delegates to the dynamic manifest utility for /city/* routes.
 * On unmount or when not on a city route, ensures no manifest (home safety).
 */

import { useEffect } from 'react';
import { injectCityManifest, setHomeHead } from '@/utils/dynamicManifest';

export interface UsePwaManifestOptions {
  /** Page title (e.g. "Paris Travel Pack"). Used for manifest name/short_name and document.title */
  title: string;
  /** Current path (e.g. "/city/london"). Must be a /city/:slug path for manifest to be injected. */
  path: string;
}

/**
 * Injects city-scoped manifest when path is /city/:slug; removes manifest and sets home head otherwise.
 * Use on city detail views to sync manifest with loaded pack data (e.g. real city name).
 */
export function usePwaManifest({ title, path }: UsePwaManifestOptions): void {
  useEffect(() => {
    const cityMatch = path.match(/^\/city\/([^/]+)$/);
    const citySlug = cityMatch?.[1];
    if (citySlug) {
      const cityName = title.replace(/\s+Travel Pack$/, '') || citySlug.replace(/-/g, ' ');
      injectCityManifest({ citySlug, cityName });
      return () => setHomeHead();
    }
    setHomeHead();
  }, [title, path]);
}
