import Link from 'next/link';
import { COPY } from '@/content/copy';

export function CatalogError() {
  return (
    <section role="alert" className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-5">
      <h2 className="label-face text-lg font-bold">{COPY.error.title}</h2>
      <p className="text-base text-ink-2">{COPY.error.body}</p>
      <Link
        href="/"
        className="inline-flex min-h-12 items-center rounded-card bg-accent px-5 text-[16px] font-semibold text-plate transition-[background-color,transform] duration-(--duration-press) ease-out hover:bg-accent-press motion-safe:active:scale-[0.97]"
      >
        {COPY.error.retry}
      </Link>
    </section>
  );
}
