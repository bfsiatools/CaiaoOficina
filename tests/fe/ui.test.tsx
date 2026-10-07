import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { swapBroken } from '@/components/behaviors/image-fallback';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { PLACEHOLDER_SRC } from '@/components/product/constants';
import { ProductAchado } from '@/components/product/product-achado';
import { ProductCapa } from '@/components/product/product-capa';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductImage } from '@/components/product/product-image';
import { ProductTile } from '@/components/product/product-tile';
import { CaioStrip } from '@/components/sections/caio-strip';
import { CatalogError } from '@/components/sections/catalog-error';
import { RecentVideos } from '@/components/sections/recent-videos';
import { TodayPicks } from '@/components/sections/today-picks';
import { WhatsAppStrip } from '@/components/sections/whatsapp-strip';
import { Chip } from '@/components/ui/chip';
import { SpecReadout } from '@/components/ui/spec-readout';
import ComoEscolho from '@/app/como-escolho/page';
import Privacidade from '@/app/privacidade/page';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { buildJsonLd, serializeJsonLd } from '@/features/seo/json-ld';
import { direct, redirect, view } from './fixtures/views';

const count = (html: string, token: string) => html.split(token).length - 1;

describe('ProductTile', () => {
  const html = renderToStaticMarkup(<ProductTile product={view()} cta={direct} />);
  it('has exactly one link: the stretched CTA with the exact official href', () => {
    expect(count(html, '<a ')).toBe(1);
    expect(html).toContain('href="https://meli.la/2zyu6V7"');
    expect(html).toContain('after:absolute');
    expect(html).toContain('rel="sponsored nofollow noopener"');
  });
  it('names the product and the destination for screen readers', () => expect(html).toContain(', Compressor portátil digital 150 psi (abre o Mercado Livre)'));
  it('shows name, blurb, readouts and the Mercado Livre label, never a price', () => {
    for (const t of ['Ver no Mercado Livre', 'Compressor portátil digital 150 psi', 'Recarregável e sem fio.', '150 PSI']) expect(html).toContain(t);
    expect(html).not.toMatch(/R\$/);
  });
  it('tracks as catalog_card with product and link ids', () => {
    for (const t of ['data-placement="catalog_card"', 'data-cta-id="tile"', 'data-product-id="p1"', 'data-link-id="o1"', 'data-cta-mode="direct"']) expect(html).toContain(t);
  });
  it('becomes a horizontal row below 360px and has a 44px target line', () => { expect(html).toContain('max-xs:flex-row'); expect(html).toContain('min-h-11'); });
  it('renders unavailable products without a link', () => {
    const off = renderToStaticMarkup(<ProductTile product={view({ available: false, offer: null })} cta={null} />);
    expect(off).not.toContain('<a ');
    expect(off).toContain('Indisponível no momento');
    expect(off).toContain('opacity-60');
  });
});

describe('ProductAchado', () => {
  const html = renderToStaticMarkup(<ProductAchado product={view()} cta={direct} label="Achado de hoje" ctaId="achado-1" preload live />);
  it('has the date badge, the disclosure and a 52px primary CTA tracked as daily_pick', () => {
    for (const t of ['Achado de hoje', 'Publi · link de afiliado', 'min-h-[52px]', 'bg-accent', 'data-placement="daily_pick"', 'data-cta-id="achado-1"']) expect(html).toContain(t);
  });
  it('preloads only its image (LCP) and runs the one-time laser scan', () => { expect(html).toContain('data-preload="true"'); expect(html).toContain('scan-beam'); });
  it('uses the Caio frame when the editorial provides one', () => expect(renderToStaticMarkup(<ProductAchado product={view({ frame: { src: '/f.webp', width: 360, height: 640 } })} cta={direct} label="x" ctaId="achado-1" />)).toContain('Caio mostrando'));
  it('points to /go and skips the browser beacon when the redirect flag is on', () => {
    const r = renderToStaticMarkup(<ProductAchado product={view()} cta={redirect} label="x" ctaId="achado-1" />);
    expect(r).toContain('href="/go/compressor-portatil"');
    expect(r).toContain('data-cta-mode="redirect"');
  });
});

describe('ProductCapa and ProductGrid', () => {
  it('capa: date badge, a single stretched link', () => {
    const html = renderToStaticMarkup(<ProductCapa product={view()} cta={direct} dateLabel="ontem" ctaId="capa-1" />);
    expect(html).toContain('Achado de ontem');
    expect(count(html, '<a ')).toBe(1);
  });
  it('grid: filter data on each item and 1/2/3/4 columns', () => {
    const html = renderToStaticMarkup(<ProductGrid items={[{ product: view(), cta: direct }, { product: view({ id: 'p2', slug: 'furadeira', searchText: 'furadeira', categories: [{ slug: 'ferramentas-e-reparos', label: 'Ferramentas' }] }), cta: direct }]} />);
    for (const t of ['data-product-slug="furadeira"', 'data-search="furadeira"', 'data-categories="ferramentas-e-reparos"', 'grid-cols-1', 'xs:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4']) expect(html).toContain(t);
  });
});

describe('ProductImage and fallback', () => {
  const image = { url: 'https://x.test/a.webp', alt: 'Compressor portátil preto', width: 500, height: 495 };
  it('contains the product on the neutral panel, lazily by default', () => {
    const html = renderToStaticMarkup(<ProductImage variant="tile" image={image} name="x" />);
    for (const t of ['alt="Compressor portátil preto"', 'object-contain', 'data-product-img', 'bg-tile']) expect(html).toContain(t);
    expect(html).not.toContain('data-preload');
  });
  it('uses a decorative placeholder when there is no image', () => { const html = renderToStaticMarkup(<ProductImage variant="tile" image={null} name="x" />); expect(html).toContain(PLACEHOLDER_SRC); expect(html).toContain('alt=""'); });
  it('swaps a failed image once', () => {
    const calls: string[] = [];
    const img = { dataset: {} as Record<string, string>, src: 'a', removeAttribute: (n: string) => calls.push(n), classList: { remove: () => undefined } } as unknown as HTMLImageElement;
    swapBroken(img);
    swapBroken(img);
    expect(img.src).toBe(PLACEHOLDER_SRC);
    expect(calls).toEqual(['srcset']);
  });
});

describe('primitives', () => {
  it('chip exposes pressed state and a 44px target', () => { const html = renderToStaticMarkup(<Chip pressed>Carro</Chip>); expect(html).toContain('aria-pressed="true"'); expect(html).toContain('min-h-11'); });
  it('readout renders nothing without specs', () => expect(renderToStaticMarkup(<SpecReadout specs={[]} />)).toBe(''));
});

describe('sections', () => {
  it('Caio strip: the only h1, decorative avatar, AI badge linking to /como-escolho', () => {
    const html = renderToStaticMarkup(<CaioStrip />);
    expect(count(html, '<h1')).toBe(1);
    for (const t of ['alt=""', 'Personagem criado com IA', 'href="/como-escolho"']) expect(html).toContain(t);
  });
  it('today picks: pinned product uses the contexto id; fallback title never says hoje', () => {
    const html = renderToStaticMarkup(<TodayPicks items={[{ product: view(), cta: direct, label: 'Do vídeo que você viu', pinned: true }]} title="Em destaque" />);
    expect(html).toContain('data-cta-id="contexto"');
    expect(html).not.toContain('Achados de hoje');
  });
  it('recent rail needs at least 2 items and numbers capa ids', () => {
    expect(renderToStaticMarkup(<RecentVideos items={[{ product: view(), cta: direct, dateLabel: 'ontem' }]} />)).toBe('');
    const html = renderToStaticMarkup(<RecentVideos items={[{ product: view(), cta: direct, dateLabel: 'ontem' }, { product: view({ id: 'p2', slug: 'b' }), cta: direct, dateLabel: '05/10' }]} />);
    expect(html).toContain('data-cta-id="capa-2"');
  });
  it('WhatsApp strip: hidden without URL; secondary, never green', () => {
    expect(renderToStaticMarkup(<WhatsAppStrip url={null} />)).toBe('');
    const html = renderToStaticMarkup(<WhatsAppStrip url="https://chat.whatsapp.com/abc" />);
    expect(html).toContain('data-cta-id="wpp-faixa"');
    expect(html).not.toContain('bg-accent');
  });
  it('catalog error announces with retry', () => { const html = renderToStaticMarkup(<CatalogError />); expect(html).toContain('role="alert"'); expect(html).toContain('Tentar de novo'); });
  it('header and footer: home link, affiliate and AI disclosures, tracked WhatsApp only when present', () => {
    expect(renderToStaticMarkup(<SiteHeader />)).toContain('href="/"');
    const off = renderToStaticMarkup(<SiteFooter whatsappUrl={null} />);
    expect(off).toContain('afiliado do Mercado Livre');
    expect(off).toContain('inteligência artificial');
    expect(off).not.toContain('wpp-rodape');
    expect(renderToStaticMarkup(<SiteFooter whatsappUrl="https://chat.whatsapp.com/abc" />)).toContain('data-cta-id="wpp-rodape"');
  });
});

describe('pages and SEO', () => {
  it('/como-escolho: one h1, AI and affiliate stated, no test claims or price', () => {
    const html = renderToStaticMarkup(<ComoEscolho />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain('personagem criado com inteligência artificial');
    expect(html).toContain('comissão');
    expect(html.toLowerCase()).not.toMatch(/testado|melhor|garantido|r\$/);
    expect(html).not.toContain('Quem responde por este site');
  });
  it('/privacidade: what is and is not recorded', () => {
    const html = renderToStaticMarkup(<Privacidade />);
    for (const t of ['O que registramos', 'Não registramos seu IP', 'Mercado Livre']) expect(html).toContain(t);
  });
  it('robots blocks /api and /go; sitemap lists the three pages', () => {
    expect(robots().rules).toEqual([{ userAgent: '*', allow: '/', disallow: ['/api/', '/go/'] }]);
    expect(sitemap().map((e) => new URL(e.url).pathname)).toEqual(['/', '/como-escolho', '/privacidade']);
  });
  it('JSON-LD has only WebSite and Organization and escapes <', () => {
    const graph = buildJsonLd('https://caio.example');
    expect(JSON.stringify(graph)).not.toMatch(/Product|Offer|Review|Rating/);
    expect(serializeJsonLd({ a: '</script>' })).not.toContain('<');
  });
});
