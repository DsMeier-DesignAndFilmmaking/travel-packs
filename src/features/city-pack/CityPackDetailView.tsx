import type { CityPack, VersionedSection } from '@/types/cityPack';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

/**
 * Editorial Section Component
 * Styled with Airbnb's "Listing Details" aesthetic: 
 * Clean lines, soft grays, and bold headers.
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="py-10 border-b border-gray-100 last:border-0">
      {/* Section Title */}
      <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight text-[#222222]">
        {title}
      </h2>
      
      {/* Critical Alert: Soft editorial callout */}
      {criticalAlert && (
        <div className="bg-[#F7F7F7] border border-gray-200 p-6 rounded-2xl mb-8 flex gap-4">
          <span className="text-xl shrink-0">💡</span>
          <div className="prose prose-sm prose-slate italic leading-relaxed">
            <ReactMarkdown>{criticalAlert}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Description: High readability typography */}
      <div className="prose prose-lg prose-slate max-w-none text-[#484848] leading-relaxed mb-8">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>

      {/* Stats Grid: Vertical separator style */}
      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 my-8 border-y border-gray-100">
          {summaryStats.map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold mb-1">
                {stat.label}
              </span>
              <div className="text-base md:text-lg font-semibold text-[#222222]">
                <ReactMarkdown>{stat.value}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expert Tips: Minimalist Rounded Box */}
      {tips && tips.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Local Knowledge</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-[#484848] bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-300">•</span>
                <div className="prose prose-sm prose-slate">
                  <ReactMarkdown>{tip}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function CityPackDetailView({ pack }: { pack: CityPack }) {
  // Guard clause to handle async data loading
  if (!pack || !pack.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 font-medium tracking-widest uppercase text-xs">
          Loading Travel Pack...
        </div>
      </div>
    );
  }

  const { city: cityName, id: cityId } = pack;
  const sections = pack.sections ? Object.values(pack.sections) : [];

  // 1. PWA Logic: Dynamic Manifest Swap
  useEffect(() => {
    const dynamicManifest = {
      "name": `Travel Pack: ${cityName}`,
      "short_name": cityName,
      "start_url": window.location.pathname,
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#0f172a",
      "icons": [
        { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
      ]
    };

    const blob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/manifest+json' });
    const manifestURL = URL.createObjectURL(blob);
    const manifestTag = document.querySelector('#main-manifest');
    
    if (manifestTag) manifestTag.setAttribute('href', manifestURL);

    return () => {
      if (manifestTag) {
        manifestTag.setAttribute('href', '/manifest.webmanifest');
        URL.revokeObjectURL(manifestURL);
      }
    };
  }, [cityId, cityName]);

  // 2. PWA Logic: Selective Offline Download
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'DOWNLOAD_CITY_PACK',
        payload: {
          cityId: cityId,
          assets: [window.location.pathname]
        }
      });
    }
  }, [cityId]);

  return (
    <article className="min-h-screen bg-white" id="city-detail-view">
      {/* Use a wrapper that respects the global font but controls width with Tailwind */}
    <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
      {/* Hero Header */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <nav className="mb-8">
          <div className="h-[1px] w-12 bg-gray-900 mb-8"></div>
        </nav>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#222222] mb-6">
          {pack.city}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <span>{pack.country}</span>
          <span className="text-gray-200">/</span>
          <span>{pack.region}</span>
          <span className="text-gray-200">/</span>
          <span className="text-[#222222] border-b-2 border-gray-900 pb-1">
            {pack.currency.symbol} {pack.currency.code}
          </span>
        </div>
      </header>
      </div>

      {/* Editorial Content Body */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex flex-col">
          {sections.map((section, idx) => (
            <SectionCard key={idx} section={section} />
          ))}
        </div>
      </main>
    </article>
  );
}