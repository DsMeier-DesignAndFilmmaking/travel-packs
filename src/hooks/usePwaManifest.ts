/**
 * usePwaManifest - A2HS deep-link fix for /city/:slug.
 *
 * AUDIT: Sources of "Travel Packs" / root URL during install (all addressed):
 * - public/manifest.webmanifest: used only when link href is /manifest.webmanifest (home).
 *   On city pages we never point the link here; we use a Data URI with id=pathname.
 * - index.html: apple-mobile-web-app-title and title are overridden by inline script
 *   for /city/:slug before React, so first paint shows the city name.
 * - Vite: manifest: false, no auto-injected manifest link.
 * - SW: NavigationRoute serves index.html; request URL is preserved (no path strip).
 *
 * Single manifest link: getOrCreateSingleManifestLink() removes duplicates and returns one.
 * Manifest id: set to window.location.pathname so the browser does not merge with home PWA.
 */

import { useEffect } from 'react';

const DEFAULT_MANIFEST_HREF = '/manifest.webmanifest';
const DEFAULT_TITLE = 'Local City Travel Packs';

const BASE_MANIFEST = {
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#0f172a',
  icons: [
    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
} as const;

/**
 * Ensures exactly ONE <link rel="manifest"> in the DOM. Removes duplicates, returns the single link.
 */
function getOrCreateSingleManifestLink(): HTMLLinkElement {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]');
  const first = links[0] ?? null;
  for (let i = 1; i < links.length; i++) {
    const el = links[i];
    if (el) el.remove();
  }
  if (first) return first;
  const link = document.createElement('link');
  link.rel = 'manifest';
  document.head.appendChild(link);
  return link;
}

/** Base64 Data URI for manifest so iOS Safari can read it during A2HS (no Blob fetch). */
function manifestToDataUri(manifest: object): string {
  const json = JSON.stringify(manifest);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return `data:application/manifest+json;base64,${base64}`;
}

function ensureCanonicalLink(href: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (link) {
    link.href = href;
  } else {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.href = href;
    document.head.appendChild(link);
  }
}

function ensureOgUrl(content: string): void {
  let meta = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
  if (meta) {
    meta.content = content;
  } else {
    meta = document.createElement('meta');
    meta.setAttribute('property', 'og:url');
    meta.content = content;
    document.head.appendChild(meta);
  }
}

function ensureAppleTouchIcon(href: string): void {
  let link = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
  if (link) {
    link.href = href;
  } else {
    link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = href;
    document.head.appendChild(link);
  }
}

/** Set apple-mobile-web-app-title so iOS shows the city name in the standalone app. */
function ensureAppleMobileWebAppTitle(title: string): void {
  let meta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement | null;
  if (meta) {
    meta.content = title;
  } else {
    meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-title';
    meta.content = title;
    document.head.appendChild(meta);
  }
}

/**
 * Resets manifest to the standard Vite/static path and head to default (home).
 * Creates the manifest link if it doesn't exist (e.g. initial load on home).
 */
function resetManifestAndHeadToDefault(): void {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]');
  let first = links[0];
  for (let i = 1; i < links.length; i++) {
    const el = links[i];
    if (el) el.remove();
  }
  if (first) {
    first.href = DEFAULT_MANIFEST_HREF;
  } else {
    first = document.createElement('link');
    first.rel = 'manifest';
    first.href = DEFAULT_MANIFEST_HREF;
    document.head.appendChild(first);
  }
  const origin = window.location.origin;
  const homeUrl = origin + '/';
  ensureCanonicalLink(homeUrl);
  ensureOgUrl(homeUrl);
  ensureAppleTouchIcon(origin + '/pwa-192x192.png');
  ensureAppleMobileWebAppTitle(DEFAULT_TITLE);
  document.title = DEFAULT_TITLE;
}

export interface UsePwaManifestOptions {
  /** Page title (e.g. "Paris Travel Pack"). Used for manifest name/short_name and document.title */
  title: string;
  /** Current path (e.g. "/city/london"). start_url will be origin + path. */
  path: string;
}

/**
 * Updates the Web App Manifest to a Blob URL with the given start_url and title,
 * and keeps document.title and canonical in sync for iOS Share / A2HS.
 * On unmount, revokes the Blob URL and resets the manifest to the default.
 */
export function usePwaManifest({ title, path }: UsePwaManifestOptions): void {
  useEffect(() => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const startUrl = window.location.href;
    const currentUrl = origin + pathname + (window.location.search || '');

    const version = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const manifest = {
      ...BASE_MANIFEST,
      id: pathname,
      name: title,
      short_name: title,
      description: `Offline-first travel guide for ${title.replace(/\s+Travel Pack$/, '')}`,
      start_url: startUrl,
      scope: origin + '/',
      version,
    };

    const manifestLink = getOrCreateSingleManifestLink();
    manifestLink.href = manifestToDataUri(manifest);

    ensureCanonicalLink(currentUrl);
    ensureOgUrl(currentUrl);
    document.title = title;
    ensureAppleTouchIcon(origin + '/pwa-192x192.png?v=' + encodeURIComponent(pathname));
    ensureAppleMobileWebAppTitle(title);

    return () => {
      resetManifestAndHeadToDefault();
    };
  }, [title, path]);
}
