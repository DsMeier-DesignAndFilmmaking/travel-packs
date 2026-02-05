import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CityPackDetailView } from '@/features/city-pack/CityPackDetailView';
import { cityPackRepository } from '@/services/content/cityPackRepository';
import { ROUTES } from '@/config/routes';
import type { CityPack } from '@/types/cityPack';

export function CityPackPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pack, setPack] = useState<CityPack | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    cityPackRepository
      .getCityPackBySlug(slug)
      .then((result) => setPack(result))
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  if (!slug) {
    return <p>Missing city pack id.</p>;
  }

  if (error) {
    return (
      <div>
        <p>Unable to load city pack: {error}</p>
        <Link to={ROUTES.home}>Back to catalog</Link>
      </div>
    );
  }

  if (!pack) {
    return <p>Loading city pack...</p>;
  }

  return <CityPackDetailView pack={pack} />;
}
