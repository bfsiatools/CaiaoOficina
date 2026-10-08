import Image from 'next/image';
import { ArrowUpRightIcon } from '@/components/ui/icons';
import { COPY } from '@/content/copy';
import type { ProductView } from '@/features/catalog/types';

export function CaioStrip({ products = [] }: { products?: readonly ProductView[] }) {
  const images = products.filter((product) => product.available && product.image).slice(0, 3);
  return (
    <section aria-labelledby="caio-h1" className="hide-on-search grid overflow-hidden rounded-[24px] bg-accent md:grid-cols-2">
      <div className="flex flex-col items-start justify-center px-6 py-8 md:px-10 md:py-12 lg:px-12">
        <p className="mb-5 text-caption font-bold uppercase tracking-[0.16em]">{COPY.strip.eyebrow}</p>
        <h1 id="caio-h1" className="max-w-[12ch] text-[38px] font-extrabold leading-[1.06] tracking-[-0.045em] sm:text-[48px] lg:text-[60px]">{COPY.strip.line}</h1>
        <p className="mb-6 mt-5 max-w-[38ch] text-base leading-relaxed">{COPY.strip.body}</p>
        <a href="#todos" className="inline-flex min-h-[52px] items-center gap-5 rounded-pill bg-plate px-6 text-base font-bold text-plate-ink transition-[background-color,transform] duration-(--duration-state) hover:bg-ink-2 motion-safe:active:scale-[0.97]">
          {COPY.strip.button}<ArrowUpRightIcon className="size-5" />
        </a>
        <p className="mt-4 text-caption font-medium">{COPY.strip.disclosure}</p>
      </div>
      {images.length > 0 ? (
        <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-tile px-6 py-7 md:min-h-[440px] md:p-8">
          <div className="grid w-full max-w-[450px] grid-cols-[1.35fr_1fr] items-center gap-3 md:gap-4">
            <div className="relative aspect-[3/4] rounded-[24px] bg-surface p-4">
              <Image src={images[0].image!.url} alt={images[0].displayName} fill preload sizes="(min-width: 1024px) 260px, (min-width: 768px) 220px, 52vw" className="object-contain p-5" />
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              {images.slice(1).map((product) => (
                <div key={product.id} className="relative aspect-square rounded-[20px] bg-surface">
                  <Image src={product.image!.url} alt={product.displayName} fill sizes="(min-width: 768px) 170px, 35vw" className="object-contain p-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
