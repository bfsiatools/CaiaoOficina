import { COPY } from '@/content/copy';

export function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-skip) focus:rounded-card focus:bg-plate focus:px-4 focus:py-3 focus:text-readout"
    >
      {COPY.skip}
    </a>
  );
}
