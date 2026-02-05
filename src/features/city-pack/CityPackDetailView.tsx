import type { CityPack, VersionedSection } from '@/types/cityPack';
import ReactMarkdown from 'react-markdown';

/**
 * NARRATIVE COMPONENT: Airbnb Minimalist Edition
 * Focuses on typography and vertical flow rather than "boxed" UI.
 */
function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="pack-section">
      {/* 1. Typography Hierarchy */}
      <h2 className="section-title text-[#222222]">
        {title}
      </h2>
      
      {/* 2. Critical Alert: Soft editorial callout */}
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

      {/* 3. Description: Light editorial gray */}
      <div className="description-text">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>

      {/* 4. Stats Grid: Vertical Border Style */}
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

      {/* 5. Expert Tips: Minimalist Bullets */}
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
 * MAIN VIEW: Editorial Style
 */
export function CityPackDetailView({ pack }: { pack: CityPack }) {
  const sections = pack.sections ? Object.values(pack.sections) : [];

  return (
    <article className="city-pack-container">
      {/* Airbnb-style Editorial Header */}
      <header className="hero-panel">
        <h1 className="hero-title text-[#222222]">
          {pack.city}
        </h1>
        <div className="flex items-center gap-2 hero-subtitle">
          <span>{pack.country}</span>
          <span className="text-[#DDDDDD] font-light">/</span>
          <span>{pack.region}</span>
          <span className="text-[#DDDDDD] font-light">/</span>
          <span className="font-semibold text-[#222222]">
            {pack.currency.symbol} {pack.currency.code}
          </span>
        </div>
      </header>

      {/* Sequential Scroll Content */}
      <div className="flex flex-col">
        {sections.map((section, idx) => (
          <SectionCard key={idx} section={section} />
        ))}
      </div>
    </article>
  );
}