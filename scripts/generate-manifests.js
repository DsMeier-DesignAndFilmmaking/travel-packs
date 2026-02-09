/**
 * Generates static manifest JSON files for each city pack so that
 * /manifests/city-{slug}.json exists in the build output. This prevents
 * 404/Syntax Error when the manifest is requested (e.g. Add to Home Screen).
 * Path remains strictly /manifests/city-${slug}.json; city-specific A2HS is unchanged.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsDir = join(__dirname, '..', 'public', 'data', 'city-packs');
const outDir = join(__dirname, '..', 'public', 'manifests');

mkdirSync(outDir, { recursive: true });

const files = readdirSync(packsDir).filter((f) => f.endsWith('.json') && f !== 'index.json');

for (const file of files) {
  const slug = file.replace(/\.json$/, '');
  let cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  try {
    const raw = readFileSync(join(packsDir, file), 'utf8');
    const data = JSON.parse(raw);
    if (data.city) cityName = data.city;
  } catch (e) {
    console.warn('generate-manifests: skip', file, e.message);
    continue;
  }

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
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  const outPath = join(outDir, `city-${slug}.json`);
  writeFileSync(outPath, JSON.stringify(manifest, null, 0), 'utf8');
  console.log('Wrote', outPath);
}

console.log('Manifests generated in public/manifests/');
