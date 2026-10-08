import { SpecReadout } from '@/components/ui/spec-readout';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';
import { ProductCta, ProductCtaContent } from './product-cta';
import { ProductImage } from './product-image';

/** Content and links remain server-rendered; one grid controller supplies the tilt. */
export function Product3DCard({ product, cta }: { product: ProductView; cta: ResolvedCta | null }) {
  const live = product.available && cta;
  const contents = <>
    <div className="product-3d-image m-3 mb-0 overflow-hidden rounded-xl max-xs:m-0 max-xs:shrink-0">
      <ProductImage variant="tile" image={product.image} name={product.displayName} dimmed={!live} />
    </div>
    <div className="product-3d-info flex min-w-0 flex-1 flex-col gap-2 px-3 pb-3 md:px-4 md:pb-4 max-xs:p-0">
      <h3 className="product-3d-title min-h-10 line-clamp-2 text-base font-semibold leading-5">{product.displayName}</h3>
      <p className="min-h-11 line-clamp-2 text-sm font-normal text-ink-2" aria-hidden={product.blurb ? undefined : true}>{product.blurb || '\u00a0'}</p>
      <div className="min-h-6"><SpecReadout specs={product.specs} /></div>
      <div className="mt-auto pt-3">
        {live ? <span className="product-3d-cta flex min-h-11 items-center justify-center gap-1 rounded-card bg-accent px-2 text-[13px] font-semibold text-plate md:text-sm [&>svg]:size-4"><ProductCtaContent productName={product.displayName} /></span>
          : <p className="flex min-h-11 items-center text-sm font-medium text-ink-2">{COPY.unavailable}</p>}
      </div>
    </div>
  </>;
  const layout = 'product-3d-link flex! h-full w-full flex-col items-stretch! justify-start! gap-2! whitespace-normal! text-ink max-xs:flex-row max-xs:gap-3! max-xs:p-2.5';
  return (
    <div className="product-3d-shell h-full">
      <article data-product-3d className="product-3d-card group/tile relative flex h-full rounded-card border border-line bg-surface">
        {live ? <ProductCta product={product} cta={cta} placement="catalog_card" ctaId="tile" variant="quiet" stretched className={layout}>{contents}</ProductCta>
          : <div className={layout}>{contents}</div>}
      </article>
    </div>
  );
}
