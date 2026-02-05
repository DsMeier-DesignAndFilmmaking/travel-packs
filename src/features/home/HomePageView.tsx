import { CityPackCard } from '@/components/city/CityPackCard';
import type { DownloadStatus } from '@/hooks/useCityPacks';
import type { CityPackSummary } from '@/types/cityPack';

// Fixes ts(2304): Defining the missing interface
interface HomePageViewProps {
  packs: CityPackSummary[];
  onDownloadPack: (cityId: string) => Promise<void>;
  onRemovePack: (cityId: string) => Promise<void>;
  getPackStatus: (cityId: string) => DownloadStatus;
  downloadedCount: number;
  isOnline: boolean;
}

export function HomePageView({
  packs,
  onDownloadPack,
  onRemovePack,
  getPackStatus,
  downloadedCount,
  isOnline,
}: HomePageViewProps) {
  return (
    <section className="home-view-container">
      {/* Editorial Header */}
      <div className="editorial-header">
        <h1>Explore City Packs</h1>
        <p>
          Hand-crafted, structured guides designed for absolute reliability. 
          Download to access even when you're completely off the grid.
        </p>
        
        <div className="status-row">
          <div className="status-indicator">
            <span className="dot dot--brand"></span>
            <span>{downloadedCount} Packs Ready Offline</span>
          </div>
          <div className="status-indicator">
            <span className={`dot ${isOnline ? 'dot--online' : 'dot--offline'}`}></span>
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="packs-grid">
        {/* Fixes ts(7006): Explicitly typing the map parameter */}
        {packs.map((pack: CityPackSummary) => (
          <CityPackCard
            key={pack.slug}
            pack={pack}
            status={getPackStatus(pack.slug)}
            onDownload={onDownloadPack}
            onRemove={onRemovePack}
            isOnline={isOnline}
          />
        ))}
      </div>
    </section>
  );
}