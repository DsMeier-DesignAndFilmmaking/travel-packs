// src/pwa/registerServiceWorker.ts
// Only reload on controllerchange when the user has accepted the "New version" prompt.
// This avoids the initial-load flicker when the SW first activates and claims the client.

let reloadPending = false;

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser.');
    return;
  }

  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
              showUpdatePrompt(installingWorker);
            } else {
              console.log('Content cached for offline use.');
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

  // Reload only when the user accepted the update (SKIP_WAITING was sent), not on first claim.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadPending) {
      reloadPending = false;
      window.location.reload();
    }
  });
}

function showUpdatePrompt(worker: ServiceWorker) {
  const shouldUpdate = window.confirm(
    'A new version of Travel Packs is available. Reload to update?'
  );
  if (shouldUpdate) {
    reloadPending = true;
    worker.postMessage({ type: 'SKIP_WAITING' });
  }
}
