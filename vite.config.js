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
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                globIgnores: ['**/city-data/*.json', '**/city-assets/*.jpg', '**/manifest*.webmanifest', '**/site.webmanifest'],
                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
            },
            workbox: {
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
