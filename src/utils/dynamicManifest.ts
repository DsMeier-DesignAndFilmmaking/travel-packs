/**
 * Dynamic Manifest Injection System — city-scoped PWA only.
 *
 * - Only /city/* routes get a manifest (injected at runtime).
 * - Homepage "/" has NO manifest link; installation is impossible.
 * - Each city route defines its own start_url and scope.
 */

const DEFAULT_TITLE = 'Local City Travel Packs';

const DEFAULT_ICONS = [
  { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' as const, purpose: 'any maskable' as const },
  { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' as const, purpose: 'any maskable' as const },
];

export interface InjectCityManifestOptions {
  citySlug: string;
  cityName: string;
  /** Optional; defaults to /pwa-192x192.png and /pwa-512x512.png */
  icons?: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
}

/**
 * Generates a valid Web App Manifest for a city route.
 * start_url and scope = /city/{slug}. Only for use on /city/* routes.
 */
export function buildCityManifest(options: InjectCityManifestOptions): Record<string, unknown> {
  const { citySlug, cityName, icons = DEFAULT_ICONS } = options;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = `/city/${citySlug}`;
  const startUrl = `${origin}${path}`;
  const name = `${cityName} Travel Pack`;
  return {
    id: path,
    name,
    short_name: cityName,
    description: `Offline-first travel guide for ${cityName}`,
    start_url: startUrl,
    scope: startUrl,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons,
  };
}

/** Base64 Data URI for manifest (iOS Safari can use it during A2HS without a separate fetch). */
function manifestToDataUri(manifest: object): string {
  const json = JSON.stringify(manifest);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return `data:application/manifest+json;base64,${base64}`;
}

/**
 * Removes every <link rel="manifest"> from the document head.
 * Call when route === "/" so the homepage has no manifest and cannot be installed.
 */
export function removeManifest(): void {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]');
  links.forEach((el) => el.remove());
}

/**
 * Injects a city-scoped manifest into <head>, replacing any existing manifest link.
 * Only call this on /city/* routes.
 * Uses a data URI so the manifest is available immediately for iOS Share / A2HS.
 */
export function injectCityManifest(options: InjectCityManifestOptions): void {
  const manifest = buildCityManifest(options);
  const href = manifestToDataUri(manifest);

  removeManifest();
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = href;
  document.head.appendChild(link);

  const origin = window.location.origin;
  const path = `/city/${options.citySlug}`;
  const currentUrl = origin + path + (window.location.search || '');

  ensureCanonicalLink(currentUrl);
  ensureOgUrl(currentUrl);
  ensureAppleMobileWebAppTitle(`${options.cityName} Travel Pack`);
  document.title = `${options.cityName} Travel Pack`;
}

function ensureCanonicalLink(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (link) link.href = href;
  else {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.href = href;
    document.head.appendChild(link);
  }
}

function ensureOgUrl(content: string): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
  if (meta) meta.content = content;
  else {
    meta = document.createElement('meta');
    meta.setAttribute('property', 'og:url');
    meta.content = content;
    document.head.appendChild(meta);
  }
}

function ensureAppleMobileWebAppTitle(title: string): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
  if (meta) meta.content = title;
  else {
    meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-title';
    meta.content = title;
    document.head.appendChild(meta);
  }
}

/**
 * Sets document head for homepage: no manifest, canonical and title for "/".
 * Call when route === "/". Ensures no manifest link exists.
 */
export function setHomeHead(): void {
  removeManifest();
  const origin = window.location.origin;
  const homeUrl = origin + '/';
  ensureCanonicalLink(homeUrl);
  ensureOgUrl(homeUrl);
  ensureAppleMobileWebAppTitle(DEFAULT_TITLE);
  document.title = DEFAULT_TITLE;
}
