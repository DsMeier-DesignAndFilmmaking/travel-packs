// api/manifest/[slug].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'City slug required' });
  }

  // Fetch city data to get the city name
  let cityName = slug;
  try {
    const cityDataUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/data/city-packs/${slug}.json`;
    const response = await fetch(cityDataUrl);
    if (response.ok) {
      const data = await response.json();
      cityName = data.city || slug;
    }
  } catch (error) {
    console.error('Error fetching city data:', error);
  }

  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
  const cityPath = `/city/${slug}`;
  const startUrl = `${origin}${cityPath}`;

  const manifest = {
    id: cityPath,
    name: `${cityName} Travel Pack`,
    short_name: cityName,
    description: `Offline-first travel guide for ${cityName}`,
    start_url: startUrl,
    scope: startUrl,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: `${origin}/pwa-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: `${origin}/pwa-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  // Set proper headers to prevent caching
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  return res.status(200).json(manifest);
}