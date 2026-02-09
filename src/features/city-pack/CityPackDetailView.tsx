import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePwaManifest } from '@/hooks/usePwaManifest';
import { InstallOverlay } from '@/components/city/InstallOverlay';
import type { CityPack, VersionedSection } from '@/types/cityPack';

/**
 * SectionCard - The Magazine Article Layout
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="section-card animate-fadeIn py-16 md:py-24 first:pt-0 border-b border-air-border last:border-0">
      <div className="mb-12 md:mb-16">
        <div className="h-[3px] w-12 bg-air-black mb-8" />
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-air-black leading-[1.05] max-w-3xl">
          {title}
        </h2>
      </div>

      {criticalAlert && (
        <div className="alert-banner mb-16 bg-air-accent/[0.03] border-l-2 border-air-accent p-8 rounded-r-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 bg-air-accent" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-air-accent" />
            </span>
            <p className="label-editorial-bold !text-air-accent !mb-0 text-[10px] tracking-[0.2em]">
              Safety Advisory
            </p>
          </div>
          <div className="prose prose-sm md:prose-base max-w-none text-air-black/80 font-medium italic leading-relaxed">
            <ReactMarkdown>{criticalAlert}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="prose-description mb-16">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-6 last:mb-0 leading-[1.8]">{children}</p>,
            h3: ({ children }) => (
              <h3 className="text-xl md:text-2xl font-black text-air-black tracking-tight mt-12 mb-6">
                {children}
              </h3>
            ),
            strong: ({ children }) => <strong className="font-black text-air-black">{children}</strong>
          }}
        >
          {description}
        </ReactMarkdown>
      </div>

      {summaryStats && summaryStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-air-border my-16">
          {summaryStats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="label-editorial-bold text-[9px] text-air-gray uppercase tracking-[0.25em]">
                {stat.label}
              </span>
              <div className="text-lg md:text-xl font-black tracking-tight text-air-black">
                <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>
                  {stat.value}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="bg-[#F9F9F9] rounded-[32px] p-8 md:p-12 mt-16">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-1.5 w-1.5 rounded-full bg-air-accent" />
            <p className="label-editorial-bold !mb-0 !text-air-black text-[11px] tracking-[0.2em]">
              Local Perspective
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {tips.map((tip, i) => (
              <div key={i} className="text-[14px] md:text-[15px] text-air-gray leading-relaxed font-medium">
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p className="m-0">{children}</p>,
                    strong: ({ children }) => <b className="text-air-black font-black">{children}</b>,
                  }}
                >
                  {tip}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * CityPackDetailView
 */
export function CityPackDetailView({ pack }: { pack: CityPack }) {
  const { installPrompt, isInstalled, handleInstall } = usePWAInstall();
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const cityPath = `/city/${pack.id}`;
  usePwaManifest({ title: `${pack.city} Travel Pack`, path: cityPath });

  const sections = useMemo(() => Object.values(pack.sections || {}), [pack.sections]);

  return (
    <article className="editorial-view w-full bg-white min-h-screen">
      <header className="relative pt-20 md:pt-28 pb-16 overflow-hidden">
  {/* Background Decoration */}
  <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none z-0">
    <div className="home-view-container">
       <span className="text-[20vw] font-black tracking-tighter leading-none">
         {pack.city}
       </span>
    </div>
  </div>

  <div className="home-view-container relative z-10">
    <div className="max-w-4xl">
      {/* 1. Brand Mark */}
      <div className="h-[2px] w-12 bg-air-accent mb-12 md:mb-16" />

      {/* 2. Top Metadata Labels */}
      <div className="flex flex-col gap-2 mb-8 md:mb-10">
        <span className="label-editorial-bold text-air-gray text-[10px] tracking-[0.3em]">
          Destination Manifest
        </span>
        <p className="text-[12px] font-bold text-air-black uppercase tracking-[0.15em] leading-none">
          {pack.country} <span className="text-air-border mx-2">//</span> {pack.region}
        </p>
      </div>

      {/* 3. Primary Title */}
      <h1 className="text-6xl md:text-[110px] font-black tracking-tighter text-air-black leading-[0.8] mb-8">
        {pack.city}<span className="text-air-accent">.</span>
      </h1>

      {/* 4. Subtitle / Description */}
      <p className="text-lg md:text-xl text-air-gray font-medium leading-relaxed max-w-xl mb-12 md:mb-16">
        A meticulously curated travel pack designed for the independent explorer. 
        Available for full offline synchronization.
      </p>

      {/* 5. Utility Section: Grouped Metadata & Buttons */}
      <div className="space-y-12"> 
        {/* Metadata Row */}
        <div className="flex flex-wrap gap-x-12 gap-y-8 border-t border-air-border pt-10">
          <div className="flex flex-col gap-2 min-w-[120px]">
            <span className="label-editorial-bold text-[10px] tracking-[0.2em] opacity-50">Local Currency</span>
            <span className="text-xl font-black tracking-tight text-air-black">
              {pack.currency.symbol} {pack.currency.code}
            </span>
          </div>
          <div className="flex flex-col gap-2 min-w-[120px]">
            <span className="label-editorial-bold text-[10px] tracking-[0.2em] opacity-50">Edition</span>
            <span className="text-xl font-black tracking-tight text-air-black">2026.01</span>
          </div>
          <div className="flex flex-col gap-2 min-w-[120px]">
            <span className="label-editorial-bold text-[10px] tracking-[0.2em] opacity-50">Asset ID</span>
            <span className="text-xl font-black tracking-tight text-air-black font-mono">
              #{pack.id.slice(0, 4)}
            </span>
          </div>
        </div>
        
      </div>

      {/* Action Row - Added 'pt-4' to ensure physical gap if margin fails */}

{/* 1. Use space-y-12 on the parent to force a gap between the Grid and the Buttons */}
<div className="flex flex-col space-y-12">

  {/* Your Metadata Grid Div here... */}
  <div className="flex flex-wrap gap-x-12 gap-y-8 border-t border-air-border pt-10">
     {/* ...items... */}
  </div>

  {/* 2. Action Row: Use !mt-0 to reset and let the parent gap do the work */}
  <div className="flex flex-wrap items-center gap-4 !mt-12"> 
      <button
        onClick={() => setShowMobileOverlay(true)}
        className="btn-pill btn-pill--primary px-10 py-5 shadow-xl shadow-air-accent/10 active:scale-95 transition-transform"
      >
        Download Pack
      </button>
      
      {!isInstalled && installPrompt && (
        <button
          onClick={() => void handleInstall()}
          className="btn-pill btn-pill--outline px-10 py-5 hover:bg-air-black hover:text-white transition-all active:scale-95"
        >
          Install App
        </button>
      )}
  </div>
</div>
    </div>
  </div>
</header>

      <div className="home-view-container pb-32">
        <main className="max-w-4xl">
          {sections.map((section, idx) => (
            <SectionCard key={idx} section={section} />
          ))}
        </main>

        <footer className="mt-40 py-24 border-t border-air-border flex flex-col items-center">
          <div className="opacity-5 select-none text-center mb-8">
            <span className="text-[14vw] font-black tracking-tighter text-air-black uppercase leading-none">
              {pack.city}
            </span>
          </div>
          <p className="label-editorial-bold text-air-gray !text-[10px] tracking-[0.5em]">
            End of Travel Pack // {pack.city} Edition
          </p>
        </footer>
      </div>

      <InstallOverlay 
        isOpen={showMobileOverlay} 
        onClose={() => setShowMobileOverlay(false)} 
        cityName={pack.city} 
      />
    </article>
  );
}