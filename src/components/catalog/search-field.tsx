'use client';
import { SearchIcon, XIcon } from '@/components/ui/icons';
import { COPY } from '@/content/copy';
import { setFilter, useFilter } from './filter-store';

export function SearchField() {
  const { query } = useFilter();
  return (
    <form role="search" className="relative min-w-0 flex-1" onSubmit={(e) => { e.preventDefault(); document.getElementById('todos')?.scrollIntoView({ block: 'start' }); }}>
      <label htmlFor="busca" className="sr-only">{COPY.search.label}</label>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-ink-3" />
      <input
        id="busca"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        value={query}
        placeholder={COPY.search.placeholder}
        onChange={(e) => setFilter({ query: e.target.value })}
        onKeyDown={(e) => { if (e.key === 'Escape') setFilter({ query: '' }); }}
        className="h-11 w-full rounded-card border border-line bg-surface pl-9 pr-11 text-[16px] text-ink transition-[border-color] duration-(--duration-state) placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-ink"
      />
      {query ? (
        <button
          type="button"
          aria-label={COPY.search.clear}
          onClick={() => setFilter({ query: '' })}
          className="absolute right-0 top-0 grid size-11 place-items-center rounded-card text-ink-2"
        >
          <XIcon className="size-[18px]" />
        </button>
      ) : null}
    </form>
  );
}
