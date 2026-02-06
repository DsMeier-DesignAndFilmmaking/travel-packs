import { useEffect, useState, type PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * AppShell - The Global Layout Wrapper
 * Implements the Airbnb-style sticky nav and dynamic PWA install logic.
 * Note: The <main> tag is now "Full Bleed" to allow pages to control their own width.
 */
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
    <div className="app-layout">
      {/* Sticky Airbnb-style Navigation */}
      <header className="main-nav">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to={ROUTES.home} className="nav-logo">
            <span className="logo-icon">✈︎</span>
            <span className="logo-text text-black">localcity</span>
          </Link>

          {/* Navigation Actions */}
          <div className="nav-actions flex items-center gap-4">
            {!isOnline && (
              <div className="status-pill">
                <span className="dot dot--offline animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#717171]">
                  Offline
                </span>
              </div>
            )}
            
            {!isInstalled && installPrompt && (
              <button
                type="button"
                className="btn-pill btn-pill--outline scale-90 md:scale-100"
                onClick={() => void handleInstall()}
              >
                Install App
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global System Banner for Offline Awareness */}
      {!isOnline && (
        <div className="system-banner sticky top-[80px] z-[999]">
          Viewing downloaded city packs in offline mode
        </div>
      )}

      {/* CORE CHANGE: The <main> tag no longer has a max-width wrapper. 
          This allows the DetailView to hit its 1024px limit 
          and the HomeView to hit its 1280px limit independently.
      */}
      <main className="flex-1">
        {children}
      </main>

      <footer className="main-footer">
        <div className="footer-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="font-semibold text-[#222222]">© 2026 Local City Travel Packs</p>
            <div className="flex gap-6 text-[12px] font-medium text-[#717171]">
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span className="hover:underline cursor-pointer">Terms</span>
              <span className="hover:underline cursor-pointer">Sitemap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}