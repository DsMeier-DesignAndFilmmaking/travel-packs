import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Force absolute paths for all assets
  base: '/', 
  plugins: [
    react(),
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
        display: 'standalone',
        scope: '/',
        start_url: '/',
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 
      }
    })
  ],
  resolve: {
    alias: { '@': '/src' }
  },
  // Added: Ensure clean builds for Vercel
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});