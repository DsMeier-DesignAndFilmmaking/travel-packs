// api/manifest/[slug].ts
// Serves a unique, stable manifest per city at /manifests/city-{slug}.json (via Vercel rewrite).
// Each city is a separate installable app identity; no shared manifest URL.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  const cityPath = `/city/${slug}`;

  const manifest = {
    id: cityPath,
    name: `${cityName} Travel Pack`,
    short_name: `${cityName} Pack`,
    description: `Offline-first travel guide for ${cityName}`,
    start_url: cityPath,
    scope: cityPath,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      { src: `${origin}/pwa-192x192.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: `${origin}/pwa-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).json(manifest);
}