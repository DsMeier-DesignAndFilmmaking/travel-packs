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
      registerType: 'autoUpdate',
      // 'auto' works with manual link updates; use null/false only if you register the SW yourself.
      injectRegister: 'auto',
      // Base manifest: start_url stays "/" so the plugin's default isn't fighting our dynamic updates.
      // usePwaManifest updates the same <link rel="manifest"> href for city packs (blob) and resets to /manifest.webmanifest on leave.
      manifest: {
        start_url: '/',
      },

      devOptions: {
        enabled: true,
        type: 'module'
      },

      injectManifest: {
        // PRE-CACHE ONLY THE CORE APP SHELL (static files only).
        // Dynamic blob: manifest URLs from usePwaManifest are client-side only and
        // are never part of the precache manifest, so the SW does not try to cache them.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        globIgnores: ['**/city-data/*.json', '**/city-assets/*.jpg'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
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