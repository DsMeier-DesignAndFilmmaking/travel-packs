import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityPackPage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * ManifestManager - Updates manifest link in <head> based on route
 * Runs synchronously on every route change
 */
function ManifestManager() {
  const location = useLocation();

  useEffect(() => {
    // Extract slug from path if we're on a city page
    const cityMatch = location.pathname.match(/^\/city\/([^/]+)$/);
    const slug = cityMatch ? cityMatch[1] : null;
    
    // Determine which manifest to use
    const manifestHref = slug ? `/api/manifest/${slug}` : '/manifest.webmanifest';
    
    // Find existing manifest link
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    
    if (manifestLink) {
      // Update existing link
      manifestLink.href = manifestHref;
    } else {
      // Create new manifest link if it doesn't exist
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestHref;
      document.head.appendChild(manifestLink);
    }
    
    console.log('[ManifestManager] Updated manifest to:', manifestHref);
    
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
      <ManifestManager />
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