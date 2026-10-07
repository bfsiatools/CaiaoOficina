import Link from 'next/link';
import { COPY } from '@/content/copy';

export function HowCaioChooses() {
  return (
    <section aria-labelledby="como" className="hide-on-search flex flex-col gap-4 border-t border-line pt-8">
      <h2 id="como" className="label-face text-lg font-bold">{COPY.how.title}</h2>
      <ul className="grid gap-4 md:grid-cols-3 md:gap-8">
        {COPY.how.points.map((point) => (
          <li key={point.title} className="flex flex-col gap-1">
            <p className="text-base font-semibold">{point.title}</p>
            <p className="text-sm text-ink-2">{point.body}</p>
          </li>
        ))}
      </ul>
      <Link href="/como-escolho" className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-accent-ink underline decoration-[1.5px]">
        {COPY.how.more}
      </Link>
    </section>
  );
}
