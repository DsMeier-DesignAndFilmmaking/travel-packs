import { CityPackCard } from '@/components/city/CityPackCard';
import type { DownloadStatus } from '@/hooks/useCityPacks';
import type { CityPackSummary } from '@/types/cityPack';

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
  isOnline
}: HomePageViewProps) {
  return (
    <section className="section-stack">
      <div className="surface hero-panel">
        <h1 className="hero-title">City Travel Packs</h1>
        <p className="hero-subtitle">Structured guides with explicit offline downloads. No hidden prefetching.</p>
        <div className="meta-row">
          <span className="meta-chip">Downloaded: {downloadedCount}</span>
          <span className="meta-chip">Network: {isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="packs-grid">
        {packs.map((pack) => (
          <CityPackCard
            key={pack.slug}
            pack={pack}
            status={getPackStatus(pack.slug)}
            onDownload={onDownloadPack}
            onRemove={onRemovePack}
            isOnline={isOnline}
          />
}

export function HomePageView({ packs }: HomePageViewProps) {
  return (
    <section>
      <h1>Explore City Travel Packs</h1>
      <p>
        Data-first catalog rendering. This view stays stable even when pack schema grows,
        because the page receives typed data from a repository abstraction.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {packs.map((pack) => (
          <CityPackCard key={pack.slug} pack={pack} />
        ))}
      </div>
    </section>
  );
}
