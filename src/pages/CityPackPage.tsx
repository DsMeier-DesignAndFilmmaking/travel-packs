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
          id: result.id || result.packId || slug
        };
        setPack(normalizedPack);
      })
      .catch((err: Error) => {
        console.error("[CityPackPage] Load Error:", err);
        setError(err.message);
      });
  }, [slug]);

  // 1. Missing Slug State - Branded Minimalist
  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <h2 className="text-2xl font-black tracking-tight text-[#222222] mb-3">Location Required</h2>
        <p className="text-[#717171] mb-8 max-w-xs">Select a destination from our catalog to unlock local insights.</p>
        <Link to={ROUTES.home} className="btn-pill btn-pill--outline px-8">
          View Catalog
        </Link>
      </div>
    );
  }

  // 2. Error State - Editorial Callout Style
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-white">
        <div className="h-[1px] w-16 bg-[#FF385C] mb-12"></div>
        <h2 className="text-4xl font-black tracking-tighter text-[#222222] mb-6">Guide Unavailable</h2>
        <p className="max-w-md text-[#717171] leading-relaxed mb-10 text-lg">
          We couldn't locate the travel guide for <span className="text-[#222222] font-bold italic">{slug}</span>. 
          It may be under maintenance or currently offline.
        </p>
        <Link to={ROUTES.home} className="btn-pill btn-pill--primary px-10 py-4 shadow-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  // 3. Loading State - Minimalist PWA Transition
  if (!pack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-14 h-14 border-[2px] border-[#F7F7F7] border-t-[#222222] rounded-full animate-spin"></div>
          <span className="absolute text-sm font-bold">✈︎</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#717171] font-black">
          Curating Your Guide
        </p>
      </div>
    );
  }

  // 4. Final Render - Direct pass-through to Editorial View
  return <CityPackDetailView pack={pack} />;
}