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


      <footer className="main-footer border-t border-[#F0F0F0] py-16 w-full" style={{ display: 'flex', justifyContent: 'center' }}>
  <div className="footer-container px-6" style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', gap: '24px' }}>
      
      {/* 1. Brand Copyright */}
      <p 
        style={{ 
          fontSize: '13px',
          color: '#222222',
          fontWeight: 900, 
          WebkitTextStroke: '0.4px #222222', 
          WebkitFontSmoothing: 'auto',
          letterSpacing: '-0.02em',
          margin: 0
        }}
      >
        © 2026 LOCAL CITY TRAVEL PACKS
      </p>

      {/* 2. Navigation Links - Forced Center */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '32px', 
        width: '100%' 
      }}>
        {['Privacy', 'Terms', 'Sitemap'].map((link) => (
          <span 
            key={link}
            className="hover:text-[#222222] cursor-pointer transition-colors"
            style={{
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#717171'
            }}
          >
            {link}
          </span>
        ))}
      </div>

      {/* 3. Decorative Divider */}
      <div style={{ width: '32px', height: '1px', backgroundColor: '#EBEBEB', marginTop: '8px' }} />
      
    </div>
  </div>
</footer>
    </div>
  );
}