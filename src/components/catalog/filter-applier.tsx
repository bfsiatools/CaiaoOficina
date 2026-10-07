'use client';
import { useEffect } from 'react';
import { COPY } from '@/content/copy';
import { isVisible, useFilter } from './filter-store';

/**
 * Aplica busca e categoria aos cards já renderizados no servidor, só alternando `hidden`.
 * Nenhum card é re-renderizado nem hidratado.
 */
export function FilterApplier({ total }: { total: number }) {
  const state = useFilter();
  useEffect(() => {
    const root = document.getElementById('todos');
    if (!root) return;
    let shown = 0;
    root.querySelectorAll<HTMLElement>('[data-product-slug]').forEach((el) => {
      const visible = isVisible({ searchText: el.dataset.search ?? '', categories: (el.dataset.categories ?? '').split(' ').filter(Boolean) }, state);
      el.hidden = !visible;
      if (visible) shown += 1;
    });
    const count = document.getElementById('catalog-count');
    if (count) count.textContent = COPY.catalog.count(shown, total);
    root.dataset.empty = shown === 0 ? 'true' : 'false';
    const label = root.querySelector('[data-empty-query]');
    if (label) label.textContent = COPY.empty.title(state.query.trim());
    document.documentElement.dataset.searching = state.query.trim() ? 'true' : 'false';
  }, [state, total]);
  return null;
}
