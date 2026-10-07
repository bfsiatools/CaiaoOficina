import Image from 'next/image';
import Link from 'next/link';
import avatar from '@/assets/caio/caio-avatar-192.webp';
import { InfoIcon } from '@/components/ui/icons';
import { COPY } from '@/content/copy';

/** Hero compacto: quem é o Caio, o que é isto e que ele é um personagem de IA, em uma faixa. */
export function CaioStrip() {
  return (
    <section aria-labelledby="caio-h1" className="flex items-center gap-3.5 pt-5 md:gap-4 md:pt-8">
      <div className="relative shrink-0">
        <Image src={avatar} alt="" width={56} height={56} preload className="size-14 rounded-pill object-cover ring-2 ring-surface md:size-16" />
        <span aria-hidden="true" className="absolute bottom-0.5 right-0.5 size-3 rounded-pill bg-readout ring-2 ring-ground" />
      </div>
      <div className="min-w-0">
        <h1 id="caio-h1" className="label-face text-lg font-extrabold leading-tight md:text-xl">Caio da Oficina</h1>
        <p className="text-sm text-ink-2 md:text-base">{COPY.strip.line}</p>
        <Link
          href="/como-escolho"
          className="mt-0.5 inline-flex min-h-8 items-center gap-1 text-caption font-semibold text-accent-ink underline decoration-[1.5px]"
        >
          <InfoIcon className="size-3.5" />
          {COPY.strip.ai}
        </Link>
      </div>
    </section>
  );
}
