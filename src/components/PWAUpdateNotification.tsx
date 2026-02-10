import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdateNotification() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => setNeedRefresh(false);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-2xl p-4 rounded-lg border border-gray-200 flex items-center gap-4 animate-bounce">
      <p className="text-sm font-medium text-gray-800">New version available!</p>
      <button 
        onClick={() => updateServiceWorker(true)}
        className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold"
      >
        Update Now
      </button>
      <button onClick={close} className="text-gray-400 text-xs">Dismiss</button>
    </div>
  );
}