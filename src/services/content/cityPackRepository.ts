import { contentClient } from '@/services/content/contentClient';
import type { CityPackIndex } from '@/types/api';
import type { CityPack } from '@/types/cityPack';

const CITY_PACK_INDEX_PATH = '/data/city-packs/index.json';

export class CityPackRepository {
  async listCityPacks(): Promise<CityPackIndex> {
    return contentClient.getJson<CityPackIndex>(CITY_PACK_INDEX_PATH, { cache: 'no-store' });
  }

  async getCityPackBySlug(slug: string): Promise<CityPack> {
    // Prefer fresh data when SW is not controlling; SW uses NetworkFirst so online requests get network first.
    return contentClient.getJson<CityPack>(`/data/city-packs/${slug}.json`, { cache: 'no-store' });
  }
}

export const cityPackRepository = new CityPackRepository();
