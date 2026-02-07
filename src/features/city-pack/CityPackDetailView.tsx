import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePWAInstall } from '@/hooks/usePWAInstall';
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
  
  const sections = useMemo(() => Object.values(pack.sections || {}), [pack.sections]);

  useEffect(() => {
    // Point to the server-side dynamic manifest endpoint
    const manifestUrl = `/api/manifest/${pack.slug}`;
    
    // Remove any existing manifest tag
    const oldTag = document.querySelector('link[rel="manifest"]');
    if (oldTag) {
      oldTag.remove();
    }
  
    // Add the city-specific manifest
    const manifestTag = document.createElement('link');
    manifestTag.rel = 'manifest';
    manifestTag.href = manifestUrl;
    // Add a unique ID to ensure we can find it later
    manifestTag.id = 'city-manifest';
    document.head.appendChild(manifestTag);
  
    return () => {
      // On unmount, restore the main app manifest
      const cityTag = document.getElementById('city-manifest');
      if (cityTag) {
        cityTag.remove();
      }
      
      // Restore main manifest
      const mainManifest = document.createElement('link');
      mainManifest.rel = 'manifest';
      mainManifest.href = '/manifest.webmanifest';
      document.head.appendChild(mainManifest);
    };
  }, [pack.slug]);

  return (
    <article className="editorial-view w-full bg-white min-h-screen">
      <header className="pt-24 md:pt-32 pb-16 relative overflow-hidden">
        <div className="home-view-container relative z-10">
          <div className="max-w-4xl">
            <div className="h-[3px] w-16 bg-air-black mb-16" />

            <div className="flex items-center gap-4 mb-8">
              <span className="label-editorial-bold !text-air-gray text-[10px]">Destination</span>
              <div className="h-[1px] w-8 bg-air-border" />
              <p className="label-editorial-bold !mb-0 !text-air-black uppercase tracking-widest text-[11px]">
                {pack.country} // {pack.region}
              </p>
            </div>

            <h1 className="text-7xl md:text-[120px] font-black tracking-tighter text-air-black leading-[0.8] mb-12">
              {pack.city}<span className="text-air-accent">.</span>
            </h1>

            <p className="text-xl md:text-2xl text-air-gray font-medium leading-snug max-w-2xl mb-16">
              A meticulously curated travel pack designed for the independent explorer.
            </p>

            <div className="flex flex-wrap gap-x-16 gap-y-8 border-t border-air-border pt-12">
              <div className="flex flex-col gap-1">
                <span className="label-editorial-bold text-[9px] tracking-[0.3em]">Currency</span>
                <span className="text-xl font-black tracking-tighter uppercase">
                  {pack.currency.symbol} {pack.currency.code}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="label-editorial-bold text-[9px] tracking-[0.3em]">Update</span>
                <span className="text-xl font-black tracking-tighter uppercase">Edition 2026</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="label-editorial-bold text-[9px] tracking-[0.3em]">ID</span>
                <span className="text-xl font-black tracking-tighter uppercase">{pack.id.slice(0, 4)}</span>
              </div>
            </div>

            <div className="mt-20 flex flex-wrap gap-4">
              <button
                onClick={() => setShowMobileOverlay(true)}
                className="btn-pill btn-pill--primary px-10 py-5 shadow-2xl shadow-air-accent/20"
              >
                Download Pack
              </button>
              
              {!isInstalled && installPrompt && (
                <button
                  onClick={() => void handleInstall()}
                  className="btn-pill btn-pill--outline px-10 py-5 hover:bg-air-black hover:text-white transition-all"
                >
                  Install App
                </button>
              )}
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