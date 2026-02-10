/**
 * Single Vite config for this project. Do not use vite.config.js.
 * registerType: immediate + skipWaiting + clientsClaim so new SW takes over as soon as it's downloaded.
 * /manifests/ is NetworkFirst so manifest JSON is never served from cache.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { manifestDevPlugin } from './vite-plugin-manifest-dev';
var buildVersion = process.env.BUILD_ENV === 'dev' ? 'dev' : String(Date.now());
var buildTime = Date.now();
var appVersion = Date.now();
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
            // 1. Change to 'autoUpdate' for the "immediate" effect without TS errors
            registerType: 'autoUpdate',
            // 2. Switching to 'generateSW' is safer for most PWA needs 
            // unless you have complex custom logic in your src/sw.js.
            strategies: 'generateSW',
            injectRegister: 'inline',
            manifest: false, // We handle this dynamically in CityPackDetailView
            includeManifestIcons: false,
            devOptions: { enabled: true },
            workbox: {
                // 3. Force the Service Worker to update and take over immediately
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
                // 4. Critical: Ensure dynamic city routes aren't trapped by a static fallback
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [
                    /^\/api\//,
                    /^\/_/,
                    /^\/manifests\//,
                    /\.(?:json|png|jpg|webmanifest)(?:\?|$)/
                ],
                runtimeCaching: [
                    {
                        // Always fetch manifests from the network to avoid city-undefined or stale data
                        urlPattern: /^\/manifests\//,
                        handler: 'NetworkOnly',
                    },
                    {
                        // UI Shell: Try network first so users see updates, fallback to cache for offline
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return request.mode === 'navigate';
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'v4-storage-shell', // Incremented version to break old cache
                            networkTimeoutSeconds: 5,
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
