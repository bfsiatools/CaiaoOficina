import { CategoryChips } from '@/components/catalog/category-chips';
import { EmptySearch } from '@/components/catalog/empty-search';
import { FilterApplier } from '@/components/catalog/filter-applier';
import { ProductGrid } from '@/components/product/product-grid';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';

export function CatalogSection({ items, categories, whatsappUrl }: {
  items: ReadonlyArray<{ product: ProductView; cta: ResolvedCta | null }>;
  categories: ReadonlyArray<{ slug: string; label: string; count: number }>;
  whatsappUrl: string | null;
}) {
  return (
    <section id="todos" aria-labelledby="todos-h2" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="todos-h2" className="label-face text-lg font-bold">{COPY.catalog.title}</h2>
        <p id="catalog-count" aria-live="polite" className="text-sm tabular-nums text-ink-2">{COPY.catalog.count(items.length, items.length)}</p>
      </div>
      <div className="sticky top-0 z-(--z-chips) -mx-4 border-b border-transparent bg-ground px-4 py-2 md:mx-0 md:px-0">
        <CategoryChips categories={categories} />
      </div>
      <p className="max-w-[70ch] text-sm text-ink-2">{COPY.disclosure.grid}</p>
      <ProductGrid items={items} />
      <EmptySearch whatsappUrl={whatsappUrl} />
      <FilterApplier total={items.length} />
    </section>
  );
}
