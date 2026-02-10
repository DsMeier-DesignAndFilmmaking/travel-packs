/**
 * Single Vite config for this project. Do not use vite.config.js.
 * PWA: registerType 'prompt' is required so the browser detects new versions and asks the user to refresh (fixes stale UI).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { manifestDevPlugin } from './vite-plugin-manifest-dev';

const buildVersion = process.env.BUILD_ENV === 'dev' ? 'dev' : String(Date.now());
const buildTime = Date.now();

export default defineConfig({
  base: '/',
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
    __VITE_BUILD_TIME__: JSON.stringify(buildTime),
    'process.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
  },
  plugins: [
    manifestDevPlugin(),
    react(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      png: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 60 },
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      injectRegister: null,
      manifest: false,
      includeManifestIcons: false,
      // Manifest: not generated here. Vercel rewrites /manifests/city-:slug.json → /api/manifest/:slug; city pages use Blob manifest in CityPackDetailView.
      devOptions: { enabled: true, type: 'module' },
      injectManifest: {
        globPatterns: [],
        globIgnores: ['**/*'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      workbox: {
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api\//, /^\/_/, /\.(?:json|png|jpg|webmanifest)(?:\?|$)/],
        dontCacheBustURLsMatching: /\/assets\//,
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        // Mirrors routing in src/sw.js: /city/* and navigate use NetworkFirst so UI is pulled from Vercel first.
        runtimeCaching: [
          {
            urlPattern: /\/city\/[^/]+\/?(\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'city-pages-v1',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'navigate-cache-v1',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
