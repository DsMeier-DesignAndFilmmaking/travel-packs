import type { CityPack, VersionedSection } from '@/types/cityPack';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

/**
 * SectionCard - The "Magazine Article" Layout
 * Uses a mix of CSS Grid and Flex to break the vertical "monotony".
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="pack-section group">
      {/* 1. Section Header: Minimalist with a focus on Title */}
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#222222] mb-4">
          {title}
        </h2>
        <div className="h-1 w-12 bg-[#FF385C] transition-all group-hover:w-24 duration-500" />
      </div>
      
      {/* 2. Critical Alert: Now looks like a premium "Editor's Note" */}
      {criticalAlert && (
        <div className="relative overflow-hidden bg-[#F9F9F9] border-l-4 border-[#222222] p-8 rounded-r-xl mb-12">
          <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-5 select-none font-serif"></div>
          <div className="prose prose-sm font-medium italic text-[#484848] leading-relaxed relative z-10">
            <ReactMarkdown>{criticalAlert}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* 3. Main Content: Increased line-height for readability */}
      <div className="prose prose-lg max-w-none text-[#484848] leading-[1.8] mb-12">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
<br></br>
{/* 4. Stats: 2-Column Grid for a "Table of Contents" feel */}
{summaryStats && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 py-12 my-12 border-y border-[#F0F0F0]">
    {summaryStats.map((stat, i) => (
      /* Added py-6 for 24px top and 24px bottom padding */
      <div key={i} className="flex flex-col py-6"> 
        {/* 1. Optimized Editorial Label */}
        <span 
          className="block text-[10px] uppercase tracking-[0.25em] text-[#717171] mb-1.5"
          style={{ 
            fontWeight: 900, 
            WebkitTextStroke: '0.5px #717171', 
            WebkitFontSmoothing: 'auto' 
          }}
        >
          {stat.label}
        </span>

        {/* 2. Markdown Value Container */}
        <div className="text-[15px] md:text-[16px] font-medium text-[#222222] prose-inline leading-snug">
          <ReactMarkdown 
            components={{
              p: ({children}) => <p className="m-0">{children}</p>,
              strong: ({children}) => <span className="font-black text-black">{children}</span>
            }}
          >
            {stat.value}
          </ReactMarkdown>
        </div>
      </div>
    ))}
  </div>
)}
<br></br>
      {/* 5. Expert Tips: Modern "Checklist" Style */}
{tips && tips.length > 0 && (
  <div className="mt-16 bg-[#FAFAFA] rounded-[32px] overflow-hidden">
    {/* Internal Container with 24px vertical padding (py-6) */}
    <div className="p-8 md:p-12 py-10 md:py-14"> 
      
      {/* 1. Enhanced Bold Header */}
      <h4 
        className="text-[12px] uppercase tracking-[0.3em] mb-12 flex items-center gap-3"
        style={{ 
          fontWeight: 900, 
          WebkitTextStroke: '0.6px #222222', 
          WebkitFontSmoothing: 'auto',
          color: '#222222'
        }}
      >
        <span className="w-2 h-2 rounded-full bg-[#FF385C]" />
        Local Perspective
      </h4>

      {/* 2. Optimized List Grid */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
        {tips.map((tip: string, i: number) => (
          <li key={i} className="flex gap-6 items-start group">
            {/* 3. Refined Numerical Marker */}
            <div className="flex flex-col items-center">
              <span 
                className="text-[10px] font-black text-[#FF385C] opacity-80"
                style={{ WebkitFontSmoothing: 'auto' }}
              >
                {i < 9 ? `0${i + 1}` : i + 1}
              </span>
              <div className="w-[1px] h-full bg-[#EBEBEB] mt-2 group-last:hidden" />
            </div>

            {/* 4. Markdown Content */}
            <div className="prose prose-sm text-[#484848] font-medium leading-relaxed -mt-1">
              <ReactMarkdown
                components={{
                  p: ({children}) => <p className="m-0 mb-1">{children}</p>,
                  strong: ({children}) => <strong className="font-black text-[#222222]">{children}</strong>
                }}
              >
                {tip}
              </ReactMarkdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
      )}
    </section>
  );
}

export function CityPackDetailView({ pack }: { pack: CityPack }) {
  if (!pack || !pack.id) return null;

  const { city: cityName, id: cityId } = pack;
  const sections = pack.sections ? Object.values(pack.sections) : [];

  // PWA & Service Worker Logic (Preserved)
  useEffect(() => {
    const dynamicManifest = {
      "name": `Local City: ${cityName}`,
      "short_name": cityName,
      "start_url": window.location.pathname,
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#ffffff",
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

  return (
    <article className="city-detail-wrapper pb-32">
      {/* Editorial Hero Header */}
      <header className="pt-20 mb-32 relative">
        <div className="absolute top-0 left-0 text-[18vw] font-black text-[#F7F7F7] -z-10 select-none leading-none -ml-4">
          {pack.city.substring(0, 3)}
        </div>
        
        <div className="detail-header-rule mb-16" />
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#222222] leading-[0.85] mb-10">
          {pack.city}<span className="text-[#FF385C]">.</span>
        </h1>
        
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
  {/* Destination */}
  <div className="flex flex-col">
    <span 
      className="block text-[10px] uppercase tracking-[0.2em] text-[#717171] mb-1"
      style={{ 
        fontWeight: 900, 
        WebkitTextStroke: '0.5px #717171', // The "Boldness" hack
        WebkitFontSmoothing: 'auto' 
      }}
    >
      Destination:
    </span>
    <span className="text-sm font-black text-[#222222] uppercase tracking-tight">{pack.country}</span>
  </div>

  <div className="w-[1px] h-8 bg-[#EBEBEB] hidden md:block" />

  {/* Currency */}
  <div className="flex flex-col">
    <span 
      className="block text-[10px] uppercase tracking-[0.2em] text-[#717171] mb-1"
      style={{ 
        fontWeight: 900, 
        WebkitTextStroke: '0.5px #717171',
        WebkitFontSmoothing: 'auto' 
      }}
    >
      Currency:
    </span>
    <span className="text-sm font-black text-[#222222] uppercase tracking-tight">
      {pack.currency.symbol} {pack.currency.code}
    </span>
  </div>

  <div className="w-[1px] h-8 bg-[#EBEBEB] hidden md:block" />

  {/* Region */}
  <div className="flex flex-col">
    <span 
      className="block text-[10px] uppercase tracking-[0.2em] text-[#717171] mb-1"
      style={{ 
        fontWeight: 900, 
        WebkitTextStroke: '0.5px #717171',
        WebkitFontSmoothing: 'auto' 
      }}
    >
      Region:
    </span>
    <span className="text-sm font-black text-[#222222] uppercase tracking-tight">{pack.region}</span>
  </div>
</div>
      </header>

      {/* Main Content Sections */}
      <main className="space-y-32">
        {sections.map((section, idx) => (
          <SectionCard key={idx} section={section} />
        ))}
      </main>

      {/* Minimalist Signature Footer */}
      <footer className="mt-40 pt-16 border-t border-[#F0F0F0] flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-[10px] text-[#717171] uppercase tracking-[0.5em] font-black">
          Local City Guide • Edition {new Date(pack.updatedAt).getFullYear()}
        </div>
        <div className="text-[10px] text-[#B0B0B0] font-mono">
          ID: {pack.id.toUpperCase()} // v{pack.version}
        </div>
      </footer>
    </article>
  );
}