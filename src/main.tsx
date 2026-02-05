import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import '@/styles.css';
import { registerServiceWorker } from '@/pwa/registerServiceWorker';

// ✅ Render React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);

// ✅ Register service worker once, safely
if ('serviceWorker' in navigator) {
  registerServiceWorker();
}
