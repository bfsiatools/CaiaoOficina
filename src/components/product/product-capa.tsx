import { Badge } from '@/components/ui/badge';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';
import { ProductCta } from './product-cta';
import { ProductImage } from './product-image';

export function ProductCapa({ product, cta, dateLabel, ctaId }: { product: ProductView; cta: ResolvedCta; dateLabel: string; ctaId: string }) {
  return (
    <article className="relative flex w-36 shrink-0 flex-col gap-2 rounded-card transition-transform duration-(--duration-press) ease-out has-[a:active]:motion-safe:scale-[0.98] md:w-auto">
      <ProductImage variant="capa" image={product.image} name={product.displayName} />
      <Badge>{COPY.pickDate(dateLabel)}</Badge>
      <h3 className="line-clamp-2 text-sm font-semibold leading-[1.3]">{product.displayName}</h3>
      <ProductCta product={product} cta={cta} placement="daily_pick" ctaId={ctaId} variant="quiet" stretched className="min-h-8 justify-start gap-1 text-caption" />
    </article>
  );
}
