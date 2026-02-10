/**
 * Single Vite config for this project. Do not use vite.config.js.
 * PWA: generateSW + prompt; Strict network rules to prevent stale UI and JSON syntax errors.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { manifestDevPlugin } from './vite-plugin-manifest-dev';

const buildVersion = String(Date.now());
const buildTime = Date.now();

export default defineConfig({
  base: '/',
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
    __VITE_BUILD_TIME__: JSON.stringify(buildTime),
    'process.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
    __APP_VERSION__: JSON.stringify(buildVersion),
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
      registerType: 'prompt', // Better for stability than autoUpdate
      injectRegister: 'inline',
      manifest: false,
      includeManifestIcons: false,
      devOptions: { 
        enabled: true,
        type: 'module'
      },
      workbox: {
        // Incrementing CacheID to force a complete browser purge
        cacheId: 'tp-v200-ultimate-reset',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        
        // CRITICAL FIX: The Denylist prevents the SW from serving index.html when JSON is requested
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,               // Ignore API routes
          /^\/manifests\//,         // Ignore manifest paths
          /\?v=/,                   // Ignore anything with a version query (cache buster)
          /\.json$/,                // Ignore all JSON files
          /manifest/                // Ignore anything containing the word manifest
        ],

        runtimeCaching: [
          {
            // FORCE Manifests to be Network Only - No SW intervention allowed
            urlPattern: ({ url }) => url.pathname.includes('manifest') || url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            // UI Shell: Always try Network first. If it takes >3s, use cache.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'v200-ui-shell',
              expiration: { maxEntries: 1 },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // Static Assets: CacheFirst (Safe due to Vite's content hashing)
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'v200-static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
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
    sourcemap: false,
  },
});