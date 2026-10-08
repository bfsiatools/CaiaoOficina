import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { cn } from '@/components/ui/cn';
import type { ProductImageView } from '@/features/catalog/types';
import { PLACEHOLDER_SRC } from './constants';

export type ImageVariant = 'tile' | 'achado' | 'capa' | 'frame';
const SIZES: Record<ImageVariant, string> = {
  tile: '(min-width: 1280px) 260px, (min-width: 1024px) 30vw, (min-width: 768px) 46vw, (min-width: 360px) 44vw, 104px',
  achado: '(min-width: 1024px) 360px, (min-width: 640px) 46vw, 86vw',
  capa: '144px',
  frame: '(min-width: 768px) 200px, 128px',
};

/**
 * Painel neutro + `contain`: as fotos do Mercado Livre têm fundo branco e proporções extremas;
 * nada é cortado e o branco some no painel (multiply). Sem ampliação artificial.
 */
export function ProductImage({ variant, image, frame, name, preload = false, dimmed = false }: {
  variant: ImageVariant;
  image: ProductImageView | null;
  frame?: StaticImageData | null;
  name: string;
  preload?: boolean;
  dimmed?: boolean;
}) {
  const panel = cn(
    'relative isolate overflow-hidden bg-tile',
    variant === 'frame' ? 'aspect-[9/16] rounded-card' : 'aspect-square',
    variant === 'tile' ? 'max-xs:size-[104px] max-xs:shrink-0 max-xs:rounded-card' : 'rounded-card',
  );

  if (variant === 'frame' && frame) {
    return (
      <div className={panel}>
        <Image src={frame} alt={`Caio mostrando ${name}`} fill sizes={SIZES.frame} quality={85} preload={preload} className="object-cover" data-product-img />
      </div>
    );
  }
  if (!image) {
    return (
      <div className={panel}>
        <Image src={PLACEHOLDER_SRC} alt="" fill sizes={SIZES[variant]} className="object-contain p-6" data-broken="true" />
      </div>
    );
  }
  return (
    <div className={panel}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={SIZES[variant]}
        quality={85}
        preload={preload}
        className={cn('object-contain mix-blend-multiply', variant === 'tile' ? 'p-3.5' : 'p-2.5', dimmed && 'opacity-60 grayscale')}
        data-product-img
      />
    </div>
  );
}
