// api/manifest/[slug].ts
// Serves manifest per city at /manifests/city-{slug}.json (Vercel rewrite).
// Slug-based approach only. buildId and cache headers ensure A2HS launch bypasses stale SW cache.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const buildId = Date.now();
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'City slug required' });
  }

  let cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || '';
    const cityDataUrl = `${proto}://${host}/data/city-packs/${slug}.json`;
    const response = await fetch(cityDataUrl);
    if (response.ok) {
      const data = await response.json();
      cityName = data.city || cityName;
    }
  } catch (error) {
    console.error('Error fetching city data for manifest:', error);
  }

  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
  const startUrl = `/city/${slug}?utm_source=homescreen&v=${buildId}`;

  const manifest = {
    id: `city-pack-${slug}`,
    name: `${cityName} Travel Pack`,
    short_name: `${cityName} Pack`,
    description: `Offline-first travel guide for ${cityName}`,
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      { src: `${origin}/pwa-192x192.png?v=${buildId}`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: `${origin}/pwa-512x512.png?v=${buildId}`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.status(200).json(manifest);
}
