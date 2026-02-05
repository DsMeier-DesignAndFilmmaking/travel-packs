import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (!registration) return;
      console.info('[PWA] service worker registered');
    },
    onRegisterError(error) {
      console.error('[PWA] service worker registration failed', error);
    }
  });
}
