'use client';
import { CtaLink } from '@/components/ui/cta-link';
import { COPY } from '@/content/copy';
import { resetFilter } from './filter-store';

export function EmptySearch({ whatsappUrl }: { whatsappUrl: string | null }) {
  return (
    <div data-empty-state className="flex-col items-start gap-3 rounded-card border border-dashed border-ink-3 bg-surface p-5">
      <p data-empty-query className="text-md font-semibold" />
      <p className="text-base text-ink-2">{COPY.empty.hint}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={resetFilter}
          className="inline-flex min-h-11 items-center rounded-card border-[1.5px] border-ink px-4 text-sm font-semibold transition-[background-color,color,transform] duration-(--duration-press) ease-out hover:bg-ink hover:text-ground motion-safe:active:scale-[0.97]"
        >
          {COPY.search.clearAll}
        </button>
        {whatsappUrl ? (
          <CtaLink href={whatsappUrl} rel="noopener" variant="text" track={{ event: 'whatsapp_click', placement: 'whatsapp_cta', ctaId: 'wpp-vazio' }} className="min-h-11">
            {COPY.empty.wpp}
          </CtaLink>
        ) : null}
      </div>
    </div>
  );
}
