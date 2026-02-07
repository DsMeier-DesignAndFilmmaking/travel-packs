// /src/features/city-pack/CityPackPage.tsx
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

    setPack(null);
    setError(null);

    cityPackRepository
      .getCityPackBySlug(slug)
      .then((result) => {
        if (!result) throw new Error("City pack data is empty.");
        const normalizedPack: CityPack = {
          ...result,
          id: result.id || result.packId || slug,
        };
        setPack(normalizedPack);
      })
      .catch((err: Error) => {
        console.error("[CityPackPage] Load Error:", err);
        setError(err.message);
      });
  }, [slug]);

  // 1. Missing Slug State
  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center py-24 md:py-32">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#222222] mb-4">
          Location Required
        </h2>
        <p className="text-[#717171] mb-8 max-w-sm text-lg leading-relaxed">
          Select a destination from our catalog to unlock local insights and travel tips.
        </p>
        <Link to={ROUTES.home} className="btn-pill btn-pill--outline px-8 py-3 text-sm md:text-base">
          View Catalog
        </Link>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-white py-24 md:py-32">
        <div className="h-[2px] w-16 bg-[#FF385C] mb-12"></div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#222222] mb-6">
          Guide Unavailable
        </h2>
        <p className="max-w-md text-[#717171] leading-relaxed mb-10 text-lg md:text-xl">
          We couldn't locate the travel guide for{' '}
          <span className="text-[#222222] font-bold italic">{slug}</span>. It may be under maintenance or currently offline.
        </p>
        <Link to={ROUTES.home} className="btn-pill btn-pill--primary px-10 py-4 md:px-12 md:py-5 shadow-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  // 3. Loading State
  if (!pack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white py-24 md:py-32">
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 border-[3px] border-[#F7F7F7] border-t-[#222222] rounded-full animate-spin"></div>
          <span className="absolute text-sm md:text-base font-bold">✈︎</span>
        </div>
        <p className="text-[11px] md:text-xs uppercase tracking-[0.5em] text-[#717171] font-black">
          Curating Your Guide
        </p>
      </div>
    );
  }

  // 4. Loaded Pack
  return <CityPackDetailView pack={pack} />;
}
