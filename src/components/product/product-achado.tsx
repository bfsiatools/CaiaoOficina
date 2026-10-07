import { Badge } from '@/components/ui/badge';
import { SpecReadout } from '@/components/ui/spec-readout';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';
import { ProductCta } from './product-cta';
import { ProductImage } from './product-image';

export function ProductAchado({ product, cta, label, ctaId, preload = false, live = false }: {
  product: ProductView;
  cta: ResolvedCta | null;
  label: string;
  ctaId: string;
  preload?: boolean;
  /** Selo "ao vivo" (verde sobre grafite) para o achado do dia / do vídeo. */
  live?: boolean;
}) {
  const framed = product.frame !== null;
  const available = product.available && cta;
  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3 md:p-4">
      <div className="flex gap-3.5 md:gap-5">
        <div className="w-32 shrink-0 md:w-[200px]">
          <ProductImage
            variant={framed ? 'frame' : 'achado'}
            image={product.image}
            frame={product.frame}
            name={product.displayName}
            preload={preload}
            dimmed={!available}
            scan={preload}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
          <Badge tone={live ? 'live' : 'quiet'}>{label}</Badge>
          <h3 className="label-face line-clamp-3 text-md font-bold leading-[1.3] md:text-lg">{product.displayName}</h3>
          {product.blurb ? <p className="line-clamp-3 text-sm text-ink-2 md:text-base">{product.blurb}</p> : null}
          <SpecReadout specs={product.specs} size="md" className="mt-auto" />
        </div>
      </div>
      {available ? (
        <div className="flex flex-col gap-1.5">
          <ProductCta product={product} cta={cta} placement="daily_pick" ctaId={ctaId} size="lg" className="w-full" />
          <p className="text-center text-sm font-medium text-ink-2">{COPY.disclosure.short}</p>
        </div>
      ) : (
        <p className="flex min-h-11 items-center text-sm font-medium text-ink-2">{COPY.unavailable}</p>
      )}
    </article>
  );
}
