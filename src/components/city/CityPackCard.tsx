import { Link } from 'react-router-dom';
import type { CityPackSummary } from '@/types/cityPack';

interface CityPackCardProps {
  pack: CityPackSummary;
}

export function CityPackCard({ pack }: CityPackCardProps) {
  return (
    <article style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: '1rem', background: '#fff' }}>
      <h3 style={{ marginTop: 0 }}>
        <Link to={`/city/${pack.slug}`}>{pack.city}, {pack.country}</Link>
      </h3>
      <p style={{ margin: '0 0 0.5rem' }}>{pack.region}</p>
      <small>Updated: {new Date(pack.updatedAt).toLocaleDateString()}</small>
    </article>
  );
}
