import type { PropsWithChildren } from 'react';

export function AppProviders({ children }: PropsWithChildren) {
  // Reserve global providers (query client, i18n, analytics, feature flags).
  return children;
}
