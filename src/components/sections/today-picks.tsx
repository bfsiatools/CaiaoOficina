import { ProductAchado } from '@/components/product/product-achado';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';

export interface TodayItem { product: ProductView; cta: ResolvedCta | null; label: string; pinned?: boolean; live?: boolean }

export function TodayPicks({ items, title, live = false }: { items: readonly TodayItem[]; title: string; live?: boolean }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="achados" className="hide-on-search flex flex-col gap-3">
      <h2 id="achados" className="label-face flex items-center gap-2 text-lg font-bold">
        {live ? <span aria-hidden="true" className="size-2.5 rounded-pill bg-readout ring-4 ring-readout/20" /> : null}
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {items.map((item, i) => (
          <ProductAchado
            key={item.product.id}
            product={item.product}
            cta={item.cta}
            label={item.label}
            ctaId={item.pinned ? 'contexto' : `achado-${i + 1}`}
            preload={i === 0}
            live={item.live}
          />
        ))}
      </div>
    </section>
  );
}
