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
      webp: { lossy: true, quality: 80 },
      avif: { quality: 60 },
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js', 
      registerType: 'autoUpdate',
      devOptions: { 
        enabled: true,
        type: 'module' 
      },
      manifest: {
        name: 'Local City Travel Packs',
        short_name: 'Travel Packs',
        description: 'Offline-first city travel packs platform.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        start_url: '.',
        display: 'standalone',
        scope: '/',
        
        icons: [
          { 
            src: '/pwa-192x192.png', 
            sizes: '192x192', 
            type: 'image/png',
            purpose: 'any maskable' 
          },
          { 
            src: '/pwa-512x512.png', 
            sizes: '512x512', 
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      injectManifest: {
        // PRE-CACHE ONLY THE CORE APP SHELL
        // We exclude specific city JSON/Images so they aren't downloaded on home page load
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/city-data/*.json', '**/city-assets/*.jpg'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 
      }
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