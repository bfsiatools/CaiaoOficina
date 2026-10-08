import { SpecReadout } from '@/components/ui/spec-readout';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';
import { ProductCta } from './product-cta';
import { ProductImage } from './product-image';

export function ProductTile({ product, cta }: { product: ProductView; cta: ResolvedCta | null }) {
  const live = product.available && cta;
  return (
    <article className="group/tile relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-[border-color,transform] duration-(--duration-state) ease-out hover:border-ink-3 has-[a:active]:motion-safe:scale-[0.985] max-xs:flex-row max-xs:gap-3 max-xs:p-2.5">
      <ProductImage variant="tile" image={product.image} name={product.displayName} dimmed={!live} />
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 md:p-4 max-xs:p-0">
        <h3 className="line-clamp-2 text-base font-semibold leading-5">{product.displayName}</h3>
        {product.blurb ? <p className="line-clamp-2 text-sm text-ink-2">{product.blurb}</p> : null}
        <SpecReadout specs={product.specs} />
        <div className="mt-auto pt-3">
          {live ? (
            <ProductCta product={product} cta={cta} placement="catalog_card" ctaId="tile" stretched className="w-full gap-1! px-2! text-[13px]! md:text-sm! [&>svg]:size-4" />
          ) : (
            <p className="flex min-h-11 items-center text-sm font-medium text-ink-2">{COPY.unavailable}</p>
          )}
        </div>
      </div>
    </article>
  );
}
