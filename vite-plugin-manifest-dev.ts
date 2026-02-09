/**
 * Vite plugin: serve city manifests at /manifests/city-:slug.json in development.
 * Matches Vercel rewrite so the same path works in dev and prod; avoids manifest
 * "Syntax Error" when the dev server would otherwise return HTML (SPA fallback).
 */

import type { Plugin } from 'vite';

const MANIFEST_PREFIX = '/manifests/city-';
const MANIFEST_SUFFIX = '.json';

export function manifestDevPlugin(): Plugin {
  return {
    name: 'manifest-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (req.method !== 'GET' || !url.startsWith(MANIFEST_PREFIX) || !url.endsWith(MANIFEST_SUFFIX)) {
          return next();
        }
        const slug = url.slice(MANIFEST_PREFIX.length, -MANIFEST_SUFFIX.length);
        if (!slug) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'City slug required' }));
          return;
        }
        const origin = `http://${req.headers.host ?? 'localhost:5173'}`;
        const cityPath = `/city/${slug}`;
        let cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        const dataUrl = `${origin}/data/city-packs/${slug}.json`;
        fetch(dataUrl)
          .then((r) => (r.ok ? r.json() : null))
          .then((data: { city?: string } | null) => {
            if (data?.city) cityName = data.city;
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
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/manifest+json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(JSON.stringify(manifest));
          })
          .catch(() => {
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
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/manifest+json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(JSON.stringify(manifest));
          });
      });
    },
  };
}
