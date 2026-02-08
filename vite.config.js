import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
export default defineConfig({
    // Must match deployment (e.g. / for root, /app/ for subpath). start_url in manifest must include base.
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
            // 'prompt' avoids the initial flicker: no auto-reload when SW first activates/claims the client.
            // User gets a "New version available" prompt instead of an immediate refresh.
            registerType: 'prompt',
            injectRegister: 'inline',
            manifest: false,
            devOptions: {
                enabled: true,
                type: 'module'
            },
            injectManifest: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
                globIgnores: ['**/city-data/*.json', '**/city-assets/*.jpg'],
                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
            },
            // With injectManifest, navigation fallback is in src/sw.js (NavigationRoute).
            // If using generateSW, denylist must NOT include /city/ so deep links get the shell.
            workbox: {
                navigateFallbackDenylist: [/^\/api\//, /^\/_/, /\.(?:json|png|jpg|webmanifest)(?:\?|$)/],
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
