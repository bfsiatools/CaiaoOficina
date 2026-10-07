import type { ReactNode } from 'react';
import { cn } from './cn';

/** Um único estilo de selo. Só carrega fato (data do achado, contexto do link). */
export function Badge({ children, tone = 'quiet' }: { children: ReactNode; tone?: 'quiet' | 'live' }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 self-start rounded-pill px-2.5 text-caption font-semibold',
        tone === 'live' ? 'bg-plate text-readout ring-1 ring-inset ring-plate-edge' : 'bg-tile text-ink-2',
      )}
    >
      {tone === 'live' ? <span aria-hidden="true" className="size-1.5 rounded-pill bg-readout" /> : null}
      {children}
    </span>
  );
}
