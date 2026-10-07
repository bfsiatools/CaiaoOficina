import Image from 'next/image';
import Link from 'next/link';
import avatar from '@/assets/caio/caio-avatar-192.webp';
import { InfoIcon } from '@/components/ui/icons';
import { COPY } from '@/content/copy';
import { SITE } from '@/content/site';

/**
 * Hero compacto: o rosto do Caio, a promessa em uma frase e a transparência (IA) na mesma faixa.
 * O nome da marca já está no header; aqui o h1 diz o que é o site.
 */
export function CaioStrip() {
  return (
    <section aria-labelledby="caio-h1" className="flex items-start gap-3.5 pt-4 md:items-center md:gap-5 md:pt-8">
      <div className="relative shrink-0">
        <Image src={avatar} alt="" width={56} height={56} preload className="size-14 rounded-pill object-cover ring-2 ring-surface md:size-[72px]" />
        <span aria-hidden="true" className="absolute bottom-0.5 right-0.5 size-3.5 rounded-pill bg-readout ring-2 ring-ground" />
      </div>
      <div className="min-w-0">
        <h1 id="caio-h1" className="label-face text-md font-extrabold leading-snug md:text-xl">{COPY.strip.line}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-caption font-semibold text-ink-2">
          <span>{SITE.handle}</span>
          <span aria-hidden="true" className="text-ink-3">·</span>
          <Link href="/como-escolho" className="inline-flex min-h-6 items-center gap-1 text-accent-ink underline decoration-[1.5px]">
            <InfoIcon className="size-3.5" />
            {COPY.strip.ai}
          </Link>
        </p>
      </div>
    </section>
  );
}
