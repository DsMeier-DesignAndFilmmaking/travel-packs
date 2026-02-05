import type { CityPack, VersionedSection } from '@/types/cityPack';

interface CityPackDetailViewProps {
  pack: CityPack;
}

/**
 * Safely render any payload.
 * If it's an array, list each item.
 * If it's an object, stringify it nicely.
 */
function renderPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return (
      <ul className="payload-list">
        {payload.map((item, idx) => (
          <li key={idx}>
            {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof payload === 'object' && payload !== null) {
    return <pre className="payload">{JSON.stringify(payload, null, 2)}</pre>;
  }

  return <span>{String(payload)}</span>;
}

/**
 * Card for a single VersionedSection
 */
function SectionCard({
  sectionKey,
  section,
}: {
  sectionKey: string;
  section: VersionedSection;
}) {
  return (
    <section className="surface pack-section">
      <h2 style={{ margin: 0, fontSize: '1rem', textTransform: 'capitalize' }}>
        {sectionKey}
      </h2>
      <p className="card-updated" style={{ marginTop: '0.35rem' }}>
        v{section.version} · Updated{' '}
        {new Date(section.updatedAt).toLocaleDateString()}
      </p>

      {section.sourceIds && section.sourceIds.length > 0 && (
        <p className="feedback">Sources: {section.sourceIds.join(', ')}</p>
      )}

      {renderPayload(section.payload)}
    </section>
  );
}

/**
 * Full CityPack detail view
 */
export function CityPackDetailView({ pack }: CityPackDetailViewProps) {
  // Make sure sections exist before mapping
  const sectionEntries = pack.sections
    ? Object.entries(pack.sections)
    : [];

  if (!sectionEntries.length) {
    return (
      <p className="feedback">
        No sections available for {pack.city}, {pack.country}.
      </p>
    );
  }

  return (
    <article className="section-stack">
      {/* Hero / city header */}
      <header className="surface hero-panel">
        <h1 className="hero-title" style={{ marginBottom: '0.35rem' }}>
          {pack.city}, {pack.country}
        </h1>
        <p className="hero-subtitle">
          {pack.region} · {pack.currency?.code} ({pack.currency?.symbol}) ·{' '}
          {pack.timezone}
        </p>
      </header>

      {/* Render all sections */}
      <div className="pack-sections">
      {sectionEntries.map(([sectionKey, section]) => (
          <SectionCard
            key={sectionKey}
            sectionKey={sectionKey}
            section={section} // <- type now matches VersionedSection
          />
        ))}
      </div>
    </article>
  );
}
