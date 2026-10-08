import { ProductAchado } from '@/components/product/product-achado';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';
import { ProductCarousel } from './product-carousel';

export interface TodayItem { product: ProductView; cta: ResolvedCta | null; label: string; pinned?: boolean; live?: boolean }

export function TodayPicks({ items, title, live = false }: { items: readonly TodayItem[]; title: string; live?: boolean }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="achados" className="hide-on-search flex flex-col gap-3">
      <h2 id="achados" className="label-face flex items-center gap-2 text-xl font-extrabold">
        {live ? <span aria-hidden="true" className="size-2.5 rounded-pill bg-ink" /> : null}
        {title}
      </h2>
      <p className="mb-2 text-base text-ink-2">{COPY.today.subtitle}</p>
      <ProductCarousel count={items.length}>
        {items.map((item, i) => (
          <ProductAchado
            key={item.product.id}
            product={item.product}
            cta={item.cta}
            label={item.label}
            ctaId={item.pinned ? 'contexto' : `achado-${i + 1}`}
            live={item.live}
          />
        ))}
      </ProductCarousel>
    </section>
  );
}
