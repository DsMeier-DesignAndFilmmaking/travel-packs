import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes';
import { CityPackPage } from '@/pages/CityPackPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

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

    // 4. Document title for city pages (A2HS / share sheet)
    const cityMatch = path.match(/^\/city\/([^/]+)$/);
    const slug = cityMatch?.[1];
    if (slug) {
      const titleFromSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      document.title = `${titleFromSlug} Travel Pack`;
    } else if (path === '/') {
      document.title = 'Local City Travel Packs';
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