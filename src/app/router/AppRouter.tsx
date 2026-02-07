import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityPackPage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * ManifestSwapper - Swaps manifest based on current route
 * This runs BEFORE components render to avoid race conditions
 */
function ManifestSwapper() {
  const location = useLocation();

  useEffect(() => {
    // Check if we're on a city pack page
    const cityMatch = location.pathname.match(/^\/city\/([^/]+)$/);
    
    if (cityMatch) {
      const slug = cityMatch[1];
      const manifestUrl = `/api/manifest/${slug}?v=${Date.now()}`;
      
      // Remove all existing manifests
      const existingManifests = document.querySelectorAll('link[rel="manifest"]');
      existingManifests.forEach(tag => tag.remove());
      
      // Add city-specific manifest
      const manifestTag = document.createElement('link');
      manifestTag.rel = 'manifest';
      manifestTag.href = manifestUrl;
      manifestTag.id = 'city-manifest';
      
      if (document.head.firstChild) {
        document.head.insertBefore(manifestTag, document.head.firstChild);
      } else {
        document.head.appendChild(manifestTag);
      }
    } else {
      // We're on home or another page - use main manifest
      const cityTag = document.getElementById('city-manifest');
      if (cityTag) {
        cityTag.remove();
      }
      
      // Only add main manifest if it doesn't exist
      if (!document.querySelector('link[rel="manifest"]')) {
        const mainManifest = document.createElement('link');
        mainManifest.rel = 'manifest';
        mainManifest.href = '/manifest.webmanifest';
        
        if (document.head.firstChild) {
          document.head.insertBefore(mainManifest, document.head.firstChild);
        } else {
          document.head.appendChild(mainManifest);
        }
      }
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
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