import type { CityPack, VersionedSection } from '@/types/cityPack';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

/**
 * NARRATIVE COMPONENT: Airbnb Minimalist Edition
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="pack-section">
      <h2 className="section-title text-[#222222]">
        {title}
      </h2>
      
      {criticalAlert && (
        <div className="critical-alert-box">
          <div className="flex gap-3">
            <span className="shrink-0">✨</span>
            <div className="markdown-content font-medium">
              <ReactMarkdown>{criticalAlert}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <div className="description-text">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>

      {summaryStats && (
        <div className="stats-grid">
          {summaryStats.map((stat, i) => (
            <div key={i} className="stat-pill">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value">
                <ReactMarkdown>{stat.value}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {tips && tips.length > 0 && (
        <ul className="tips-list">
          {tips.map((tip: string, i: number) => (
            <li key={i} className="tip-item text-[#222222]">
              <div className="markdown-content">
                <ReactMarkdown>{tip}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * MAIN VIEW: Editorial Style with Offline Logic
 */
export function CityPackDetailView({ pack }: { pack: CityPack }) {
  const sections = pack.sections ? Object.values(pack.sections) : [];
  
  // Property 'id' now exists on 'pack' thanks to the type update
  const { city: cityName, id: cityId } = pack;

  // 1. DYNAMIC MANIFEST LOGIC
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
    
    if (manifestTag) {
      manifestTag.setAttribute('href', manifestURL);
    }

    return () => {
      if (manifestTag) {
        manifestTag.setAttribute('href', '/manifest.webmanifest');
        URL.revokeObjectURL(manifestURL);
      }
    };
  }, [cityId, cityName]);

  // 2. SELECTIVE OFFLINE STORAGE
  useEffect(() => {
    const triggerOfflineSave = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // We send a message to the SW we updated earlier
        navigator.serviceWorker.controller.postMessage({
          type: 'DOWNLOAD_CITY_PACK',
          payload: {
            cityId: cityId,
            // You can pass specific image URLs here if your pack data includes them
            assets: [window.location.pathname] 
          }
        });
      }
    };

    triggerOfflineSave();
  }, [cityId]);

  return (
    <article className="city-pack-container">
      {/* ... render header and sections ... */}
    </article>
  );
}