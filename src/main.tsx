import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import './styles.css';

// No more manual version tracking or hard-resetting here.
// The PWA Service Worker (v70) handles cache cleanup on its own now.

console.log(
  '[App] Build version:', __BUILD_VERSION__, 
  '| app_version:', __APP_VERSION__
);

// Optional: Log city launch for debugging
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/city/')) {
  console.log('[PWA launch] city from start_url:', window.location.pathname);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);