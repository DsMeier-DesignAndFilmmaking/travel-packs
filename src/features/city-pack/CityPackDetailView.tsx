import React, { useState } from 'react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallOverlay } from '@/components/city/InstallOverlay';
import type { CityPack, VersionedSection } from '@/types/cityPack';

/**
 * SectionCard - Scoped for Editorial View
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="section-card animate-fadeIn">
      {/* 1. Section Header */}
      <div className="mb-12">
        <div className="h-[3px] w-12 bg-air-black mb-6" />
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-air-black leading-[1.1]">
          {title}
        </h2>
      </div>

{/* 2. Critical Alert */}
{criticalAlert && (
  <div className="alert-banner animate-fadeIn">
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 bg-air-accent" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-air-accent" />
      </div>
      <p className="label-editorial-bold !text-air-accent !mb-0">
        Safety Advisory
      </p>
    </div>
    <div className="prose prose-sm md:prose-base max-w-none text-air-black/80">
      <ReactMarkdown>{criticalAlert}</ReactMarkdown>
    </div>
  </div>
)}

      {/* 3. Main Content - Using scoped prose-description class */}
      <div className="prose-description">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="text-xl md:text-2xl font-black text-air-black tracking-tight mt-10 mb-4">
                {children}
              </h3>
            ),
          }}
        >
          {description}
        </ReactMarkdown>
      </div>

      {/* 4. Stats Grid - Optimized for metadata-row class */}
      {summaryStats && summaryStats.length > 0 && (
        <div className="metadata-row py-8 border-y border-air-border my-12">
          {summaryStats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-2 min-w-[140px]">
              <span className="label-editorial-bold">{stat.label}</span>
              <div className="text-2xl md:text-3xl font-black tracking-tighter text-air-black">
                <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>
                  {stat.value}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Expert Tips */}
      {tips && tips.length > 0 && (
        <div className="bg-[#F9F9F9] rounded-3xl p-8 md:p-10 mt-12">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-2 w-2 rounded-full bg-air-accent" />
            <p className="label-editorial-bold !mb-0 !text-air-black">
              Local Perspective
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            {tips.map((tip, i) => (
              <div key={i} className="prose prose-sm text-air-gray leading-relaxed">
                <ReactMarkdown
                  components={{
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
 * CityPackDetailView - Isolated via editorial-view namespace
 */
export function CityPackDetailView({ pack }: { pack: CityPack }) {
  const { installPrompt, isInstalled, handleInstall } = usePWAInstall();
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const { city, slug } = pack;

  if (!pack) return null;
  
    useEffect(() => {
      // 1. Create the dynamic manifest object
      const dynamicManifest = {
        name: `Local City: ${pack.city}`, // Unique name: "Local City: Paris"
        short_name: pack.city,
        description: `Offline guide for ${city}.`,
        start_url: window.location.pathname,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
          { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
        ]
      };
  
      // 2. Convert to a Blob and create a temporary URL
      const stringManifest = JSON.stringify(dynamicManifest);
      const blob = new Blob([stringManifest], { type: 'application/manifest+json' });
      const manifestURL = URL.createObjectURL(blob);
  
      // 3. Find the manifest link tag and swap the href
      // Make sure your index.html has <link id="manifest-placeholder" rel="manifest" href="/manifest.webmanifest">
      const manifestTag = document.querySelector('link[rel="manifest"]');
      if (manifestTag) {
        manifestTag.setAttribute('href', manifestURL);
      }
  
      // Cleanup: Reset to default manifest when leaving the page
      return () => {
        if (manifestTag) {
          manifestTag.setAttribute('href', '/manifest.webmanifest');
        }
        URL.revokeObjectURL(manifestURL);
      };
    }, [city, window.location.pathname]);

  return (
    <article className="editorial-view w-full bg-white min-h-screen">
      {/* Hero Header */}
      <header className="hero-header relative overflow-hidden">

        <div className="home-view-container relative z-10">
          <div className="max-w-4xl">
            <div className="h-[3px] w-16 bg-air-black mb-12" />

            <p className="label-editorial-bold mb-6 !text-sm">
              {pack.country} // {pack.region}
            </p>

            <h1 className="hero-title mb-10">
              {pack.city}<span className="text-air-accent">.</span>
            </h1>

            <p className="text-lg md:text-xl text-air-gray font-medium leading-relaxed max-w-2xl mb-12">
              Your essential guide to navigating this destination with confidence and local insight.
            </p>

            {/* Top Level Metadata */}
            <div className="metadata-row">
              <div>
                <span className="label-editorial-bold">Currency</span>
                <span className="text-xl font-black block tracking-tighter">
                  {pack.currency.symbol} {pack.currency.code}
                </span>
              </div>
              <div>
                <span className="label-editorial-bold">Language</span>
                <span className="text-xl font-black block tracking-tighter">Local Dialect</span>
              </div>
              <div>
                <span className="label-editorial-bold">Edition</span>
                <span className="text-xl font-black block tracking-tighter">2026</span>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="mt-16 flex flex-wrap gap-4">
              <button
                onClick={() => setShowMobileOverlay(true)}
                className="btn-pill btn-pill--primary px-10 py-4"
              >
                Save for Offline Use
              </button>
              
              {!isInstalled && installPrompt && (
                <button
                  onClick={() => void handleInstall()}
                  className="btn-pill btn-pill--outline px-10 py-4"
                >
                  Install App
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="home-view-container py-12">
        <main className="max-w-4xl">
          {Object.values(pack.sections || {}).map((section, idx) => (
            <SectionCard key={idx} section={section} />
          ))}
        </main>

        {/* Page Decoration Footer */}
        <div className="mt-32 py-20 border-t border-air-border opacity-10 select-none text-center">
          <span className="text-[10vw] font-black tracking-tighter text-air-black uppercase">
            {pack.city}_2026
          </span>
        </div>
      </div>

      <InstallOverlay 
        isOpen={showMobileOverlay} 
        onClose={() => setShowMobileOverlay(false)} 
        cityName={pack.city} 
      />
    </article>
  );
}