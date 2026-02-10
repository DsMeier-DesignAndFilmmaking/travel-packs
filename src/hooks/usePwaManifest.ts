/**
 * usePwaManifest — Delegates to the dynamic manifest utility for /guide/* routes.
 * On unmount or when not on a city route, ensures no manifest (home safety).
 */

import { useEffect } from 'react';
import { injectCityManifest, setHomeHead } from '@/utils/dynamicManifest';

export interface UsePwaManifestOptions {
  /** Page title (e.g. "Paris Travel Pack"). Used for manifest name/short_name and document.title */
  title: string;
  /** Current path (e.g. "/guide/london"). Must be a /guide/:slug path for manifest to be injected. */
  path: string;
}

/**
 * Injects city-scoped manifest when path is /guide/:slug; removes manifest and sets home head otherwise.
 * Use on city detail views to sync manifest with loaded pack data (e.g. real city name).
 */
export function usePwaManifest({ title, path }: UsePwaManifestOptions): void {
  useEffect(() => {
    const cityMatch = path.match(/^\/guide\/([^/]+)$/);
    const citySlug = cityMatch?.[1];
    if (citySlug) {
      const cityName = title.replace(/\s+Travel Pack$/, '') || citySlug.replace(/-/g, ' ');
      injectCityManifest({ citySlug, cityName });
      return () => setHomeHead();
    }
    setHomeHead();
  }, [title, path]);
}
