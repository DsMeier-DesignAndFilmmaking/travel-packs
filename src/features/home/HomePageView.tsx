import { CityPackCard } from '@/components/city/CityPackCard';
import type { CityPackSummary } from '@/types/cityPack';

interface HomePageViewProps {
  packs: CityPackSummary[];
}

export function HomePageView({ packs }: HomePageViewProps) {
  return (
    <section>
      <h1>Explore City Travel Packs</h1>
      <p>
        Data-first catalog rendering. This view stays stable even when pack schema grows,
        because the page receives typed data from a repository abstraction.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {packs.map((pack) => (
          <CityPackCard key={pack.slug} pack={pack} />
        ))}
      </div>
    </section>
  );
}
