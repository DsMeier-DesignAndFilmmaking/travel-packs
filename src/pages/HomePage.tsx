import { useEffect, useState } from 'react';
import { HomePageView } from '@/features/home/HomePageView';
import { cityPackRepository } from '@/services/content/cityPackRepository';
import type { CityPackSummary } from '@/types/cityPack';

export function HomePage() {
  const [packs, setPacks] = useState<CityPackSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cityPackRepository
      .listCityPacks()
      .then((result) => setPacks(result.items))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <p>Unable to load city packs: {error}</p>;
  }

  return <HomePageView packs={packs} />;
}
