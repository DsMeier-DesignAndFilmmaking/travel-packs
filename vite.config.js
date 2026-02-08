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
            devOptions: {
                enabled: true,
                type: 'module'
            },
            // Set to false to use your static /public/manifest.webmanifest file
            // This allows dynamic manifest swapping for city-specific PWA installs
            manifest: false,
            injectManifest: {
                // PRE-CACHE ONLY THE CORE APP SHELL
                // We exclude specific city JSON/Images so they aren't downloaded on home page load
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
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
