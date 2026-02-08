/**
 * Dynamic manifest utilities for A2HS (Add to Home Screen).
 * Updates <link rel="manifest">, canonical, og:url, and document.title so the
 * share sheet and install flow use the current city pack URL and title.
 */

const DEFAULT_MANIFEST_HREF = '/manifest.webmanifest';
const DEFAULT_TITLE = 'Local City Travel Packs';

/**
 * Updates the document head for a specific route (e.g. city pack detail).
 * Call when city data is loaded so A2HS captures the correct URL and title.
 *
 * @param path - Current path for start_url (e.g. window.location.pathname)
 * @param options - Optional title override (e.g. city name from pack data)
 */
export function updateDynamicManifest(
  path: string,
  options?: { title?: string }
): void {
  const origin = window.location.origin;
  const search = window.location.search || '';
  const pathWithSearch = path + search;
  const currentUrl = origin + pathWithSearch;

  const manifestHref = `/api/dynamic-manifest?start_url=${encodeURIComponent(path)}`;

  let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
  if (manifestLink) {
    manifestLink.href = manifestHref;
  } else {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestHref;
    document.head.appendChild(manifestLink);
  }

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (canonicalLink) {
    canonicalLink.href = currentUrl;
  } else {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = currentUrl;
    document.head.appendChild(canonicalLink);
  }

  let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
  if (ogUrl) {
    ogUrl.content = currentUrl;
  } else {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = currentUrl;
    document.head.appendChild(ogUrl);
  }

  if (options?.title) {
    document.title = options.title;
  }
}

/**
 * Resets manifest, canonical, and title to the app default (home).
 * Call on unmount of the city detail view or when navigating back to home
 * so home screen icons are not left pointing at a specific city.
 */
export function resetDynamicManifestToDefault(): void {
  const origin = window.location.origin;
  const homeUrl = origin + '/';

  let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
  if (manifestLink) {
    manifestLink.href = DEFAULT_MANIFEST_HREF;
  } else {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = DEFAULT_MANIFEST_HREF;
    document.head.appendChild(manifestLink);
  }

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (canonicalLink) {
    canonicalLink.href = homeUrl;
  } else {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = homeUrl;
    document.head.appendChild(canonicalLink);
  }

  let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
  if (ogUrl) {
    ogUrl.content = homeUrl;
  } else {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = homeUrl;
    document.head.appendChild(ogUrl);
  }

  document.title = DEFAULT_TITLE;

  let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement | null;
  if (appleTitle) {
    appleTitle.content = DEFAULT_TITLE;
  } else {
    appleTitle = document.createElement('meta');
    appleTitle.name = 'apple-mobile-web-app-title';
    appleTitle.content = DEFAULT_TITLE;
    document.head.appendChild(appleTitle);
  }
}
