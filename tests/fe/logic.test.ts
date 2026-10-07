import { describe, expect, it } from 'vitest';
import { categoryLabel } from '@/content/category-labels';
import { resolveContext } from '@/features/catalog/context';
import { pickCampaignParams, resolveCta } from '@/features/catalog/cta';
import { pickDateLabel, todayIso } from '@/features/catalog/dates';
import { orderForGrid, selectRecent } from '@/features/catalog/derive';
import { buildSearchText, matches, normalize } from '@/features/catalog/search';
import { firstSentence, shortenName, toProductView, type CatalogProductInput } from '@/features/catalog/view-model';
import { readClickAttrs } from '@/features/tracking/click-attrs';

describe('search', () => {
  it('normalizes accents, case and punctuation', () => expect(normalize('  Câmera, ENDOSCÓPIO! ')).toBe('camera endoscopio'));
  it('keeps digits glued to letters', () => expect(normalize('150Psi 21V')).toBe('150psi 21v'));
  const text = buildSearchText(['Compressor portátil digital 150 psi', 'Calibrador Compressor Bomba De Air Portátil', 'bomba de pneu', 'Carro']);
  it('matches everything on an empty query', () => expect(matches(text, '   ')).toBe(true));
  it('is accent and case insensitive', () => expect(matches(text, 'PORTATIL')).toBe(true));
  it('requires every token', () => { expect(matches(text, 'compressor pneu')).toBe(true); expect(matches(text, 'compressor furadeira')).toBe(false); });
  it('ignores stop words', () => expect(matches(text, 'bomba de pneu')).toBe(true));
  it('skips empty parts', () => expect(buildSearchText(['A', null, undefined, '', 'b'])).toBe('a b'));
});

describe('dates (America/Sao_Paulo)', () => {
  it('uses the São Paulo calendar day', () => expect(todayIso(new Date('2026-10-07T02:30:00Z'))).toBe('2026-10-06'));
  it('rolls over at local midnight', () => expect(todayIso(new Date('2026-10-07T03:00:00Z'))).toBe('2026-10-07'));
  it('labels hoje, ontem and DD/MM across months', () => {
    expect(pickDateLabel('2026-10-07', '2026-10-07')).toBe('hoje');
    expect(pickDateLabel('2026-10-06', '2026-10-07')).toBe('ontem');
    expect(pickDateLabel('2026-09-30', '2026-10-01')).toBe('ontem');
    expect(pickDateLabel('2026-10-01', '2026-10-07')).toBe('01/10');
  });
});

const p = (id: string, date: string | null, rank = 0) => ({ id, dailyPickDate: date, dailyPickRank: rank });
describe('derive', () => {
  const items = [p('a', '2026-10-05', 1), p('b', '2026-10-06', 2), p('c', '2026-10-06', 1), p('d', '2026-10-07'), p('e', null), p('f', '2026-10-04')];
  it('keeps only past picks, newest first, rank breaks ties', () => expect(selectRecent(items, '2026-10-07', new Set()).map((x) => x.id)).toEqual(['c', 'b', 'a', 'f']));
  it('excludes ids already shown and respects the limit', () => {
    expect(selectRecent(items, '2026-10-07', new Set(['c'])).map((x) => x.id)).toEqual(['b', 'a', 'f']);
    expect(selectRecent(items, '2026-10-07', new Set(), 2)).toHaveLength(2);
  });
  it('moves unavailable items to the end', () => expect(orderForGrid([{ id: 1, available: true }, { id: 2, available: false }, { id: 3, available: true }]).map((x) => x.id)).toEqual([1, 3, 2]));
});

const product = { slug: 'compressor-portatil', affiliateUrl: 'https://meli.la/2zyu6V7' };
describe('resolveCta', () => {
  it('flag off: official link byte for byte, sponsored, same tab, no campaign params appended', () => {
    const cta = resolveCta(product, { redirectEnabled: false, openInNewTab: false, campaign: { utm_source: 'instagram' } });
    expect(cta).toEqual({ href: 'https://meli.la/2zyu6V7', mode: 'direct', rel: 'sponsored nofollow noopener' });
  });
  it('flag on: /go/slug with sanitized campaign params', () => {
    const cta = resolveCta(product, { redirectEnabled: true, openInNewTab: false, campaign: { utm_source: 'instagram', utm_content: 'video_001' } });
    expect(cta).toEqual({ href: '/go/compressor-portatil?utm_source=instagram&utm_content=video_001', mode: 'redirect', rel: 'sponsored nofollow' });
    expect(resolveCta({ ...product, slug: 'a b' }, { redirectEnabled: true, openInNewTab: false }).href).toBe('/go/a%20b');
  });
  it('new tab adds target and noopener in both modes', () => {
    expect(resolveCta(product, { redirectEnabled: true, openInNewTab: true })).toMatchObject({ target: '_blank', rel: 'sponsored nofollow noopener' });
    expect(resolveCta(product, { redirectEnabled: false, openInNewTab: true }).target).toBe('_blank');
  });
  it('keeps only whitelisted, safe, short campaign values', () => {
    expect(pickCampaignParams({ utm_source: 'instagram', utm_medium: 'reels', foo: 'x', utm_campaign: 'bad value', utm_content: '<script>', video_id: 'compressor-001' })).toEqual({ utm_source: 'instagram', utm_medium: 'reels', video_id: 'compressor-001' });
    expect(pickCampaignParams({ utm_source: ['a', 'b'] })).toEqual({ utm_source: 'a' });
    expect(pickCampaignParams({ utm_source: 'x'.repeat(65) })).toEqual({});
  });
  it('preserves content_id and video_id on internal redirects without modifying the affiliate URL', () => {
    const campaign = pickCampaignParams({ content_id: 'integration-content', video_id: 'compressor-001' });
    expect(campaign).toEqual({ content_id: 'integration-content', video_id: 'compressor-001' });
    expect(resolveCta(product, { redirectEnabled: true, openInNewTab: false, campaign }).href)
      .toBe('/go/compressor-portatil?video_id=compressor-001&content_id=integration-content');
    expect(resolveCta(product, { redirectEnabled: false, openInNewTab: false, campaign }).href)
      .toBe(product.affiliateUrl);
  });
});

const LONG = 'Calibrador Compressor Bomba De Air Portátil Recarregável Digital, Com Luz De Emergência Led mini bomba de pneu sem fio 150Psi para Encher Pneus de Carro, Moto, Bike, Bicicleta';
const base: CatalogProductInput = {
  id: 'p1', slug: 'calibrador-compressor', name: LONG, shortDescription: LONG,
  image: { url: 'https://x.test/a.webp', alt: 'Compressor portátil', width: 500, height: 495 },
  categories: [{ id: 'c1', slug: 'automotivo', name: 'Automotivo' }], offer: { id: 'o1', affiliateUrl: 'https://meli.la/2zyu6V7' },
  dailyPickDate: null, dailyPickRank: 0, featuredRank: null, sortOrder: 0,
};
describe('view-model', () => {
  it('shortens at a word boundary', () => { expect(shortenName(LONG)).toBe('Calibrador Compressor Bomba De Air Portátil…'); expect(shortenName('Paquímetro Digital Inox 150mm')).toBe('Paquímetro Digital Inox 150mm'); });
  it('takes the first sentence', () => { expect(firstSentence('Sem fio. Serve para pneus.')).toBe('Sem fio.'); expect(firstSentence(null)).toBeNull(); expect(firstSentence('  ')).toBeNull(); });
  it('without editorial: shortened name, and no blurb when the description repeats the name', () => {
    const v = toProductView(base, undefined, categoryLabel);
    expect(v.displayName).toBe('Calibrador Compressor Bomba De Air Portátil…');
    expect(v.blurb).toBeNull();
    expect(v.categories).toEqual([{ slug: 'automotivo', label: 'Carro' }]);
    expect(v.available).toBe(true);
  });
  it('prefers editorial, caps specs at 2 and indexes search terms and category labels', () => {
    const v = toProductView(base, { displayName: 'Compressor portátil digital 150 psi', tagline: 'Recarregável.', specs: ['150 PSI', 'LED', 'USB'], searchTerms: ['calibrador'] }, categoryLabel);
    expect(v.specs).toEqual(['150 PSI', 'LED']);
    expect(v.searchText).toContain('calibrador');
    expect(v.searchText).toContain('carro');
  });
  it('is unavailable without an offer or when out of stock', () => {
    expect(toProductView({ ...base, offer: null }, undefined, categoryLabel).available).toBe(false);
    expect(toProductView({ ...base, status: 'out_of_stock' }, undefined, categoryLabel).available).toBe(false);
  });
  it('maps category labels and truncates unknown long names', () => {
    expect(categoryLabel({ slug: 'casa-e-organizacao', name: 'Casa e organização' })).toBe('Casa');
    expect(categoryLabel({ slug: 'x', name: 'Uma categoria com nome muito longo' })).toBe('Uma categoria…');
  });
});

describe('resolveContext (?p=)', () => {
  const list = [{ slug: 'compressor-real-slug' }, { slug: 'furadeira' }];
  it('accepts real slugs and aliases, ignores anything else', () => {
    expect(resolveContext('furadeira', list)).toEqual({ slug: 'furadeira' });
    expect(resolveContext('compressor', list, { compressor: 'compressor-real-slug' })).toEqual({ slug: 'compressor-real-slug' });
    expect(resolveContext('nao-existe', list)).toBeNull();
    expect(resolveContext('../etc', list)).toBeNull();
    expect(resolveContext(['furadeira', 'x'], list)).toEqual({ slug: 'furadeira' });
    expect(resolveContext(undefined, list)).toBeNull();
  });
});

const el = (dataset: Record<string, string>) => ({ dataset });
describe('readClickAttrs', () => {
  it('reads a direct product CTA', () => expect(readClickAttrs(el({ event: 'product_click', placement: 'catalog_card', ctaId: 'tile', productId: 'p1', linkId: 'o1', ctaMode: 'direct' }))).toEqual({ eventType: 'product_click', placement: 'catalog_card', ctaId: 'tile', productId: 'p1', affiliateLinkId: 'o1' }));
  it('ignores redirect-mode CTAs (the server records them)', () => expect(readClickAttrs(el({ event: 'product_click', placement: 'catalog_card', ctaId: 'tile', productId: 'p1', linkId: 'o1', ctaMode: 'redirect' }))).toBeNull());
  it('reads WhatsApp without product references', () => expect(readClickAttrs(el({ event: 'whatsapp_click', placement: 'whatsapp_cta', ctaId: 'wpp-faixa', productId: 'p1' }))).toEqual({ eventType: 'whatsapp_click', placement: 'whatsapp_cta', ctaId: 'wpp-faixa', productId: null, affiliateLinkId: null }));
  it('refuses incomplete or unknown events', () => {
    expect(readClickAttrs(el({ event: 'product_click', placement: 'x', ctaId: 'y' }))).toBeNull();
    expect(readClickAttrs(el({ event: 'hack', placement: 'x', ctaId: 'y' }))).toBeNull();
    expect(readClickAttrs(el({}))).toBeNull();
  });
});
