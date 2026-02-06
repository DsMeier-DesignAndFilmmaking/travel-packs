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
  const [isInstalled, setIsInstalled] = useState<boolean>(
    window.matchMedia('(display-mode: standalone)').matches
  );

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

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="app-layout min-h-screen flex flex-col bg-white">
      <header className="main-nav">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to={ROUTES.home} className="nav-logo">
            <span className="logo-icon">✈︎</span>
            <span className="logo-text">localcity</span>
          </Link>

          {/* Navigation Actions */}
          <div className="nav-actions">
            {!isOnline && (
              <div className="system-banner">
                <span className="dot dot--offline"></span>
                Offline
              </div>
            )}
            
            {!isInstalled && installPrompt && (
              <button
                type="button"
                className="btn-pill btn-pill--outline"
                onClick={() => void handleInstall()}
              >
                Install App
              </button>
            )}
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="system-banner">
          Viewing downloaded city packs in offline mode
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="main-footer">
        <div className="footer-container">
          <p>© 2026 Local City Travel Packs</p>
        </div>
      </footer>
    </div>
  );
}