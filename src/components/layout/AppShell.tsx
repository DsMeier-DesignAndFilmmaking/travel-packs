import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function AppShell({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(window.matchMedia('(display-mode: standalone)').matches);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const connectionLabel = useMemo(() => (isOnline ? 'Online' : 'Offline mode'), [isOnline]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="container app-header__inner">
          <Link to={ROUTES.home} className="brand-link">
            <span className="brand-badge">✈︎</span>
            <strong>Local City Travel Packs</strong>
          </Link>
          <div className="header-actions">
            <span className={`status-pill ${isOnline ? 'status-pill--online' : 'status-pill--offline'}`}>
              {connectionLabel}
            </span>
            {!isInstalled && installPrompt ? (
              <button type="button" className="button button--ghost" onClick={() => void handleInstall()}>
                Install App
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {!isOnline ? (
        <div className="offline-banner">
          <div className="container">You are offline. Open previously downloaded city packs.</div>
        </div>
      ) : null}

      <main className="container app-main">{children}</main>
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div>
      <header style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div className="container" style={{ padding: '1rem 0' }}>
          <Link to={ROUTES.home}>
            <strong>Local City Travel Packs</strong>
          </Link>
        </div>
      </header>
      <main className="container" style={{ padding: '1.5rem 0 3rem' }}>
        {children}
      </main>
    </div>
  );
}
