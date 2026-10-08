import { Badge } from '@/components/ui/badge';
import { SpecReadout } from '@/components/ui/spec-readout';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';
import { ProductCta } from './product-cta';
import { ProductImage } from './product-image';

export function ProductAchado({ product, cta, label, ctaId, preload = false, live = false, compact = false }: {
  product: ProductView;
  cta: ResolvedCta | null;
  /** Selo do card; vazio quando só repetiria o título da seção. */
  label: string;
  ctaId: string;
  preload?: boolean;
  /** Selo editorial em amarelo sobre grafite para o achado do dia / do vídeo. */
  live?: boolean;
  compact?: boolean;
}) {
  const available = product.available && cta;
  return (
    <article className="relative flex h-full snap-start flex-col overflow-hidden rounded-card border border-line bg-surface">
      <div className="relative [&>div]:aspect-[4/3] [&>div]:rounded-none">
        <ProductImage variant="achado" image={product.image} name={product.displayName} preload={preload} dimmed={!available} />
        {label ? <div className="absolute left-3 top-3"><Badge tone={live ? 'live' : 'quiet'}>{label}</Badge></div> : null}
      </div>
      <div className={`flex flex-1 flex-col gap-3 ${compact ? 'p-4' : 'p-5'}`}>
        <h3 className={`label-face line-clamp-2 font-extrabold leading-snug ${compact ? 'text-base' : 'text-md'}`}>{product.displayName}</h3>
        {!compact && product.blurb ? <p className="line-clamp-2 text-sm text-ink-2">{product.blurb}</p> : null}
        {!compact ? <SpecReadout specs={product.specs} size="md" /> : null}
        {available ? (
          <div className="mt-auto flex flex-col gap-2 pt-2">
            <ProductCta product={product} cta={cta} placement="daily_pick" ctaId={ctaId} size={compact ? 'md' : 'lg'} stretched={compact} className="w-full" />
          </div>
        ) : (
          <p className="flex min-h-11 items-center text-sm font-medium text-ink-2">{COPY.unavailable}</p>
        )}
      </div>
    </article>
  );
}
