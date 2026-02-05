import type { CityPackSummary } from '@/types/cityPack';

export interface CityPackIndex {
  generatedAt: string;
  total: number;
  items: CityPackSummary[];
}
