/**
 * ReloadPrompt — Update overlay when a new service worker is waiting.
 * Uses virtual:pwa-register/react. When needRefresh is true, user must click "Update"
 * to call updateServiceWorker(true) and break the stale UI loop.
 */
import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('[SW] Registered:', swUrl);
    },
    onRegisterError(error) {
      console.error('[SW] Registration error:', error);
    },
  });

  const handleUpdate = () => {
    void updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="alertdialog"
      aria-labelledby="reload-prompt-title"
      aria-describedby="reload-prompt-desc"
    >
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 id="reload-prompt-title" className="text-xl font-black text-[#222] mb-2">
          Update available
        </h2>
        <p id="reload-prompt-desc" className="text-[#717171] mb-6">
          A new version is ready. Tap Update to load the latest content and fix any stale display.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleUpdate}
            className="btn-pill btn-pill--primary flex-1 py-3 font-black"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="btn-pill btn-pill--outline flex-1 py-3 font-black"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
