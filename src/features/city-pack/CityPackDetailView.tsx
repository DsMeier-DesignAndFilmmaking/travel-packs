import type { CityPack, CityPackSection } from '@/types/cityPack';

interface CityPackDetailViewProps {
  pack: CityPack;
}

// Render payload or array blocks
function renderContentBlocks(blocks: CityPackSection['contentBlocks']) {
  return blocks.map((block, index) => (
    <div key={index} style={{ marginTop: '0.5rem' }}>
      {Array.isArray(block.value) ? (
        <ul>
          {block.value.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{block.value}</p>
      )}
    </div>
  ));
}

// Individual section card
function SectionCard({ section }: { section: CityPackSection }) {
  return (
    <section className="surface pack-section" style={{ marginBottom: '1rem' }}>
      <h2 style={{ margin: 0, fontSize: '1rem', textTransform: 'capitalize' }}>{section.title}</h2>
      {renderContentBlocks(section.contentBlocks)}
    </section>
  );
}

// Main city pack detail view
export function CityPackDetailView({ pack }: CityPackDetailViewProps) {
  return (
    <article className="section-stack">
      {/* Hero / city header */}
      <header className="surface hero-panel">
        <h1 className="hero-title" style={{ marginBottom: '0.35rem' }}>
          {pack.city}, {pack.country}
        </h1>
        <p className="hero-subtitle">
          {pack.region} · {pack.locale} · {pack.metadata.currency}
        </p>
      </header>

      {/* Section cards */}
      <div className="pack-sections">
        {pack.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </article>
  );
}
