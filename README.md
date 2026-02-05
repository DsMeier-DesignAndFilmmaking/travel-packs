# Local City Travel Packs

Vite + React + TypeScript scaffold for an offline-first, JSON-driven city travel platform.

## Scaffold reference
- `docs/INITIAL_SCAFFOLD.md`

## UX polish highlights
- Calm visual language with neutral surfaces, soft borders, and low-noise typography.
- Mobile-first grid and spacing system.
- Clear online/offline indicator in the header.
- Explicit offline availability messaging on each city card.
- Install prompt exposed as a native-feeling "Install App" action when supported.

## PWA + offline behavior
- Service worker uses `vite-plugin-pwa` with `injectManifest`.
- No global runtime caching is enabled.
- Only explicitly downloaded city JSON files are stored (`city-pack-json-v1`).
- Offline routing is enabled for app navigation (`/city/:slug`) via app-shell fallback.
- Downloaded city pages work offline because their JSON payload is available in cache.

## Final production readiness checklist
- [x] Mobile-first layout with responsive grid and spacing.
- [x] Consistent component design tokens (buttons, cards, status chips, feedback text).
- [x] Explicit online/offline state visibility.
- [x] Predictable offline behavior (downloaded packs only).
- [x] PWA install UX path for supported browsers.
- [ ] Add app icons (`/pwa-192x192.png`, `/pwa-512x512.png`).
- [ ] Validate Lighthouse PWA/accessibility/performance scores in CI.
- [ ] Add analytics events for download/install actions.

## Folder structure

```text
.
├── public/
│   └── data/
│       ├── city-packs/
│       │   ├── index.json
│       │   ├── bangkok-thailand.json
│       │   ├── istanbul-turkiye.json
│       │   ├── london-united-kingdom.json
│       │   ├── hong-kong.json
│       │   ├── makkah-saudi-arabia.json
│       │   ├── antalya-turkiye.json
│       │   ├── dubai-uae.json
│       │   ├── macau.json
│       │   ├── paris-france.json
│       │   └── kuala-lumpur-malaysia.json
│       └── schemas/
│           └── city-travel-pack.schema.json
├── src/
│   ├── hooks/
│   │   └── useCityPacks.ts
│   ├── pwa/
│   │   └── registerServiceWorker.ts
│   ├── sw.ts
│   └── ...
└── vite.config.ts
```
