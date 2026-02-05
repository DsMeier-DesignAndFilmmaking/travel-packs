import type { CityPack, VersionedSection } from '@/types/cityPack';

interface CityPackDetailViewProps {
  pack: CityPack;
}

function renderPayload(payload: unknown) {
  return <pre className="payload">{JSON.stringify(payload, null, 2)}</pre>;
}

function SectionCard({
  sectionKey,
  section,
}: {
  sectionKey: string;
  section: VersionedSection;
}) {
  return (
    <section className="surface pack-section">
      <h2
        style={{
          margin: 0,
          fontSize: '1rem',
          textTransform: 'capitalize',
        }}
      >
        {sectionKey}
      </h2>
      <p className="card-updated" style={{ marginTop: '0.35rem' }}>
        v{section.version} · Updated {new Date(section.updatedAt).toLocaleDateString()}
      </p>
      {section.sourceIds && section.sourceIds.length > 0 && (
        <p className="feedback">Sources: {section.sourceIds.join(', ')}</p>
      )}
      {renderPayload(section.payload)}
    </section>
  );
}

export function CityPackDetailView({ pack }: CityPackDetailViewProps) {
  const sectionEntries = Object.entries(pack.sections);

  return (
    <article className="section-stack">
      {/* Hero / city header */}
      <header className="surface hero-panel">
        <h1 className="hero-title" style={{ marginBottom: '0.35rem' }}>
          {pack.city}, {pack.country}
        </h1>
        <p className="hero-subtitle">
          {pack.region} · {pack.currency.code} ({pack.currency.symbol}) · {pack.timezone}
        </p>
      </header>

      {/* Section cards for each section */}
      <div className="pack-sections">
        {sectionEntries.map(([sectionKey, section]) => (
          <SectionCard key={sectionKey} sectionKey={sectionKey} section={section} />
        ))}
      </div>
    </article>
  );
}
