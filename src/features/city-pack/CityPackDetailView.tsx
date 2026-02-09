import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePwaManifest } from '@/hooks/usePwaManifest';
import { InstallOverlay } from '@/components/city/InstallOverlay';
import type { CityPack, VersionedSection } from '@/types/cityPack';

/**
 * SectionCard - The Magazine Article Layout
 * Optimized for vertical rhythm and clean typography.
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="section-card animate-fadeIn py-40 md:py-56 border-b border-air-border last:border-0">
      {/* Section Heading */}
      <div className="mb-20 md:mb-28">
        <div className="h-[2px] w-16 bg-air-accent mb-12 !m-0" />
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-air-black leading-[0.95] max-w-4xl !m-0">
          {title}
        </h2>
      </div>

      {criticalAlert && (
        <div className="alert-banner mb-20 bg-air-accent/[0.02] border-l-4 border-air-accent p-10 md:p-12 rounded-r-[32px]">
          <div className="flex items-center gap-4 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 bg-air-accent" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-air-accent" />
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-air-accent">
              Priority Safety Advisory
            </p>
          </div>
          <div className="prose prose-lg max-w-none text-air-black/90 font-semibold italic leading-relaxed">
            <ReactMarkdown>{criticalAlert}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Main Narrative Body */}
      <div className="prose-description mb-20 max-w-3xl">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-8 last:mb-0 text-lg md:text-xl text-air-gray leading-relaxed font-medium">{children}</p>,
            h3: ({ children }) => (
              <h3 className="text-2xl md:text-3xl font-black text-air-black tracking-tight mt-16 mb-8 uppercase">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-16 border-y border-air-border my-20">
          {summaryStats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-3">
              <span className="text-[10px] text-air-gray uppercase font-bold tracking-[0.3em]">
                {stat.label}
              </span>
              <div className="text-xl md:text-2xl font-black tracking-tight text-air-black leading-[1.05]">
                <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>
                  {stat.value}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="bg-[#FBFBFB] rounded-[48px] p-10 md:p-20 mt-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-2 w-2 rounded-full bg-air-accent" />
            <p className="text-[11px] font-black text-air-black uppercase tracking-[0.4em]">
              Local Perspective
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-12">
            {tips.map((tip, i) => (
              <div key={i} className="text-base md:text-lg text-air-gray leading-relaxed font-medium">
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
  const cityPath = `/city/${pack.slug}`;
  usePwaManifest({ title: `${pack.city} Travel Pack`, path: cityPath });

  const sections = useMemo(() => Object.values(pack.sections || {}), [pack.sections]);

  return (
    <article className="editorial-view w-full bg-white min-h-screen">
      <header className="relative min-h-[85vh] flex flex-col justify-center pt-44 pb-32 overflow-x-hidden">
        {/* Ghost Text */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none z-0" aria-hidden="true">
          <div className="home-view-container h-full flex items-center">
            <span className="text-[30vw] font-black tracking-tighter leading-none -ml-10">
              {pack.city}
            </span>
          </div>
        </div>

        <div className="pack-header-content home-view-container relative z-10">
          <div className="w-full max-w-full md:max-w-6xl">
            {/* Header Identity Stack — editorial vertical rhythm, gap-24 only (no extra margins). */}
            <div className="flex flex-col gap-24 mb-28 md:mb-36">
              <div className="h-[2px] w-20 bg-air-accent !m-0" />
              
              <div className="flex flex-col gap-24 !m-0">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-air-gray !m-0">
                  Destination Manifest
                </span>
                <p className="text-sm md:text-base font-black text-air-black uppercase tracking-[0.2em] !m-0">
                  {pack.country} <span className="text-air-border mx-3">//</span> {pack.region}
                </p>
              </div>

              <h1 className="text-7xl md:text-[140px] font-black tracking-tighter text-air-black leading-[0.95] -ml-1 md:-ml-2 !m-0">
                {pack.city}<span className="text-air-accent">.</span>
              </h1>

              <p className="text-xl md:text-2xl text-air-gray font-medium leading-relaxed max-w-2xl opacity-80 !m-0">
                A meticulously curated travel pack designed for the independent explorer.
                Available for full offline synchronization.
              </p>
            </div>

            {/* Manifest Footer: bottom-axis alignment across breakpoints */}
            <div className="border-t border-air-border pt-20 mt-20">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-20">
                {/* Data Grid - items-start for column, lg:aligns to row bottom */}
                <div className="flex flex-wrap items-start gap-x-16 gap-y-10">
                  {[
                    { label: 'Local Currency', value: `${pack.currency.symbol} ${pack.currency.code}` },
                    { label: 'Edition', value: '2026.01' },
                    { label: 'Asset ID', value: `#${pack.id.slice(0, 4)}`, mono: true }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-air-gray">
                        {item.label}
                      </span>
                      <span className={`text-2xl font-black tracking-tight text-air-black leading-[1.05] ${item.mono ? 'font-mono' : ''}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Primary Actions - align bottom with data grid on lg */}
                <div className="flex flex-wrap items-center lg:items-end gap-6">
                  <button
                    onClick={() => setShowMobileOverlay(true)}
                    className="btn-pill btn-pill--primary px-12 py-6 text-sm font-black uppercase tracking-widest shadow-2xl shadow-air-accent/20 active:scale-95 transition-all"
                  >
                    Download Pack
                  </button>
                  {!isInstalled && installPrompt && (
                    <button
                      onClick={() => void handleInstall()}
                      className="btn-pill btn-pill--outline px-12 py-6 text-sm font-black uppercase tracking-widest hover:bg-air-black hover:text-white transition-all active:scale-95"
                    >
                      Install App
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Sections - home-view-container for horizontal alignment */}
      <div className="home-view-container pb-48">
        <div className="w-full max-w-full md:max-w-6xl flex flex-col gap-20">
          {sections.map((section, idx) => (
            <SectionCard key={idx} section={section} />
          ))}
        </div>

        <footer className="mt-32 py-40 border-t border-air-border flex flex-col items-center overflow-x-hidden">
          <div className="home-view-container flex flex-col items-center w-full">
          <div className="opacity-[0.03] select-none text-center mb-16">
            <span className="text-[20vw] font-black tracking-tighter text-air-black uppercase leading-none">
              {pack.city}
            </span>
          </div>
          <p className="text-[11px] font-black text-air-gray uppercase tracking-[0.6em]">
            End of Travel Pack <span className="mx-4 opacity-20">//</span> {pack.city} Edition
          </p>
          </div>
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