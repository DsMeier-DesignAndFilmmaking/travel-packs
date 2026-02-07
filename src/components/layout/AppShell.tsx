// /src/components/layout/AppShell.tsx
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function AppShell({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { installPrompt, isInstalled, handleInstall } = usePWAInstall();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app-layout flex flex-col min-h-screen">
      {/* Sticky Navigation */}
      <header className="main-nav">
        <div className="nav-container">
          <Link to={ROUTES.home} className="nav-logo">
            <span className="logo-icon">✈︎</span>
            <span className="logo-text text-black">localcity</span>
          </Link>

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

      {/* Offline Banner */}
      {!isOnline && (
        <div className="system-banner sticky top-[80px] z-[999]">
          Viewing downloaded city packs in offline mode
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-24 md:pt-28 pb-12 md:pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#F0F0F0] pt-16 md:pt-24 pb-12 md:pb-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col items-center">

          {/* 1. Branding */}
          <div className="mb-12 text-center">
            <p className="text-[13px] font-black tracking-tighter uppercase text-[#222]">
              © 2026 LOCAL CITY TRAVEL PACKS
            </p>
          </div>

          {/* 2. Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-12">
            {['Privacy', 'Terms', 'Sitemap'].map((link) => (
              <a 
                key={link}
                href="#"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-[#717171] hover:text-black transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* 3. Divider */}
          <div className="w-8 h-[2px] bg-black" />
        </div>
      </footer>
    </div>
  );
}
