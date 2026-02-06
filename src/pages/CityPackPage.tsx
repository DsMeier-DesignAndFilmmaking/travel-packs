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

  // 1. Handle Missing Slug - Clean Minimalist Error
  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Location Required</h2>
        <p className="text-gray-500 mb-6">Please select a city from the catalog to continue.</p>
        <Link to={ROUTES.home} className="text-sm font-bold underline decoration-2 underline-offset-4">
          View Catalog
        </Link>
      </div>
    );
  }

  // 2. Handle Fetch Errors - Editorial Error Style
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center bg-white">
        <div className="w-12 h-[1px] bg-red-500 mb-8"></div>
        <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-4">Pack Not Found</h2>
        <p className="max-w-md text-gray-600 leading-relaxed mb-8">
          We couldn't load the guide for <span className="font-bold text-gray-900 capitalize">{slug}</span>. 
          If you're currently offline, ensure this pack was saved to your device previously.
        </p>
        <Link to={ROUTES.home} className="px-8 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // 3. Handle Loading State - Minimalist Transition
  if (!pack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-gray-900 rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Initializing Pack</p>
      </div>
    );
  }

  // 4. Final Render - No wrapping divs to avoid "box-in-box" styling issues
  return <CityPackDetailView pack={pack} />;
}