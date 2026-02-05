import { Link } from 'react-router-dom';
import type { DownloadStatus } from '@/hooks/useCityPacks';
import type { CityPackSummary } from '@/types/cityPack';

interface CityPackCardProps {
  pack: CityPackSummary;
  status: DownloadStatus;
  onDownload: (cityId: string) => Promise<void>;
  onRemove: (cityId: string) => Promise<void>;
  isOnline: boolean;
}

function statusMessage(status: DownloadStatus, isOnline: boolean) {
  if (status === 'downloading') return 'Saving pack for offline use…';
  if (status === 'downloaded') return 'Available offline.';
  if (status === 'error') return 'Download failed. Check connection and retry.';
  if (!isOnline) return 'Not downloaded yet. Connect to download.';
  return 'Online only until downloaded.';
}

export function CityPackCard({ pack, status, onDownload, onRemove, isOnline }: CityPackCardProps) {
  const isDownloading = status === 'downloading';
  const isDownloaded = status === 'downloaded';

  return (
    <article className="surface card">
      <h3 className="card-title">
        <Link to={`/city/${pack.slug}`}>
          {pack.city}, {pack.country}
        </Link>
      </h3>
      <p className="card-subtext">{pack.region}</p>
      <p className="card-updated">Updated {new Date(pack.updatedAt).toLocaleDateString()}</p>

      <div className="card-actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => void onDownload(pack.slug)}
          disabled={isDownloading || isDownloaded || !isOnline}
        >
          {isDownloading ? 'Downloading…' : isDownloaded ? 'Downloaded' : 'Download'}
        </button>
        {isDownloaded ? (
          <button type="button" className="button button--ghost" onClick={() => void onRemove(pack.slug)}>
            Remove
          </button>
        ) : null}
      </div>
      <p className={`feedback ${status === 'error' ? 'feedback--error' : ''}`}>{statusMessage(status, isOnline)}</p>
    </article>
  );
}
