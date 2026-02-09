import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityPackPage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { injectCityManifest, setHomeHead } from '@/utils/dynamicManifest';

/**
 * SPA ROUTER BOOT GUARANTEE
 * - Reads window.location.pathname on boot (BrowserRouter uses browser history; no basename).
 * - Does NOT redirect on init; no <Navigate> runs on initial render except when path is exactly "/home".
 * - Does NOT restore last route; no localStorage/sessionStorage/cache for route.
 * - Does NOT depend on cached state for initial location.
 * Installed app launch MUST respect the URL it was launched with; this router does.
 */
function RouterLandingLogger() {
  const location = useLocation();
  useEffect(() => {
    console.log('[Router mount] window.location.pathname:', window.location.pathname, '| location.pathname:', location.pathname);
  }, []);
  return null;
}

/**
 * ManifestManager — Dynamic manifest per city route only.
 * - When route === "/": no manifest link (setHomeHead removes any and sets canonical/title).
 * - When route === "/city/:slug": inject city-scoped manifest with start_url and scope for that city.
 */
function ManifestManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';

    if (path === '/') {
      setHomeHead();
      return;
    }

    const cityMatch = path.match(/^\/city\/([^/]+)$/);
    const slug = cityMatch?.[1];
    if (slug) {
      const cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      injectCityManifest({ citySlug: slug, cityName });
    } else {
      setHomeHead();
    }
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