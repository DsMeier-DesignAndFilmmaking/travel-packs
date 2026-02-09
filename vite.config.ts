/**
 * Sole Vite config for this project. Use this file only (no vite.config.js).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      png: { quality: 80 },
      // 'lossy' is not a valid key; simply setting a quality level 
      // implies lossy compression.
      webp: { quality: 80 }, 
      avif: { quality: 60 },
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      injectRegister: 'inline',
      manifest: false,
      includeManifestIcons: false,
      devOptions: { enabled: true, type: 'module' },
      injectManifest: {
        // ABSOLUTE: DO NOT cache HTML. No app shell precache. globPatterns: [] → precache 0 entries.
        globPatterns: [],
        globIgnores: ['**/*'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      workbox: {
        // ABSOLUTE: DO NOT use navigationFallback. No app shell fallback.
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api\//, /^\/_/, /\.(?:json|png|jpg|webmanifest)(?:\?|$)/],
        dontCacheBustURLsMatching: /\/assets\//,
      },
    })
  ],
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});