# Initial Scaffold: Offline-First City Travel Packs PWA

## Scope
This scaffold establishes the baseline architecture for a production-oriented PWA where city content is data-driven and selectively available offline.

## Included foundations
- Vite + React + TypeScript application shell
- Route structure:
  - `/` city pack catalog
  - `/city/:slug` city pack detail
- JSON-first content model (city packs in `public/data/city-packs/*.json`)
- Schema contract for content validation (`public/data/schemas/city-travel-pack.schema.json`)
- PWA manifest + service worker integration (`vite-plugin-pwa`, `injectManifest`)
- Explicit per-city offline caching workflow (no global prefetch caching)
- Reusable `useCityPacks()` hook for download status and persistence

## Folder baseline
```text
src/
├── app/
├── components/
├── config/
├── features/
├── hooks/
├── pages/
├── pwa/
├── services/
├── types/
└── sw.ts

public/
└── data/
    ├── city-packs/
    └── schemas/
```

## Offline-first principles enforced
1. Users explicitly choose which packs are downloaded.
2. Only downloaded city JSON files are served offline.
3. Navigation continues offline via app shell fallback.
4. Non-downloaded packs fail predictably offline.

## Next implementation increments
- Add install/update toasts for PWA lifecycle clarity.
- Add content sync/version conflict strategy for downloaded packs.
- Add automated schema validation in CI pipeline.
- Add analytics for download, remove, and install actions.
