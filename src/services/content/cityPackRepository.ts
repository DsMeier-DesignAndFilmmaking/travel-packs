import { contentClient } from '@/services/content/contentClient';
import type { CityPackIndex } from '@/types/api';
import type { CityPack } from '@/types/cityPack';

const CITY_PACK_INDEX_PATH = '/data/city-packs/index.json';

export class CityPackRepository {
  async listCityPacks(): Promise<CityPackIndex> {
    return contentClient.getJson<CityPackIndex>(CITY_PACK_INDEX_PATH);
  }

  async getCityPackBySlug(slug: string): Promise<CityPack> {
    // Files are sharded by slug, which scales naturally for thousands of packs.
    return contentClient.getJson<CityPack>(`/data/city-packs/${slug}.json`);
  }
}

export const cityPackRepository = new CityPackRepository();
