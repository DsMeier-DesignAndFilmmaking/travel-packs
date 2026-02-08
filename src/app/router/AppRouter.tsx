import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityPackPage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * ManifestManager - Keeps PWA manifest and canonical/og meta in sync with the current route.
 * - Manifest: points to dynamic manifest with start_url = current path so "Add to Home Screen"
 *   from /city/london opens directly to /city/london.
 * - Canonical + og:url: so sharing and crawlers see the current page URL.
 */
function ManifestManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';
    const origin = window.location.origin;
    const currentUrl = `${origin}${path}${location.search}`;

    // 1. Manifest: always use dynamic manifest with explicit start_url for current route
    const manifestHref = `/api/dynamic-manifest?start_url=${encodeURIComponent(path)}`;
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      manifestLink.href = manifestHref;
    } else {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestHref;
      document.head.appendChild(manifestLink);
    }

    // 2. Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = currentUrl;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = currentUrl;
      document.head.appendChild(canonicalLink);
    }

    // 3. Open Graph URL (for sharing)
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (ogUrl) {
      ogUrl.content = currentUrl;
    } else {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      ogUrl.content = currentUrl;
      document.head.appendChild(ogUrl);
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