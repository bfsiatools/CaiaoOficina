import { CtaLink } from '@/components/ui/cta-link';
import { cn } from '@/components/ui/cn';
import { ArrowUpRightIcon } from '@/components/ui/icons';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';

/**
 * CTA de produto. `primary`: botão amarelo no destaque e catálogo; `quiet`: linha de saída da capa;
 * com `stretched`, o card inteiro vira o alvo de toque (um único tab stop por produto).
 */
export function ProductCta({ product, cta, placement, ctaId, size = 'md', variant = 'primary', stretched = false, className }: {
  product: ProductView;
  cta: ResolvedCta;
  placement: string;
  ctaId: string;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'quiet';
  stretched?: boolean;
  className?: string;
}) {
  return (
    <CtaLink
      href={cta.href}
      rel={cta.rel}
      target={cta.target}
      variant={variant}
      size={size}
      track={{ event: 'product_click', placement, ctaId, productId: product.id, linkId: product.offer?.id, mode: cta.mode }}
      className={cn(
        stretched && 'after:absolute after:inset-0 after:rounded-card',
        variant === 'quiet' && 'label-face min-h-11 w-full justify-between gap-1 whitespace-nowrap text-sm',
        className,
      )}
    >
      <span className="flex flex-col leading-tight">
        <span className="whitespace-nowrap">{COPY.cta.label}</span>
        <span className="mt-0.5 text-[11px] font-medium">{COPY.cta.destination}</span>
      </span>
      <ArrowUpRightIcon
        width={variant === 'quiet' ? 16 : 18}
        height={variant === 'quiet' ? 16 : 18}
        className={cn(
          'shrink-0 transition-transform duration-(--duration-state) ease-out motion-safe:group-active:-translate-y-0.5 motion-safe:group-active:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5',
          variant === 'quiet' && 'text-accent-ink',
        )}
      />
      <span className="sr-only">{COPY.cta.sr(product.displayName)}</span>
    </CtaLink>
  );
}
