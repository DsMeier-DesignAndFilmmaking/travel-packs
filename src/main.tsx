import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import '@/styles.css';

// Look for this in main.tsx or registerServiceWorker.ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', { type: 'module' }) // Add this second argument
    .then((registration) => {
      console.log('SW registered:', registration);
    })
    .catch((error) => {
      console.error('SW registration failed:', error);
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);
