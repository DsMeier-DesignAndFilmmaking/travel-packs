/**
 * Sole Vite config for this project. Use this file only (no vite.config.js).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { manifestDevPlugin } from './vite-plugin-manifest-dev';
export default defineConfig({
    base: '/',
    plugins: [
        manifestDevPlugin(),
        react(),
        ViteImageOptimizer({
            jpg: { quality: 80 },
            png: { quality: 80 },
            // 'lossy' is not a valid key; simply setting a quality level 
            // implies lossy compression.
            webp: { quality: 80 },
            avif: { quality: 60 },
        }),
        // ABSOLUTE CONSTRAINTS: No "/" HTML cache. No SPA runtime reuse. No Blob manifests. No merged city state. City manifests = real URLs. Offline = city assets/data only.
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
                // Do NOT cache "/" HTML: precache zero entries (no app shell).
                globPatterns: [],
                globIgnores: ['**/*'],
                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
            },
            workbox: {
                // Do NOT reuse SPA runtime: no navigation fallback (each launch = fresh document URL).
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
