import { notFound } from 'next/navigation';
import { SearchField } from '@/components/catalog/search-field';
import { PageContainer } from '@/components/layout/page-container';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CatalogSection } from '@/components/sections/catalog-section';
import { categoryLabel } from '@/content/category-labels';
import { EDITORIAL } from '@/content/editorial';
import { SITE } from '@/content/site';
import { pickCampaignParams, resolveCta } from '@/features/catalog/cta';
import { loadCatalog } from '@/features/catalog/load';
import { toProductView } from '@/features/catalog/view-model';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const catalog = await loadCatalog();
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const campaign = pickCampaignParams(await searchParams);
  const items = catalog.products.filter((product) => product.categories.some((item) => item.slug === slug)).map((input) => {
    const product = toProductView(input, EDITORIAL[input.slug], categoryLabel);
    const cta = product.offer && product.available ? resolveCta({ slug: product.slug, affiliateUrl: product.offer.affiliateUrl }, {
      redirectEnabled: catalog.redirectEnabled, openInNewTab: SITE.openInNewTab, campaign,
    }) : null;
    return { product, cta };
  });
  const whatsappUrl = catalog.whatsapp.enabled ? catalog.whatsapp.url : null;

  return <>
    <SiteHeader><SearchField /></SiteHeader>
    <main id="conteudo">
      <PageContainer className="flex flex-col gap-5 py-8">
        <h1 className="label-face text-2xl font-bold">{category.name}</h1>
        <CatalogSection items={items} categories={[]} whatsappUrl={whatsappUrl} />
      </PageContainer>
    </main>
    <SiteFooter whatsappUrl={whatsappUrl} />
  </>;
}
