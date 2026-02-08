import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { registerServiceWorker } from '@/pwa/registerServiceWorker';
import './styles.css';

// Debug: confirm URL the PWA receives on launch (remove after verifying deep-link)
console.log('[PWA launch] window.location.href:', window.location.href);

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);