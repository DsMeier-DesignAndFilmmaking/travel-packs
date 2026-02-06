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

export function CityPackCard({ pack, status, onDownload, onRemove, isOnline }: CityPackCardProps) {
  const isDownloading = status === 'downloading';
  const isDownloaded = status === 'downloaded';
  const hasError = status === 'error';

  return (
    <article className="group flex flex-col w-full bg-white">
      {/* 1. Image Container: Linked to your .card-image-wrapper in CSS */}
      <div className="card-image-wrapper">
        <Link to={`/city/${pack.slug}`} className="block w-full h-full">
          <img 
            src={pack.heroImage || '/api/placeholder/400/300'} 
            alt={pack.city}
            loading="lazy"
          />
        </Link>

        {/* 2. Status Badge Overlay: Linked to .badge-overlay in CSS */}
        {(isDownloaded || isDownloading) && (
          <div className="badge-overlay pointer-events-none">
            {isDownloaded && (
              <>
                <span className="dot dot--brand"></span>
                <span>Offline Ready</span>
              </>
            )}
            {isDownloading && (
              <span className="animate-pulse">Saving…</span>
            )}
          </div>
        )}
      </div>

      {/* 3. Text Content & Actions */}
      <div className="flex justify-between items-start gap-2 px-0.5">
        <div className="flex flex-col min-w-0 flex-1">
          <Link to={`/city/${pack.slug}`} className="no-underline">
            <h3 className="text-[15px] font-semibold text-[#222222] leading-tight truncate">
              {pack.city}, {pack.country}
            </h3>
          </Link>
          <p className="text-[14px] text-[#717171] font-normal leading-tight truncate">
            {pack.category || pack.region}
          </p>
          <p className="text-[13px] text-[#717171] mt-1 font-normal">
             {pack.priceLevel ? '₺'.repeat(pack.priceLevel) : '₺'} • {new Date(pack.updatedAt).getFullYear()} Guide
          </p>
        </div>

        {/* 4. Action Section */}
        <div className="flex flex-col items-end justify-start min-h-[40px] flex-shrink-0">
          {!isDownloaded && isOnline && (
            <button
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
                void onDownload(pack.slug);
              }}
              disabled={isDownloading}
              className={`btn-pill ${isDownloading ? 'btn-pill--loading' : 'btn-pill--primary'}`}
            >
              {isDownloading ? (
                <span className="dot-pulse"></span>
              ) : (
                'Get'
              )}
            </button>
          )}

          {isDownloaded && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void onRemove(pack.slug);
              }}
              className="btn-ghost-sm"
            >
              Remove
            </button>
          )}

          {!isDownloaded && !isOnline && (
            <span className="status-label--offline">
              Offline
            </span>
          )}
        </div>
      </div>

      {/* 5. Error Feedback */}
      {hasError && (
        <p className="text-[11px] text-red-600 mt-2 font-medium px-0.5">
          Download failed. Try again?
        </p>
      )}
    </article>
  );
}