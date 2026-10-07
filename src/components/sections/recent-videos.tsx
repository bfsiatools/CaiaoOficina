import { ProductCapa } from '@/components/product/product-capa';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';

export interface RecentItem { product: ProductView; cta: ResolvedCta; dateLabel: string }

export function RecentVideos({ items }: { items: readonly RecentItem[] }) {
  if (items.length < 2) return null;
  return (
    <section aria-labelledby="recentes" className="hide-on-search flex flex-col gap-3">
      <h2 id="recentes" className="label-face text-lg font-bold">{COPY.recent.title}</h2>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-6">
        {items.map((item, i) => (
          <li key={item.product.id} className="shrink-0 snap-start md:shrink">
            <ProductCapa product={item.product} cta={item.cta} dateLabel={item.dateLabel} ctaId={`capa-${i + 1}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
