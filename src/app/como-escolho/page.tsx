import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import sobre from '@/assets/caio/caio-sobre-720.webp';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ABOUT } from '@/content/pages';
import { SITE } from '@/content/site';

export const metadata: Metadata = { title: ABOUT.title, alternates: { canonical: '/como-escolho' } };

export default function ComoEscolho() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <PageContainer className="grid gap-8 py-8 md:grid-cols-[minmax(0,320px)_1fr] md:gap-14 md:py-14">
          <figure className="flex flex-col gap-2 md:sticky md:top-8 md:self-start">
            <Image src={sobre} alt={ABOUT.imageAlt} sizes="(min-width: 768px) 320px, 70vw" preload className="w-[70%] max-w-[320px] rounded-card md:w-full" />
            <figcaption className="text-caption font-semibold text-ink-2">Personagem criado com IA</figcaption>
          </figure>
          <div className="flex max-w-[65ch] flex-col gap-7">
            <div className="flex flex-col gap-3">
              <h1 className="label-face text-xl font-extrabold">{ABOUT.title}</h1>
              <p className="text-md text-ink-2">{ABOUT.lead}</p>
            </div>
            {ABOUT.sections.map((s) => (
              <section key={s.id} aria-labelledby={s.id} className="flex flex-col gap-2">
                <h2 id={s.id} className="label-face text-lg font-bold">{s.title}</h2>
                <p className="text-base text-ink-2">{s.body}</p>
              </section>
            ))}
            {SITE.responsible ? (
              <section aria-labelledby="responsavel" className="flex flex-col gap-2">
                <h2 id="responsavel" className="label-face text-lg font-bold">Quem responde por este site</h2>
                <p className="text-base text-ink-2">
                  {SITE.responsible.name}
                  {SITE.responsible.document ? ` · ${SITE.responsible.document}` : ''} · {SITE.responsible.email}
                </p>
              </section>
            ) : null}
            <Link href="/" className="inline-flex min-h-12 items-center self-start rounded-card bg-accent px-5 text-[16px] font-semibold text-plate transition-[background-color,transform] duration-(--duration-press) ease-out hover:bg-accent-press motion-safe:active:scale-[0.97]">
              Ver os achados
            </Link>
          </div>
        </PageContainer>
      </main>
      <SiteFooter whatsappUrl={null} />
    </>
  );
}
