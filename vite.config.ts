/**
 * Single Vite config for this project. Do not use vite.config.js.
 * PWA: generateSW + autoUpdate; cache ID rotated to kill old cached versions.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { manifestDevPlugin } from './vite-plugin-manifest-dev';

const buildVersion = process.env.BUILD_ENV === 'dev' ? 'dev' : String(Date.now());
const buildTime = Date.now();
const appVersion = Date.now();

export default defineConfig({
  base: '/',
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
    __VITE_BUILD_TIME__: JSON.stringify(buildTime),
    'process.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
    __APP_VERSION__: JSON.stringify(appVersion),
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
      strategies: 'generateSW',
      registerType: 'prompt',
      injectRegister: 'inline',
      manifest: false,
      includeManifestIcons: false,
      devOptions: { 
        enabled: true,
        type: 'module'
      },

      workbox: {
        // FIX: 'cacheId' is the correct property for top-level naming in GenerateSW
        cacheId: 'tp-v120-data-audit',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        
        // Ensures SPAs handle routing correctly without a blank screen
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/manifests\//],

        runtimeCaching: [
          {
            // Manifests: never cache (avoid 304); dynamic API and legacy path
            urlPattern: /^\/api\/manifest\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^\/manifests\//,
            handler: 'NetworkOnly',
          },
          {
            // Index.html: NetworkFirst with short timeout so UI updates; cache only when offline/slow
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'v120-index-html',
              expiration: { maxEntries: 1 },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // JS/CSS: CacheFirst safe (Vite hashes filenames, e.g. index-KtJFv4Jy.js)
            urlPattern: /\/assets\/.*\.(js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'v120-hashed-assets',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 365 },
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