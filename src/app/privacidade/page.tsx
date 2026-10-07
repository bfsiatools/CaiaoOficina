import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { PRIVACY } from '@/content/pages';
import { SITE } from '@/content/site';

export const metadata: Metadata = { title: PRIVACY.title, alternates: { canonical: '/privacidade' } };

export default function Privacidade() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <PageContainer className="flex max-w-[65ch] flex-col gap-6 py-8 md:py-14">
          <div className="flex flex-col gap-1">
            <h1 className="label-face text-xl font-extrabold">{PRIVACY.title}</h1>
            <p className="text-sm text-ink-2">Atualizado em {PRIVACY.updatedAt.split('-').reverse().join('/')}</p>
          </div>
          {PRIVACY.sections.map((s) => (
            <section key={s.title} className="flex flex-col gap-2">
              <h2 className="label-face text-lg font-bold">{s.title}</h2>
              <p className="text-base text-ink-2">{s.body}</p>
            </section>
          ))}
          {SITE.responsible ? (
            <section className="flex flex-col gap-2">
              <h2 className="label-face text-lg font-bold">Contato</h2>
              <p className="text-base text-ink-2">{SITE.responsible.email}</p>
            </section>
          ) : null}
        </PageContainer>
      </main>
      <SiteFooter whatsappUrl={null} />
    </>
  );
}
