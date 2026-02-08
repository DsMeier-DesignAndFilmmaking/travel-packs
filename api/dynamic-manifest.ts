// api/dynamic-manifest.ts
// Serves a Web App Manifest with start_url derived from the request (Referer or query).
// When the user is on /city/london and taps "Add to Home Screen", the browser fetches
// this URL with Referer set to the current page, so we return a manifest that opens
// directly to /city/london.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

  // 1. Prefer explicit query param (e.g. /api/dynamic-manifest?start_url=/city/london)
  let path = typeof req.query.start_url === 'string' ? req.query.start_url : null;

  // 2. Otherwise use Referer so the manifest reflects the page that requested it (A2HS flow)
  if (!path && req.headers.referer) {
    try {
      const refererUrl = new URL(req.headers.referer);
      // Only use same-origin Referer
      const requestHost = req.headers.host || '';
      if (refererUrl.origin === `${req.headers['x-forwarded-proto'] || 'https'}://${requestHost}`) {
        path = refererUrl.pathname || '/';
      }
    } catch {
      path = null;
    }
  }

  const startPath = path && path.startsWith('/') ? path : '/';
  const startUrl = `${origin}${startPath}`;

  // City-specific name/short_name when path is /city/:slug
  const cityMatch = startPath.match(/^\/city\/([^/]+)$/);
  let name = 'Local City Travel Packs';
  let shortName = 'Travel Packs';
  let description = 'Offline-first city travel packs platform.';

  if (cityMatch) {
    const slug = cityMatch[1];
    shortName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
    name = `${shortName} Travel Pack`;
    description = `Offline-first travel guide for ${shortName}`;
    try {
      const cityDataUrl = `${origin}/data/city-packs/${slug}.json`;
      const response = await fetch(cityDataUrl);
      if (response.ok) {
        const data = await response.json();
        const cityName = data.city || shortName;
        name = `${cityName} Travel Pack`;
        shortName = cityName;
        description = `Offline-first travel guide for ${cityName}`;
      }
    } catch (error) {
      console.error('Error fetching city data for manifest:', error);
    }
  }

  const manifest = {
    id: startPath,
    name,
    short_name: shortName,
    description,
    start_url: startUrl,
    scope: `${origin}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      { src: `${origin}/pwa-192x192.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: `${origin}/pwa-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.status(200).json(manifest);
}
