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
