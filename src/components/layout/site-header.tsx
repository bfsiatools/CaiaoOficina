import type { ReactNode } from 'react';
import Link from 'next/link';
import { PageContainer } from './page-container';
import { Wordmark } from './wordmark';

export function SiteHeader({ children, glass = false }: { children?: ReactNode; glass?: boolean }) {
  return (
    <header className={`${glass ? 'glass-header' : 'border-b border-line bg-ground'} pt-[env(safe-area-inset-top)]`}>
      <PageContainer className="flex flex-wrap items-center gap-x-5 gap-y-4 py-5 md:flex-nowrap md:gap-10 md:py-6">
        <Wordmark />
        <nav aria-label="Principal" className="ml-auto flex items-center gap-5 text-sm font-semibold md:ml-4">
          <Link href="/#achados" className="inline-flex min-h-11 items-center hover:underline">Destaques</Link>
          <Link href="/#todos" className="inline-flex min-h-11 items-center hover:underline">Catálogo</Link>
        </nav>
        {children ? <div className="w-full md:ml-auto md:max-w-[360px]">{children}</div> : null}
      </PageContainer>
    </header>
  );
}
