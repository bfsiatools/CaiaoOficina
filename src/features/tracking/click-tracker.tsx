'use client';
import { useEffect } from 'react';
import { readClickAttrs } from './click-attrs';
import { trackClick, type ClickInput } from '@/lib/tracking/client';

/** Um único listener delegado conta os cliques de saída. Falha no rastreio nunca impede a navegação. */
export function ClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.type === 'auxclick' && event.button !== 1) return;
      const anchor = (event.target as Element | null)?.closest?.('a[data-cta-id]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const attrs = readClickAttrs(anchor);
      if (!attrs) return;
      try {
        trackClick({ ...attrs, placement: attrs.placement as ClickInput['placement'] });
      } catch {
        // o rastreio é best-effort
      }
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick, true);
    };
  }, []);
  return null;
}
