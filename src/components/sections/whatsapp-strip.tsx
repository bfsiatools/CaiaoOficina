import { CtaLink } from '@/components/ui/cta-link';
import { ChatIcon } from '@/components/ui/icons';
import { COPY } from '@/content/copy';

/** Segundo funil: uma faixa só, depois do primeiro CTA de produto, nunca verde cheio. */
export function WhatsAppStrip({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <section aria-labelledby="wpp" className="hide-on-search flex flex-col gap-3 rounded-card border border-line bg-surface p-4 xs:flex-row xs:items-center xs:justify-between">
      <div>
        <h2 id="wpp" className="text-base font-bold">{COPY.wpp.title}</h2>
        <p className="text-sm text-ink-2">{COPY.wpp.body}</p>
      </div>
      <CtaLink href={url} rel="noopener" variant="secondary" size="md" track={{ event: 'whatsapp_click', placement: 'whatsapp_cta', ctaId: 'wpp-faixa' }} className="shrink-0">
        <ChatIcon className="size-[18px]" />
        {COPY.wpp.button}
      </CtaLink>
    </section>
  );
}
