import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export function NotFoundPage() {
  return (
    <section>
      <h1>Page Not Found</h1>
      <Link to={ROUTES.home}>Go back home</Link>
    </section>
  );
}
