'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const subscribeHydration = () => () => {};

/** SSR keeps all links usable. Rotation is optional and stops during interaction. */
export function ProductCarousel({ children, count }: { children: ReactNode; count: number }) {
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, () => true);
  const enhanced = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const rotating = !paused && !reduce && !hovered && !focused;

  const move = useCallback((direction: number, automatic = false) => {
    const element = rail.current;
    if (!element) return;
    if (!automatic) setPaused(true);
    const first = element.children[0] as HTMLElement | undefined;
    const second = element.children[1] as HTMLElement | undefined;
    const step = first && second ? second.offsetLeft - first.offsetLeft : element.clientWidth;
    const max = element.scrollWidth - element.clientWidth;
    const next = direction > 0
      ? (element.scrollLeft >= max - 4 ? 0 : Math.min(max, element.scrollLeft + step))
      : (element.scrollLeft <= 4 ? max : Math.max(0, element.scrollLeft - step));
    element.scrollTo({ left: next, behavior: reduce ? 'instant' : 'smooth' });
  }, [reduce]);

  useEffect(() => {
    if (!rotating || count < 2) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) move(1, true);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [rotating, count, move]);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div ref={rail} tabIndex={0} role="region" aria-label="Produtos em destaque" aria-roledescription="carrossel"
        onPointerDown={() => setPaused(true)} onWheel={() => setPaused(true)}
        onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) setPaused(true); }}
        className="relative grid auto-cols-[86%] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory rounded-card pb-3 sm:auto-cols-[46%] lg:auto-cols-[31%]">
        {children}
      </div>
      {enhanced && count > 1 ? (
        <div className="mt-2 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setPaused(!paused)} disabled={reduce}
            aria-label={reduce ? 'Rotação desativada: movimento reduzido' : paused ? 'Iniciar rotação dos destaques' : 'Pausar rotação dos destaques'}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill px-2 text-sm font-medium text-ink-2 disabled:cursor-default">
            <span aria-hidden="true">{paused || reduce ? '▶' : 'Ⅱ'}</span>
            {reduce ? 'Navegação manual' : paused ? 'Reproduzir destaques' : 'Pausar destaques'}
          </button>
          <div className="flex gap-2">
            <button type="button" aria-label="Destaques anteriores" onClick={() => move(-1)} className="grid size-11 place-items-center rounded-pill border border-line bg-surface text-xl hover:bg-accent">←</button>
            <button type="button" aria-label="Próximos destaques" onClick={() => move(1)} className="grid size-11 place-items-center rounded-pill border border-line bg-surface text-xl hover:bg-accent">→</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
