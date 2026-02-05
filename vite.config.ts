import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),

    // --- PWA ---
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js', // output sw.js to public
      injectManifest: {
        // Workbox injectManifest options
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      registerType: 'autoUpdate',
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
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),

    // --- Copy manifest + icons + favicon into /public ---
    viteStaticCopy({
      targets: [
        { src: path.resolve(__dirname, 'src/pwa/manifest.webmanifest'), dest: '' },
        { src: path.resolve(__dirname, 'src/pwa/*.png'), dest: '' },
        { src: path.resolve(__dirname, 'src/pwa/favicon.ico'), dest: '' },
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
