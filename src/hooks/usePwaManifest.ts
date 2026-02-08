/**
 * usePwaManifest - Fixes A2HS (Add to Home Screen) URL/title for detail views.
 * Generates a dynamic manifest as a Blob URL so the browser sees a fresh manifest
 * and uses the correct start_url and name for the current page.
 *
 * Vite/SPA: Cleanup must revoke blob URLs and reset the manifest link on unmount,
 * since navigation does not reload the page and unreleased blobs cause memory leaks.
 * We always update the existing manifest link (never create duplicates) so
 * vite-plugin-pwa / HMR re-injection doesn't leave multiple <link rel="manifest"> tags.
 */

import { useEffect, useRef } from 'react';

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
 * Returns the single manifest link to use. Removes any duplicates (e.g. from HMR)
 * and updates the first one, or creates one if none exist. Ensures we never have
 * multiple <link rel="manifest"> tags.
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
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const startUrl = window.location.href;
    const currentUrl = origin + pathname + (window.location.search || '');

    // Unique version so the browser never uses a cached previous manifest during A2HS.
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

    const json = JSON.stringify(manifest);
    const blob = new Blob([json], { type: 'application/manifest+json' });
    const manifestUrl = URL.createObjectURL(blob);

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = manifestUrl;

    const manifestLink = getOrCreateSingleManifestLink();
    manifestLink.href = manifestUrl;

    ensureCanonicalLink(currentUrl);
    ensureOgUrl(currentUrl);
    document.title = title;
    ensureAppleTouchIcon(origin + '/pwa-192x192.png?v=' + encodeURIComponent(pathname));
    ensureAppleMobileWebAppTitle(title);

    return () => {
      const urlToRevoke = blobUrlRef.current;
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
        blobUrlRef.current = null;
      }
      resetManifestAndHeadToDefault();
    };
  }, [title, path]);
}
