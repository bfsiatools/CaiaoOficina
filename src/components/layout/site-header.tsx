import type { ReactNode } from 'react';
import { PageContainer } from './page-container';
import { Wordmark } from './wordmark';

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-line bg-ground pt-[env(safe-area-inset-top)]">
      <PageContainer className="flex h-16 items-center gap-3">
        <Wordmark />
        {children}
      </PageContainer>
    </header>
  );
}
