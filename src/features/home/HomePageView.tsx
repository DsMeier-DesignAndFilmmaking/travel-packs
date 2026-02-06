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

/**
 * HomePageView - The Editorial Catalog
 * Optimized for a 3-column responsive grid with a magazine-style hero section.
 */
export function HomePageView({
  packs,
  onDownloadPack,
  onRemovePack,
  getPackStatus,
  downloadedCount,
  isOnline,
}: HomePageViewProps) {
  return (
    <section className="home-view-container animate-in fade-in duration-700">
      
<header className="editorial-header">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
    <div className="max-w-3xl">
      <div style={{ height: '2px', width: '48px', backgroundColor: '#222222', marginBottom: '32px' }} />
      
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#222222] mb-6">
        Explore<span style={{ color: '#FF385C' }}>.</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-[#717171] font-medium leading-relaxed max-w-2xl">
        Hand-crafted, structural guides for the intentional traveler. 
        Download packs to ensure reliability when you're off the grid.
      </p>
    </div>

    {/* Manual Override Status Bar */}
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '24px',
        marginBottom: '24px',
        padding: '6px',
        paddingRight: '24px',
        backgroundColor: '#F9F9F9',
        border: '1px solid #EEEEEE',
        borderRadius: '9999px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}
    >
      {/* Primary Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 14px',
        backgroundColor: '#FFFFFF',
        borderRadius: '9999px',
        border: '1px solid #F0F0F0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30" style={{ backgroundColor: '#FF385C' }}></span>
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#FF385C', boxShadow: '0 0 10px rgba(255,56,92,0.5)' }}></span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#222222' }}>
          {downloadedCount} <span style={{ color: '#717171', fontWeight: 700 }}>Packs Ready</span>
        </span>
      </div>

      {/* Connection Logic */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
        <div style={{
          height: '6px',
          width: '6px',
          borderRadius: '50%',
          backgroundColor: isOnline ? '#22C55E' : '#B0B0B0',
          boxShadow: isOnline ? '0 0 12px rgba(34,197,94,0.5)' : 'none',
          transition: 'all 0.7s ease'
        }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
          <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A0A0A0' }}>
            {isOnline ? 'Network' : 'Storage'}
          </span>
          <span style={{ 
            fontSize: '8px', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            marginTop: '2px',
            color: isOnline ? '#22C55E' : '#717171' 
          }}>
            {isOnline ? 'Live Sync' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  </div>
</header>

      {/* 3. Responsive Editorial Grid */}
      <main className="packs-grid mt-12">
        {packs.length > 0 ? (
          packs.map((pack: CityPackSummary) => (
            <CityPackCard
              key={pack.slug}
              pack={pack}
              status={getPackStatus(pack.slug)}
              onDownload={onDownloadPack}
              onRemove={onRemovePack}
              isOnline={isOnline}
            />
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full py-32 text-center border-2 border-dashed border-[#F7F7F7] rounded-[32px]">
            <p className="text-[#717171] font-medium italic">No city packs found in this region.</p>
          </div>
        )}
      </main>

      {/* 4. Subtle Page Decoration */}
      <div className="mt-32 opacity-20 pointer-events-none select-none">
        <span className="text-[12vw] font-black tracking-tighter text-[#F0F0F0]">
          CATALOG_2026
        </span>
      </div>
    </section>
  );
}