import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';
import { ProductTile } from './product-tile';

export function ProductGrid({ items }: { items: ReadonlyArray<{ product: ProductView; cta: ResolvedCta | null }> }) {
  return (
    <ul id="todos-lista" className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {items.map(({ product, cta }, index) => (
        <li
          key={product.id}
          data-product-slug={product.slug}
          data-search={product.searchText}
          data-categories={product.categories.map((c) => c.slug).join(' ')}
          className={index < 4 ? undefined : '[contain-intrinsic-size:auto_320px] [content-visibility:auto]'}
        >
          <ProductTile product={product} cta={cta} />
        </li>
      ))}
    </ul>
  );
}
