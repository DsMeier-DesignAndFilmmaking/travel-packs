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
    <article className="group flex flex-col cursor-pointer bg-white">
      {/* 1. Image Container: Fixed Aspect Ratio */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl bg-[#F7F7F7]">
        <Link to={`/city/${pack.slug}`}>
          <img 
            src={pack.heroImage || '/api/placeholder/400/400'} 
            alt={pack.city}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* 2. Status Badge Overlay: Airbnb "Guest Favorite" style */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isDownloaded && (
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[12px] font-bold text-[#222222] shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF385C]"></span>
              Offline Ready
            </span>
          )}
          {isDownloading && (
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[12px] font-bold text-[#222222] animate-pulse">
              Saving…
            </span>
          )}
        </div>
      </div>

      {/* 3. Text Content: Clean Vertical Stack */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <Link to={`/city/${pack.slug}`} className="no-underline">
            <h3 className="text-[15px] font-semibold text-[#222222] leading-tight">
              {pack.city}, {pack.country}
            </h3>
          </Link>
          <p className="text-[15px] text-[#717171] font-normal leading-tight">
            {pack.category || pack.region}
          </p>
          <p className="text-[14px] text-[#717171] mt-1 font-normal">
             {pack.priceLevel ? '₺'.repeat(pack.priceLevel) : '₺'} • {new Date(pack.updatedAt).getFullYear()} Guide
          </p>
        </div>

        {/* 4. Minimalist Action Toggle: Clean "Save/Remove" circle */}
        {/* 4. Airbnb-Style Action Toggle */}

<div className="flex flex-col items-end justify-center min-h-[40px]">
  {/* Scenario A: Pack is available to download */}
  {!isDownloaded && isOnline && (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Stop click from triggering the parent Link
        e.preventDefault(); 
        void onDownload(pack.slug);
      }}
      disabled={isDownloading}
      className={`btn-pill ${isDownloading ? 'btn-pill--loading' : 'btn-pill--primary'}`}
    >
      {isDownloading ? (
        <span className="flex items-center gap-2">
          <span className="dot-pulse"></span> Saving
        </span>
      ) : (
        'Get Pack'
      )}
    </button>
  )}

  {/* Scenario B: Pack is already offline */}
  {isDownloaded && (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          void onRemove(pack.slug);
        }}
        className="btn-ghost-sm group/remove"
      >
        <span className="flex items-center gap-1">
          Remove Pack
        </span>
      </button>
    </div>
  )}

  {/* Scenario C: Offline and not downloaded (Edge case) */}
{!isDownloaded && !isOnline && (
  <span className="status-label--offline">
    Connect to download
  </span>
)}
</div>
      </div>

      {/* 5. Error Feedback: Minimalist and targeted */}
      {hasError && (
        <p className="text-[11px] text-red-600 mt-2 font-medium">
          Download failed. Try again?
        </p>
      )}
    </article>
  );
}