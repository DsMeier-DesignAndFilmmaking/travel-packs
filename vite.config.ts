import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 1. Point to your custom logic in src/sw.js
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js', 
      registerType: 'autoUpdate',
      
      // 2. Fix the "SyntaxError: Cannot use import statement" error
      devOptions: { 
        enabled: true,
        type: 'module' // This is the magic line for dev mode imports
      },

      // 3. PWA Identity
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

      // 4. Configuration for the injection process
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Increase limit if your city-pack JSONs are large
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 
      }
    })
  ],
  resolve: {
    alias: { '@': '/src' }
  }
});