// src/pwa/registerServiceWorker.ts
// On SW update: skipWaiting then reload so Vercel deployments force UI refresh (cache buster).

let updateAccepted = false;

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers are not supported.');
    return;
  }

  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('[SW] Registered; scope:', registration.scope);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New content available; activating and reloading.');
            updateAccepted = true;
            installingWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        };
      };

      // Log when a waiting worker exists (new deploy is ready).
      if (registration.waiting) {
        console.log('[SW] Update waiting; reload to get latest.');
      }
    })
    .catch((error) => {
      console.error('[SW] Registration failed:', error);
    });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateAccepted) {
      updateAccepted = false;
      console.log('[SW] Controller changed; reloading to load fresh code.');
      window.location.reload();
    }
  });
}
