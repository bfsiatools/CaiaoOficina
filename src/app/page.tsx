import { SearchField } from '@/components/catalog/search-field';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { CaioStrip } from '@/components/sections/caio-strip';
import { CatalogError } from '@/components/sections/catalog-error';
import { CatalogSection } from '@/components/sections/catalog-section';
import { HowCaioChooses } from '@/components/sections/how-caio-chooses';
import { RecentVideos } from '@/components/sections/recent-videos';
import { TodayPicks, type TodayItem } from '@/components/sections/today-picks';
import { WhatsAppStrip } from '@/components/sections/whatsapp-strip';
import { categoryLabel } from '@/content/category-labels';
import { COPY } from '@/content/copy';
import { EDITORIAL, PRODUCT_ALIASES } from '@/content/editorial';
import { SITE } from '@/content/site';
import { resolveContext } from '@/features/catalog/context';
import { pickCampaignParams, resolveCta, type ResolvedCta } from '@/features/catalog/cta';
import { pickDateLabel, todayIso } from '@/features/catalog/dates';
import { orderForGrid, selectRecent } from '@/features/catalog/derive';
import { isCatalogUnavailable, loadCatalog, type LoadedCatalog } from '@/features/catalog/load';
import type { ProductView } from '@/features/catalog/types';
import { toProductView } from '@/features/catalog/view-model';

type Params = Record<string, string | string[] | undefined>;

export default async function Home({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const devMode = process.env.NODE_ENV !== 'production' && typeof params.__state === 'string' ? params.__state : undefined;

  let catalog: LoadedCatalog;
  try {
    catalog = await loadCatalog(devMode);
  } catch (error) {
    if (!isCatalogUnavailable(error)) throw error;
    return (
      <>
        <SiteHeader><SearchField /></SiteHeader>
        <main id="conteudo">
          <PageContainer className="flex flex-col gap-6 pb-12">
            <CaioStrip />
            <CatalogError />
          </PageContainer>
        </main>
        <SiteFooter whatsappUrl={null} />
      </>
    );
  }

  const today = todayIso();
  const campaign = pickCampaignParams(params);
  const ctaFor = (v: ProductView): ResolvedCta | null =>
    v.available && v.offer
      ? resolveCta({ slug: v.slug, affiliateUrl: v.offer.affiliateUrl }, { redirectEnabled: catalog.redirectEnabled, openInNewTab: SITE.openInNewTab, campaign })
      : null;

  const views = catalog.products.map((p) => toProductView(p, EDITORIAL[p.slug], categoryLabel));
  const pinned = resolveContext(params.p, views, PRODUCT_ALIASES);
  const picks = catalog.picks.map((p) => views.find((v) => v.id === p.id)).filter((v): v is ProductView => Boolean(v));
  const featured = picks.length === 0 && !pinned ? orderForGrid(views).filter((v) => v.available).slice(0, 1) : [];

  const todayItems: TodayItem[] = [
    ...(pinned ? [{ product: pinned, cta: ctaFor(pinned), label: COPY.today.pinned, pinned: true, live: true }] : []),
    ...picks
      .filter((v) => v.id !== pinned?.id)
      .map((v) => ({ product: v, cta: ctaFor(v), label: v.dailyPickDate === today ? '' : COPY.pickDate(pickDateLabel(v.dailyPickDate ?? today, today)), live: true })),
    ...featured.map((v) => ({ product: v, cta: ctaFor(v), label: COPY.today.titleFallback })),
  ].slice(0, 3);

  const recent = selectRecent(views, today, new Set(todayItems.map((i) => i.product.id)), 8).flatMap((v) => {
    const cta = ctaFor(v);
    return cta ? [{ product: v, cta, dateLabel: pickDateLabel(v.dailyPickDate as string, today) }] : [];
  });

  const gridItems = orderForGrid(views).map((v) => ({ product: v, cta: ctaFor(v) }));
  const categories = catalog.categories
    .map((c) => ({ slug: c.slug, label: categoryLabel(c), count: views.filter((v) => v.categories.some((vc) => vc.slug === c.slug)).length }))
    .filter((c) => c.count > 0);
  const whatsappUrl = catalog.whatsapp.enabled ? catalog.whatsapp.url : null;

  return (
    <>
      <SiteHeader><SearchField /></SiteHeader>
      <main id="conteudo">
        <PageContainer className="flex flex-col gap-8 pb-14 md:gap-14">
          <CaioStrip />
          <TodayPicks items={todayItems} title={picks.length > 0 || pinned ? COPY.today.title : COPY.today.titleFallback} live={picks.length > 0 || Boolean(pinned)} />
          <RecentVideos items={recent} />
          <WhatsAppStrip url={whatsappUrl} />
          {gridItems.length > 0 ? (
            <CatalogSection items={gridItems} categories={categories} whatsappUrl={whatsappUrl} />
          ) : (
            <p className="rounded-card border border-dashed border-ink-3 p-5 text-base text-ink-2">{COPY.catalog.none}</p>
          )}
          <HowCaioChooses />
        </PageContainer>
      </main>
      <SiteFooter whatsappUrl={whatsappUrl} />
    </>
  );
}
