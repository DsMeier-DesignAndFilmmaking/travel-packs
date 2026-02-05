// src/pwa/registerServiceWorker.ts

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser.');
    return;
  }

  // Register the SW
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);

      // Listen for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available; please refresh.');
              // Optionally: prompt user to refresh
              showUpdatePrompt(installingWorker);
            } else {
              // First install
              console.log('Content cached for offline use.');
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

  // Optional: listen for controlling SW changes (auto-activate new SW)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New Service Worker controlling this page, reloading...');
    window.location.reload();
  });
}

// Optional: show a simple update prompt to user
function showUpdatePrompt(worker: ServiceWorker) {
  const shouldUpdate = window.confirm(
    'A new version of Travel Packs is available. Reload to update?'
  );
  if (shouldUpdate) {
    worker.postMessage({ type: 'SKIP_WAITING' });
  }
}
