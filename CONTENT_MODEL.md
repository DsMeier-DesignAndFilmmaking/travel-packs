# City Travel Pack Content Model

## Top 10 most visited cities in this dataset
1. Bangkok
2. Istanbul
3. London
4. Hong Kong
5. Makkah
6. Antalya
7. Dubai
8. Macau
9. Paris
10. Kuala Lumpur

## Schema
- `public/data/schemas/city-travel-pack.schema.json`

## Example pack files
- `public/data/city-packs/bangkok-thailand.json`
- `public/data/city-packs/istanbul-turkiye.json`
- `public/data/city-packs/london-united-kingdom.json`
- `public/data/city-packs/hong-kong.json`
- `public/data/city-packs/makkah-saudi-arabia.json`
- `public/data/city-packs/antalya-turkiye.json`
- `public/data/city-packs/dubai-uae.json`
- `public/data/city-packs/macau.json`
- `public/data/city-packs/paris-france.json`
- `public/data/city-packs/kuala-lumpur-malaysia.json`

## Why this structure scales globally
- Stable root fields for indexing/filtering (`slug`, `countryCode`, `region`, `coordinates`).
- Section-level versioning enables partial refresh without republishing the full document.
- `sourceIds` supports provenance tracking and confidence workflows.
- Compact payload blocks optimize offline storage and quick scan rendering.
- Predictable JSON schema enables AI generation with deterministic validation.
