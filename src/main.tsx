/** Nuclear PWA reset: run before React/CSS so white-screen users get SW unregistered and caches purged. */
import './pwa-reset';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import './styles.css';

const APP_VERSION_KEY = 'app_version';

function runHardResetIfNeeded(): boolean {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  const current = __APP_VERSION__;
  const stored = localStorage.getItem(APP_VERSION_KEY);
  if (stored === current) {
    return false;
  }
  localStorage.clear();
  caches.keys().then((names) => {
    return Promise.all(names.map((n) => caches.delete(n)));
  }).then(() => {
    localStorage.setItem(APP_VERSION_KEY, current);
    window.location.reload();
  });
  return true;
}

if (typeof window !== 'undefined' && runHardResetIfNeeded()) {
  // Cache/localStorage cleared; reload in progress — do not render.
} else {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APP_VERSION_KEY, __APP_VERSION__);
    console.log('[App] Build version:', __BUILD_VERSION__, '| app_version:', __APP_VERSION__);
    if (window.location.pathname.startsWith('/city/')) {
      console.log('[PWA launch] city from start_url:', window.location.pathname);
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </React.StrictMode>
  );
}