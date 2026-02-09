// src/pwa/registerServiceWorker.ts
// On SW update: skipWaiting then reload so Vercel deployments force UI refresh (cache buster).

let updateAccepted = false;

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
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content available; activating and reloading.');
            updateAccepted = true;
            installingWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateAccepted) {
      updateAccepted = false;
      window.location.reload();
    }
  });
}
