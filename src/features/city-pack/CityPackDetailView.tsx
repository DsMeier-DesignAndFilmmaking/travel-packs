// /src/features/city-pack/CityPackDetailView.tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallOverlay } from '@/components/city/InstallOverlay';
import type { CityPack, VersionedSection } from '@/types/cityPack';

/**
 * SectionCard - Airbnb Editorial Style with Maximum Breathing Room
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="py-20 md:py-24 first:pt-24 md:first:pt-32 animate-fadeIn">
      {/* 1. Section Header - Large & Bold */}
      <div className="mb-16 md:mb-20">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#222222] leading-[1.1] mb-6">
          {title}
        </h2>
        <div className="h-1.5 w-20 bg-[#FF385C] rounded-full" />
      </div>
      
      {/* 2. Critical Alert - Prominent Warning */}
      {criticalAlert && (
        <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FAFAFA] border-l-4 border-[#FF385C] p-10 md:p-12 mb-16 md:mb-20 rounded-r-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <p className="text-xs uppercase tracking-[0.25em] font-black text-[#FF385C]">
              Safety Advisory
            </p>
          </div>
          <div className="prose prose-lg max-w-none text-[#484848] leading-relaxed">
            <ReactMarkdown>{criticalAlert}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* 3. Main Content - Editorial Prose */}
      <div className="prose prose-xl max-w-none text-[#484848] leading-[1.8] mb-16 md:mb-20">
        <ReactMarkdown 
          components={{
            p: ({children}) => <p className="mb-6 text-lg md:text-xl">{children}</p>,
            ul: ({children}) => <ul className="space-y-3 mb-6">{children}</ul>,
            li: ({children}) => <li className="text-lg md:text-xl leading-relaxed">{children}</li>,
          }}
        >
          {description}
        </ReactMarkdown>
      </div>

      {/* 4. Stats Grid - Clean Data Display */}
      {summaryStats && summaryStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 py-16 md:py-20 my-16 md:my-20 border-y-2 border-[#F0F0F0]">
          {summaryStats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-3 group"> 
              <p className="text-[11px] uppercase tracking-[0.2em] font-black text-[#717171] mb-1">
                {stat.label}
              </p>
              <div className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#222222] group-hover:text-[#FF385C] transition-colors">
                <ReactMarkdown components={{ p: ({children}) => <>{children}</> }}>
                  {stat.value}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Expert Tips - Local Insights */}
      {tips && tips.length > 0 && (
        <div className="mt-20 md:mt-24 bg-[#F9F9F9] rounded-[32px] p-10 md:p-16 lg:p-20 border border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-10 md:mb-12">
            <span className="text-2xl">💡</span>
            <p className="text-xs uppercase tracking-[0.25em] font-black text-[#222222]">
              Local Perspective
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {tips.map((tip, i) => (
              <div key={i} className="text-base md:text-lg text-[#484848] leading-[1.8]">
                <ReactMarkdown 
                  components={{ 
                    strong: ({children}) => <strong className="text-[#222222] font-black">{children}</strong>,
                    p: ({children}) => <p className="mb-0">{children}</p>,
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
 * CityPackDetailView - Airbnb-Style Editorial Experience
 */
export function CityPackDetailView({ pack }: { pack: CityPack }) {
  const { installPrompt, isInstalled, handleInstall } = usePWAInstall();
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  if (!pack) return null;

  return (
    <article className="w-full bg-white">
      {/* Hero Header Section - Dramatic & Spacious */}
      <header className="w-full border-b-2 border-[#F0F0F0] bg-gradient-to-b from-white to-[#FAFAFA]">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 lg:px-12 pt-32 md:pt-40 lg:pt-48 pb-24 md:pb-32 relative overflow-hidden">
          {/* Background Ghost Text - Subtle Branding */}
          <div className="absolute -top-8 -left-4 text-[28vw] md:text-[24vw] lg:text-[20vw] font-black text-[#F7F7F7] leading-none pointer-events-none select-none tracking-tighter">
            {pack.city.substring(0, 2).toUpperCase()}
          </div>

          {/* Content Layer */}
          <div className="relative z-10">
            {/* Eyebrow - Breadcrumb Style */}
            <div className="flex items-center gap-2 mb-8">
              <p className="text-[11px] uppercase tracking-[0.25em] font-black text-[#717171]">
                {pack.country}
              </p>
              <span className="text-[#DDDDDD]">•</span>
              <p className="text-[11px] uppercase tracking-[0.25em] font-black text-[#717171]">
                {pack.region}
              </p>
            </div>
            
            {/* Hero Title - Maximum Impact */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] text-[#222222] leading-[0.9] mb-16 md:mb-20">
              {pack.city}<span className="text-[#FF385C]">.</span>
            </h1>

            {/* Action Buttons - Clear CTAs */}
            {!isInstalled && (
              <div className="flex flex-wrap gap-4 mb-20 md:mb-24">
                {installPrompt && (
                  <button 
                    onClick={() => void handleInstall()} 
                    className="btn-pill btn-pill--outline px-8 py-4 text-sm font-bold"
                  >
                    <span className="tracking-wide">📥 Install Desktop App</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowMobileOverlay(true)} 
                  className="btn-pill btn-pill--primary px-8 py-4 text-sm font-bold shadow-lg hover:shadow-xl transition-shadow"
                >
                  <span className="tracking-wide text-white">💾 Save for Offline</span>
                </button>
              </div>
            )}

            {/* Metadata Grid - Key Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 pt-12 md:pt-16 border-t-2 border-[#F0F0F0]">
              <div className="flex flex-col gap-3">
                <p className="text-[11px] uppercase tracking-[0.25em] font-black text-[#717171]">
                  Destination
                </p>
                <p className="text-3xl md:text-4xl font-black tracking-tight text-[#222222]">
                  {pack.country}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[11px] uppercase tracking-[0.25em] font-black text-[#717171]">
                  Currency
                </p>
                <p className="text-3xl md:text-4xl font-black tracking-tight text-[#222222]">
                  {pack.currency.symbol} {pack.currency.code}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[11px] uppercase tracking-[0.25em] font-black text-[#717171]">
                  Region
                </p>
                <p className="text-3xl md:text-4xl font-black tracking-tight text-[#222222]">
                  {pack.region}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Sections - Editorial Flow */}
      <div className="max-w-[1024px] mx-auto px-6 md:px-10 lg:px-12 pb-32 md:pb-40">
        <main className="divide-y-2 divide-[#F0F0F0]">
          {Object.values(pack.sections || {}).map((section, idx) => (
            <SectionCard key={idx} section={section} />
          ))}
        </main>
      </div>
      
      {/* PWA Mobile Instructions */}
      <InstallOverlay 
        isOpen={showMobileOverlay} 
        onClose={() => setShowMobileOverlay(false)} 
        cityName={pack.city} 
      />
    </article>
  );
}