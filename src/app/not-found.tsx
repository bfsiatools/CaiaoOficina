import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { SiteHeader } from '@/components/layout/site-header';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <PageContainer className="flex flex-col items-start gap-4 py-14">
          <h1 className="label-face text-xl font-extrabold">Página não encontrada</h1>
          <p className="text-base text-ink-2">O endereço pode ter mudado. Os achados continuam na página inicial.</p>
          <Link href="/" className="inline-flex min-h-12 items-center rounded-card bg-accent px-5 text-[16px] font-semibold text-plate transition-[background-color,transform] duration-(--duration-press) ease-out hover:bg-accent-press motion-safe:active:scale-[0.97]">
            Voltar para os achados
          </Link>
        </PageContainer>
      </main>
    </>
  );
}
