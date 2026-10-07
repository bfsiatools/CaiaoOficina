'use client';
import { Chip } from '@/components/ui/chip';
import { COPY } from '@/content/copy';
import { setFilter, useFilter } from './filter-store';

export function CategoryChips({ categories }: { categories: ReadonlyArray<{ slug: string; label: string; count: number }> }) {
  const { category } = useFilter();
  return (
    <div role="group" aria-label={COPY.catalog.filterLabel} className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:flex-wrap md:px-0">
      <Chip pressed={category === null} onClick={() => setFilter({ category: null })}>{COPY.catalog.all}</Chip>
      {categories.map((c) => (
        <Chip key={c.slug} pressed={category === c.slug} onClick={() => setFilter({ category: category === c.slug ? null : c.slug })}>
          {c.label}
          <span className="ml-1.5 tabular-nums opacity-70">{c.count}</span>
        </Chip>
      ))}
    </div>
  );
}
