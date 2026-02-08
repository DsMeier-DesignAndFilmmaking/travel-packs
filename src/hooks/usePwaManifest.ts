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

/**
 * Resets manifest to the standard Vite/static path and head to default (home).
 * Must run on unmount so the A2HS panel returns to "Global App" and no blob refs remain.
 * Collapses to a single manifest link to avoid leaving duplicates (e.g. from HMR).
 */
function resetManifestAndHeadToDefault(): void {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]');
  const first = links[0];
  for (let i = 1; i < links.length; i++) {
    const el = links[i];
    if (el) el.remove();
  }
  if (first) {
    first.href = DEFAULT_MANIFEST_HREF;
  }
  const origin = window.location.origin;
  const homeUrl = origin + '/';
  ensureCanonicalLink(homeUrl);
  ensureOgUrl(homeUrl);
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
    const startUrl = origin + path;
    const currentUrl = origin + path + (window.location.search || '');

    const manifest = {
      ...BASE_MANIFEST,
      id: path,
      name: title,
      short_name: title,
      description: `Offline-first travel guide for ${title.replace(/\s+Travel Pack$/, '')}`,
      start_url: startUrl,
      scope: origin + '/',
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
