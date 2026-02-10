/**
 * Dynamic Manifest Injection — city-scoped PWA with UNIQUE, STABLE, REAL manifest URLs.
 *
 * ABSOLUTE: Do NOT use Blob URLs or data URIs for manifest href. Only real HTTP URLs: /manifests/city-{slug}.json
 *
 * - Only /guide/* routes get a manifest link.
 * - Each city = separate app identity so installs do not collapse to the first city.
 * - Homepage "/" has no manifest link (setHomeHead removes it).
 */

const DEFAULT_TITLE = 'Local City Travel Packs';

/** Stable, unique manifest URL per city. Real HTTP URL — never Blob or data URI. */
export function getCityManifestUrl(citySlug: string): string {
  return `/manifests/city-${citySlug}.json`;
}

export interface InjectCityManifestOptions {
  citySlug: string;
  cityName: string;
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
 * Injects a city-scoped manifest link into <head> using a REAL URL only.
 * href = /manifests/city-{slug}.json (served by Vercel API). No Blob/data URI.
 * Only call on /guide/* routes.
 */
export function injectCityManifest(options: InjectCityManifestOptions): void {
  const href = getCityManifestUrl(options.citySlug);

  removeManifest();
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = href;
  document.head.appendChild(link);

  const origin = window.location.origin;
  const path = `/guide/${options.citySlug}`;
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
