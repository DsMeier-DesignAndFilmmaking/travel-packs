import type { CityPack } from '@/types/cityPack';

interface CityPackDetailViewProps {
  pack: CityPack;
}

export function CityPackDetailView({ pack }: CityPackDetailViewProps) {
  return (
    <article>
      <h1>
        {pack.city}, {pack.country}
      </h1>
      <p>
        {pack.region} · {pack.locale} · {pack.metadata.currency}
      </p>

      {pack.sections.map((section) => (
        <section key={section.id} style={{ marginTop: '1.5rem' }}>
          <h2>{section.title}</h2>
          {section.contentBlocks.map((block, index) => (
            <div key={`${section.id}-${index}`}>
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
      ))}
    </article>
  );
}
