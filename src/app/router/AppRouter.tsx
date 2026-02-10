import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityGuidePage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { setHomeHead } from '@/utils/dynamicManifest';

/**
 * ROUTER BOOT SAFETY — SPA initializes from the launch URL only.
 *
 * 1. Initial route = window.location.pathname
 *    BrowserRouter uses the browser URL; no basename or initialEntries. First paint matches the document URL.
 *
 * 2. No redirect to "last city"
 *    We never read lastCity (or any stored route) to redirect. The only automatic redirect is /home → /.
 *
 * 3. No global state on boot to override route
 *    We do not read localStorage, sessionStorage, or cache to set or change the initial route.
 *
 * 4. Persisted city data only for this city
 *    Storage is namespaced by city slug (travel-packs.city.<slug>.*). We only read the key for the current pathname, never other installs.
 *
 * BrowserRouter is used without basename or initialEntries so the initial location always comes from window.location.
 */
function RouterLandingLogger() {
  const location = useLocation();
  useEffect(() => {
    console.log('[Router mount] window.location.pathname:', window.location.pathname, '| location.pathname:', location.pathname);
  }, []);
  return null;
}

/**
 * ManifestManager — Home only. City pages use Blob manifest in CityPackDetailView (start_url = window.location.href).
 */
function ManifestManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';
    if (path === '/') setHomeHead();
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
      <RouterLandingLogger />
      <ManifestManager />
      <AppShell>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.cityPack} element={<CityGuidePage />} />
          <Route path="/home" element={<Navigate to={ROUTES.home} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}