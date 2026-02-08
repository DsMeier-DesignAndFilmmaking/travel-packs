/**
 * usePwaManifest - Fixes A2HS (Add to Home Screen) URL/title for detail views.
 * Generates a dynamic manifest as a Blob URL so the browser sees a fresh manifest
 * and uses the correct start_url and name for the current page.
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

function ensureManifestLink(): HTMLLinkElement {
  let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }
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

function resetManifestAndHeadToDefault(): void {
  const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
  if (link) link.href = DEFAULT_MANIFEST_HREF;
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
    const blobUrl = URL.createObjectURL(blob);

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = blobUrl;

    const manifestLink = ensureManifestLink();
    manifestLink.href = blobUrl;

    ensureCanonicalLink(currentUrl);
    ensureOgUrl(currentUrl);
    document.title = title;

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      resetManifestAndHeadToDefault();
    };
  }, [title, path]);
}
