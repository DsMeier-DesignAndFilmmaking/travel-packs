/**
 * PWA nuclear reset: run before any React or CSS so users stuck on white screen
 * get SW unregistered and caches purged on next visit.
 */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) reg.unregister();
  });
}
if (typeof caches !== 'undefined') {
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  });
}
