import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityPackPage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { resetDynamicManifestToDefault, updateDynamicManifest } from '@/utils/dynamicManifest';

/** Logs pathname on mount to verify PWA deep-link (no redirect-to-home before city loads). */
function RouterLandingLogger() {
  const location = useLocation();
  useEffect(() => {
    console.log('[Router mount] window.location.pathname:', window.location.pathname, '| location.pathname:', location.pathname);
  }, []);
  return null;
}

/**
 * ManifestManager - Keeps PWA manifest, canonical, and og:url in sync with the current route.
 * Initial load is handled by synchronous scripts in index.html so the manifest/title are correct
 * before the browser uses them for A2HS. This effect runs on route changes (e.g. client-side
 * nav from home to /city/paris) so the share sheet and A2HS still see the right URL/title.
 */
function ManifestManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';

    if (path === '/') {
      // Home: use default manifest so A2HS icon is not stuck on a city
      resetDynamicManifestToDefault();
      return;
    }

    // City or other route: use dynamic manifest and update canonical/title
    const cityMatch = path.match(/^\/city\/([^/]+)$/);
    const slug = cityMatch?.[1];
    const title = slug
      ? `${slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Travel Pack`
      : undefined;
    updateDynamicManifest(path, title ? { title } : undefined);
  }, [location.pathname, location.search]);

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
      <RouterLandingLogger />
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