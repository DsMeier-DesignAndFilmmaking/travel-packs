import { useEffect, useState } from 'react';
import { HomePageView } from '@/features/home/HomePageView';
import { useCityPacks } from '@/hooks/useCityPacks';
import { cityPackRepository } from '@/services/content/cityPackRepository';
import type { CityPackSummary } from '@/types/cityPack';

/**
 * HomePage Controller
 * Refined for a premium product feel with micro-interactions
 * and editorial-grade layout consistency.
 */
export function HomePage() {
  const [packs, setPacks] = useState<CityPackSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const { downloadCityPack, removeCityPack, getPackStatus, listDownloadedPacks } = useCityPacks();

  // 1. Connectivity Lifecycle
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

  // 2. Data Acquisition
  useEffect(() => {
    setIsLoading(true);
    cityPackRepository
      .listCityPacks()
      .then((result) => {
        setPacks(result.items);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // 3. Loading State: "Product App" Spinner
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="w-12 h-12 border-[2px] border-[#F7F7F7] border-t-[#222222] rounded-full animate-spin"></div>
          {/* Center Dot Indicator */}
          <div className="absolute h-1.5 w-1.5 bg-[#FF385C] rounded-full shadow-[0_0_8px_rgba(255,56,92,0.4)]"></div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#B0B0B0]">
          Syncing Catalog
        </p>
      </div>
    );
  }

  // 4. Error State: High-End Editorial Callout
  if (error) {
    return (
      <div className="home-view-container flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-[1px] h-12 bg-[#FF385C] mb-8" />
        <h2 className="text-4xl font-black tracking-tighter text-[#222222] mb-4">
          Off the Grid<span className="text-[#FF385C]">.</span>
        </h2>
        <p className="text-[#717171] font-medium leading-relaxed max-w-sm mb-10">
          We're having trouble reaching the server. Check your connection or explore your cached packs.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-pill btn-pill--primary shadow-xl hover:shadow-[#FF385C]/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // 5. Success State: Hand-off to the polished HomePageView
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