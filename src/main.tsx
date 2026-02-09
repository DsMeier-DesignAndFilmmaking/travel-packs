import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { registerServiceWorker } from '@/pwa/registerServiceWorker';
import './styles.css';

// ROUTER BOOT SAFETY: Launch URL is the single source of truth. We do not redirect or read storage to override route.
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/city/')) {
  console.log('[PWA launch] city from start_url:', window.location.pathname);
}

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);