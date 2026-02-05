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

  // Missing slug
  if (!slug) {
    return (
      <p className="feedback feedback--error">Missing city pack id.</p>
    );
  }

  // Error loading pack
  if (error) {
    return (
      <div className="surface hero-panel">
        <p className="feedback feedback--error" style={{ marginTop: 0 }}>
          Unable to load this city pack. If you are offline, download it first from the catalog.
        </p>
        <p className="feedback">Error: {error}</p>
        <Link
          to={ROUTES.home}
          className="button button--ghost"
          style={{ display: 'inline-block', marginTop: '0.5rem' }}
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  // Loading state
  if (!pack) {
    return <p className="feedback">Loading city pack…</p>;
  }

  // Render the city pack detail
  return <CityPackDetailView pack={pack} />;
}
