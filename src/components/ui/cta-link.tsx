import type { ReactNode } from 'react';
import type { CtaMode } from '@/features/catalog/cta';
import { cn } from './cn';

export interface TrackAttrs { event: 'product_click' | 'whatsapp_click'; placement: string; ctaId: string; productId?: string; linkId?: string; mode?: CtaMode }
type Variant = 'primary' | 'secondary' | 'text' | 'quiet';
type Size = 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent font-semibold text-plate hover:bg-accent-press active:bg-accent-press',
  secondary: 'border-[1.5px] border-ink font-semibold text-ink hover:bg-ink hover:text-ground',
  text: 'font-semibold text-accent-ink underline decoration-[1.5px]',
  quiet: 'font-semibold text-ink',
};
const SIZE: Record<Size, string> = { md: 'min-h-11 px-3.5 text-sm', lg: 'min-h-[52px] px-4 text-[16px]' };

/** Todo link de saída rastreável do site passa por aqui (produto e WhatsApp). */
export function CtaLink({ href, rel, target, label, variant = 'primary', size = 'md', track, className, children }: {
  href: string; rel?: string; target?: '_blank'; variant?: Variant; size?: Size; track: TrackAttrs; className?: string; children: ReactNode;
  label?: string;
}) {
  return (
    <a
      href={href}
      rel={rel}
      target={target}
      aria-label={label}
      data-cta-id={track.ctaId}
      data-event={track.event}
      data-placement={track.placement}
      data-product-id={track.productId}
      data-link-id={track.linkId}
      data-cta-mode={track.mode}
      className={cn(
        'group inline-flex items-center justify-center gap-1.5 rounded-card transition-[background-color,color,transform] duration-(--duration-press) ease-out motion-safe:active:scale-[0.97]',
        variant !== 'text' && variant !== 'quiet' && SIZE[size],
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}
