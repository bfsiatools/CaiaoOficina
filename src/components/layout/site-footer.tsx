import Link from 'next/link';
import { CtaLink } from '@/components/ui/cta-link';
import { Monogram } from '@/components/ui/icons';
import { COPY } from '@/content/copy';
import { SITE } from '@/content/site';
import { PageContainer } from './page-container';

export function SiteFooter({ whatsappUrl }: { whatsappUrl: string | null }) {
  return (
    <footer className="on-plate mt-4 bg-plate pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 text-sm text-plate-ink-2">
      <PageContainer className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-base font-bold text-plate-ink">
            <Monogram className="size-7" />
            Caio da Oficina
          </p>
          <p className="max-w-[60ch]">{COPY.footer.affiliate}</p>
          <p>{COPY.footer.ai}</p>
          {SITE.responsible ? (
            <p>
              {SITE.responsible.name}
              {SITE.responsible.document ? ` · ${SITE.responsible.document}` : ''} · {SITE.responsible.email}
            </p>
          ) : null}
        </div>
        <nav aria-label="Rodapé" className="flex flex-col items-start gap-1 md:items-end">
          <Link href="/como-escolho" className="inline-flex min-h-11 items-center text-plate-ink underline">{COPY.how.title}</Link>
          <Link href="/privacidade" className="inline-flex min-h-11 items-center text-plate-ink underline">{COPY.footer.privacy}</Link>
          {SITE.socials.instagram ? (
            <a href={SITE.socials.instagram} rel="noopener" className="inline-flex min-h-11 items-center text-plate-ink underline">Instagram {SITE.handle}</a>
          ) : null}
          {whatsappUrl ? (
            <CtaLink href={whatsappUrl} rel="noopener" variant="text" track={{ event: 'whatsapp_click', placement: 'whatsapp_cta', ctaId: 'wpp-rodape' }} className="min-h-11 text-readout!">
              {COPY.wpp.footer}
            </CtaLink>
          ) : null}
        </nav>
      </PageContainer>
    </footer>
  );
}
