import { CtaLink } from '@/components/ui/cta-link';
import { cn } from '@/components/ui/cn';
import { ArrowUpRightIcon } from '@/components/ui/icons';
import { COPY } from '@/content/copy';
import type { ResolvedCta } from '@/features/catalog/cta';
import type { ProductView } from '@/features/catalog/types';

/**
 * CTA de produto. `primary`: botão verde (só no Achado). `quiet`: linha de saída do tile/capa;
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
      variant={variant === 'primary' ? 'primary' : 'text'}
      size={size}
      track={{ event: 'product_click', placement, ctaId, productId: product.id, linkId: product.offer?.id, mode: cta.mode }}
      className={cn(
        stretched && 'after:absolute after:inset-0 after:rounded-card',
        variant === 'quiet' && 'min-h-11 w-full justify-between text-sm text-ink no-underline',
        className,
      )}
    >
      <span>{COPY.cta.label}</span>
      <ArrowUpRightIcon
        width={18}
        height={18}
        className={cn(
          'shrink-0 transition-transform duration-(--duration-state) ease-out motion-safe:group-active:-translate-y-0.5 motion-safe:group-active:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5',
          variant === 'quiet' && 'text-accent-ink',
        )}
      />
      <span className="sr-only">{COPY.cta.sr(product.displayName)}</span>
    </CtaLink>
  );
}
