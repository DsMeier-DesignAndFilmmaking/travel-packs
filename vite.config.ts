/**
 * Single Vite config for this project. Do not use vite.config.js.
 * PWA: generateSW + autoUpdate; cache name rotated to kill old cached versions.
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
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      manifest: false,
      includeManifestIcons: false,
      devOptions: { enabled: true },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/manifests\//],
        runtimeCaching: [
          {
            urlPattern: /^\/manifests\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'v10-final-reset-shell',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 1 },
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
