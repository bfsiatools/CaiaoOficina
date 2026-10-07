import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ProductImage } from '@/components/product/product-image';
import { ProductCta } from '@/components/product/product-cta';
import { SpecReadout } from '@/components/ui/spec-readout';
import { categoryLabel } from '@/content/category-labels';
import { COPY } from '@/content/copy';
import { EDITORIAL } from '@/content/editorial';
import { SITE } from '@/content/site';
import { pickCampaignParams, resolveCta } from '@/features/catalog/cta';
import { loadCatalog } from '@/features/catalog/load';
import { toProductView } from '@/features/catalog/view-model';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const catalog = await loadCatalog();
  const input = catalog.products.find((product) => product.slug === slug);
  if (!input) notFound();
  const product = toProductView(input, EDITORIAL[slug], categoryLabel);
  const cta = product.offer && product.available ? resolveCta({ slug, affiliateUrl: product.offer.affiliateUrl }, {
    redirectEnabled: catalog.redirectEnabled,
    openInNewTab: SITE.openInNewTab,
    campaign: pickCampaignParams(await searchParams),
  }) : null;

  return <>
    <SiteHeader />
    <main id="conteudo">
      <PageContainer className="flex flex-col gap-5 py-8">
        <h1 className="label-face text-2xl font-bold">{product.displayName}</h1>
        <div className="grid gap-5 md:grid-cols-2">
          <ProductImage variant="achado" image={product.image} name={product.displayName} preload />
          <div className="flex flex-col gap-4">
            {product.blurb ? <p className="text-ink-2">{product.blurb}</p> : null}
            <SpecReadout specs={product.specs} />
            {cta ? <ProductCta product={product} cta={cta} placement="product_detail" ctaId="detalhe" /> : <p>{COPY.unavailable}</p>}
            <p className="text-sm text-ink-2">{COPY.disclosure.grid}</p>
          </div>
        </div>
      </PageContainer>
    </main>
    <SiteFooter whatsappUrl={catalog.whatsapp.enabled ? catalog.whatsapp.url : null} />
  </>;
}
