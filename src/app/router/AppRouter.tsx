import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityPackPage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * ManifestSwapper - Swaps manifest based on current route
 * 
 * IMPORTANT: Browser DevTools shows CACHED manifest info and won't update
 * until you manually refresh. This is normal browser behavior, not a bug.
 * 
 * What matters: When user clicks "Add to Home Screen", the browser fetches
 * the CURRENT manifest link, which will be the correct city-specific one.
 */
function ManifestSwapper() {
  const location = useLocation();

  useEffect(() => {
    // Check if we're on a city pack page
    const cityMatch = location.pathname.match(/^\/city\/([^/]+)$/);
    
    // Remove ALL existing manifest links
    document.querySelectorAll('link[rel="manifest"]').forEach(tag => tag.remove());
    
    let manifestUrl: string;
    
    if (cityMatch) {
      const slug = cityMatch[1];
      manifestUrl = `/api/manifest/${slug}`;
    } else {
      manifestUrl = '/manifest.webmanifest';
    }
    
    // Create new manifest link
    const manifestTag = document.createElement('link');
    manifestTag.rel = 'manifest';
    manifestTag.href = manifestUrl;
    
    // Insert immediately at start of head
    if (document.head.firstChild) {
      document.head.insertBefore(manifestTag, document.head.firstChild);
    } else {
      document.head.appendChild(manifestTag);
    }
    
  }, [location.pathname]);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <ManifestSwapper />
      <AppShell>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.cityPack} element={<CityPackPage />} />
          <Route path="/home" element={<Navigate to={ROUTES.home} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}