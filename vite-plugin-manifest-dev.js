/**
 * Vite plugin: serve city manifests at /manifests/city-:slug.json in development.
 * Matches Vercel rewrite so the same path works in dev and prod; avoids manifest
 * "Syntax Error" when the dev server would otherwise return HTML (SPA fallback).
 */
var MANIFEST_PREFIX = '/manifests/city-';
var MANIFEST_SUFFIX = '.json';
export function manifestDevPlugin() {
    return {
        name: 'manifest-dev',
        apply: 'serve',
        configureServer: function (server) {
            server.middlewares.use(function (req, res, next) {
                var _a, _b, _c;
                var url = (_b = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split('?')[0]) !== null && _b !== void 0 ? _b : '';
                if (req.method !== 'GET' || !url.startsWith(MANIFEST_PREFIX) || !url.endsWith(MANIFEST_SUFFIX)) {
                    return next();
                }
                var slug = url.slice(MANIFEST_PREFIX.length, -MANIFEST_SUFFIX.length);
                if (!slug) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'City slug required' }));
                    return;
                }
                var origin = "http://".concat((_c = req.headers.host) !== null && _c !== void 0 ? _c : 'localhost:5173');
                var cityPath = "/city/".concat(slug);
                var cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
                var dataUrl = "".concat(origin, "/data/city-packs/").concat(slug, ".json");
                fetch(dataUrl)
                    .then(function (r) { return (r.ok ? r.json() : null); })
                    .then(function (data) {
                    if (data === null || data === void 0 ? void 0 : data.city)
                        cityName = data.city;
                    var manifest = {
                        id: cityPath,
                        name: "".concat(cityName, " Travel Pack"),
                        short_name: "".concat(cityName, " Pack"),
                        description: "Offline-first travel guide for ".concat(cityName),
                        start_url: cityPath,
                        scope: cityPath,
                        display: 'standalone',
                        background_color: '#ffffff',
                        theme_color: '#0f172a',
                        icons: [
                            { src: "".concat(origin, "/pwa-192x192.png"), sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
                            { src: "".concat(origin, "/pwa-512x512.png"), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
                        ],
                    };
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/manifest+json');
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    res.end(JSON.stringify(manifest));
                })
                    .catch(function () {
                    var manifest = {
                        id: cityPath,
                        name: "".concat(cityName, " Travel Pack"),
                        short_name: "".concat(cityName, " Pack"),
                        description: "Offline-first travel guide for ".concat(cityName),
                        start_url: cityPath,
                        scope: cityPath,
                        display: 'standalone',
                        background_color: '#ffffff',
                        theme_color: '#0f172a',
                        icons: [
                            { src: "".concat(origin, "/pwa-192x192.png"), sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
                            { src: "".concat(origin, "/pwa-512x512.png"), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
                        ],
                    };
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/manifest+json');
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    res.end(JSON.stringify(manifest));
                });
            });
        },
    };
}
