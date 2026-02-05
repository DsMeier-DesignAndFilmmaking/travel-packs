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

interface SectionCardProps {
  sectionKey: string;
  section: CityPackSection;
}

function SectionCard({ sectionKey, section }: SectionCardProps) {
  return (
    <section className="surface pack-section">
      <h2 style={{ margin: 0, fontSize: '1rem', textTransform: 'capitalize' }}>
        {sectionKey}
      </h2>
      {section.contentBlocks.map((block, idx) => (
        <div key={idx}>
          {Array.isArray(block.value) ? (
            <ul>
              {block.value.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>{block.value}</p>
          )}
        </div>
      ))}
    </section>
  );
}


// Main city pack detail view
export function CityPackDetailView({ pack }: CityPackDetailViewProps) {
  if (!pack) {
    return <p>Loading city pack…</p>;
  }

  const { city, country, region, timezone, currency } = pack;

  return (
    <article className="section-stack">
      <header className="surface hero-panel">
        <h1 className="hero-title" style={{ marginBottom: '0.35rem' }}>
          {city}, {country}
        </h1>
        <p className="hero-subtitle">
          {region} · {currency?.code ?? 'N/A'} ({currency?.symbol ?? '-'}) · {timezone}
        </p>
      </header>

      <div className="pack-sections">
        {Object.entries(pack.sections).map(([sectionKey, section]) => (
          <SectionCard key={sectionKey} sectionKey={sectionKey} section={section} />
        ))}
      </div>
    </article>
  );
}

