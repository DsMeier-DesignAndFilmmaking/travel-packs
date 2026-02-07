import { Link } from 'react-router-dom';
import type { DownloadStatus } from '@/hooks/useCityPacks';
import type { CityPackSummary } from '@/types/cityPack';

interface CityPackCardProps {
  pack: CityPackSummary;
  status: DownloadStatus;
  onDownload: (cityId: string) => Promise<void>;
  onRemove: (cityId: string) => Promise<void>;
  isOnline: boolean;
  index: number; // <--- Add this line here
}

/**
 * CityPackCard - Catalog Item
 * Optimized for the auto-fill grid layout in the Home view.
 * Uses CSS classes for the Airbnb-style image hover and badge overlay.
 */
export function CityPackCard({ pack, status, onDownload, onRemove, isOnline, index }: CityPackCardProps) {
  // We want to prioritize the first 3-6 images (the first row or two)
  const isPriority = index < 4;
  const isDownloading = status === 'downloading';
  const isDownloaded = status === 'downloaded';
  const hasError = status === 'error';

  return (
    <article className="group flex flex-col w-full bg-white transition-opacity duration-300">
      {/* 1. Image Container: Handled by .card-image-wrapper in styles.css */}
      <div className="card-image-wrapper aspect-[4/3] bg-gray-100">
      <Link to={`/city/${pack.slug}`} className="block w-full h-full">
          <img 
            src={pack.heroImage || '/api/placeholder/400/300'} 
            alt={`${pack.city} travel guide`}
            // High priority for the first few cards, lazy for the rest
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "low"}
            className="select-none object-cover w-full h-full"
          />
      </Link>

        {/* 2. Status Badge Overlay: Absolute positioning from CSS */}
        {(isDownloaded || isDownloading) && (
          <div className="badge-overlay pointer-events-none z-10">
            {isDownloaded && (
              <>
                <span className="dot dot--brand"></span>
                <span className="tracking-tight uppercase text-[10px] font-bold">Offline Ready</span>
              </>
            )}
            {isDownloading && (
              <span className="animate-pulse text-[10px] font-bold uppercase tracking-widest">
                Saving...
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Text Content Area */}
      <div className="flex justify-between items-start gap-6 mt-1">
        <div className="flex flex-col min-w-0 flex-1">
          <Link to={`/city/${pack.slug}`} className="hover:opacity-70 transition-opacity">
            <h3 className="text-[15px] font-bold text-[#222222] leading-tight truncate">
              {pack.city}, {pack.country}
            </h3>
          </Link>
          
          <p className="text-[14px] text-[#717171] font-normal leading-snug truncate">
            {pack.category || pack.region}
          </p>
          
          <p className="text-[13px] text-[#717171] mt-0.5 font-medium">
          {/* Safely repeat the symbol, defaulting to '$' if currencySymbol is null/missing */}
          {pack.priceLevel 
            ? (pack.currencySymbol || '$').repeat(pack.priceLevel) 
            : (pack.currencySymbol || '$')} 
          <span className="mx-1 text-[#EBEBEB]">•</span>
          {new Date(pack.updatedAt).getFullYear()} Edition
        </p>
        </div>

        {/* 4. Action Section: Pill buttons and status indicators */}
        <div className="flex flex-col items-end justify-start flex-shrink-0 pt-0.5">
          {!isDownloaded && isOnline && (
            <button
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
                void onDownload(pack.slug);
              }}
              disabled={isDownloading}
              className={`btn-pill px-5 py-1.5 text-[13px] ${
                isDownloading ? 'btn-pill--loading' : 'btn-pill--primary'
              }`}
            >
              {isDownloading ? (
                <div className="dot-pulse"></div>
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
              className="btn-ghost-sm mt-1"
            >
              Remove
            </button>
          )}

          {!isDownloaded && !isOnline && (
            <span className="status-label--offline mt-1">
              Connect to download
            </span>
          )}
        </div>
      </div>

      {/* 5. Error Feedback: Minimalist Red Alert */}
      {hasError && (
        <p className="text-[11px] text-[#FF385C] mt-2 font-bold uppercase tracking-tighter">
          Error: Please try again
        </p>
      )}
    </article>
  );
}