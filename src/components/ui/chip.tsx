import type { ReactNode } from 'react';
import { cn } from './cn';

export function Chip({ pressed, onClick, children }: { pressed: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center rounded-pill border px-4 text-sm font-semibold transition-[background-color,color,border-color,transform] duration-(--duration-state) ease-out motion-safe:active:scale-[0.97]',
        pressed ? 'border-plate-edge bg-plate text-readout' : 'border-line bg-surface text-ink hover:border-ink-3 hover:bg-tile',
      )}
    >
      {children}
    </button>
  );
}
