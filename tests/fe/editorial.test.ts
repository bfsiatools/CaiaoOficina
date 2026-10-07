import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COPY } from '@/content/copy';
import { EDITORIAL, PRODUCT_ALIASES } from '@/content/editorial';
import { normalize } from '@/features/catalog/search';

const products: Array<{ slug: string; name: string }> = JSON.parse(readFileSync('tests/fe/fixtures/products-names.json', 'utf8'));
const BANNED = ['melhor', 'top', 'testado', 'testei', 'incrivel', 'garantido', 'imperdivel', 'barato', 'promocao', 'oferta', 'desconto', 'mais vendido', 'mais forte', 'compar'];
const squash = (s: string) => normalize(s).replace(/ /g, '');
const bySlug = new Map(products.map((p) => [p.slug, p.name]));
const entries = Object.entries(EDITORIAL);

describe('editorial layer', () => {
  it('covers exactly the 47 real products and nothing else', () => {
    expect(products).toHaveLength(47);
    expect(Object.keys(EDITORIAL).sort()).toEqual([...bySlug.keys()].sort());
  });
  it.each(entries)('%s: respects length limits', (_slug, e) => {
    expect(e.displayName.length).toBeLessThanOrEqual(40);
    expect(e.tagline.length).toBeLessThanOrEqual(90);
    expect(e.specs.length).toBeLessThanOrEqual(2);
  });
  it.each(entries)('%s: has no superlative, test claim, price or comparison (ML 5.3/5.4)', (_slug, e) => {
    const text = normalize(`${e.displayName} ${e.tagline}`);
    for (const word of BANNED) expect(text, word).not.toContain(word);
  });
  it.each(entries)('%s: every spec appears in the listing name (ML 5.4)', (slug, e) => {
    for (const spec of e.specs) expect(squash(bySlug.get(slug) as string), spec).toContain(squash(spec));
  });
  it('aliases are unique, valid ?p= values pointing to real slugs', () => {
    for (const [alias, slug] of Object.entries(PRODUCT_ALIASES)) { expect(alias).toMatch(/^[a-z0-9-]{1,100}$/); expect(bySlug.has(slug)).toBe(true); }
    expect(PRODUCT_ALIASES.compressor).toMatch(/^calibrador-compressor/);
  });
});

describe('interface copy', () => {
  it('never uses commercial pressure words in the UI copy', () => {
    const text = normalize(JSON.stringify(COPY, (_k, v) => (typeof v === 'function' ? v('x', 1) : v)));
    for (const word of ['imperdivel', 'promocao', 'desconto', 'ultimas unidades', 'corra', 'oferta']) expect(text, word).not.toContain(word);
  });
  it('says "Mercado Livre" on the CTA (ML 1.8)', () => expect(COPY.cta.label).toContain('Mercado Livre'));
});
