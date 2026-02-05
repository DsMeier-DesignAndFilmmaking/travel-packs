import { useEffect, useState } from 'react';
import { HomePageView } from '@/features/home/HomePageView';
import { useCityPacks } from '@/hooks/useCityPacks';
import { cityPackRepository } from '@/services/content/cityPackRepository';
import type { CityPackSummary } from '@/types/cityPack';

export function HomePage() {
  const [packs, setPacks] = useState<CityPackSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const { downloadCityPack, removeCityPack, getPackStatus, listDownloadedPacks } = useCityPacks();

  // Track online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load city packs
  useEffect(() => {
    cityPackRepository
      .listCityPacks()
      .then((result) => setPacks(result.items))
      .catch((err: Error) => setError(err.message));
  }, []);

  // Render error if fetch fails
  if (error) {
    return <p className="feedback feedback--error">Unable to load city packs: {error}</p>;
  }

  // Render the main home page view
  return (
    <HomePageView
      packs={packs}
      onDownloadPack={downloadCityPack}
      onRemovePack={removeCityPack}
      getPackStatus={getPackStatus}
      downloadedCount={listDownloadedPacks().length}
      isOnline={isOnline}
    />
  );
}
