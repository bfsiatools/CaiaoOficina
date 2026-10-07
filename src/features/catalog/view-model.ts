import { buildSearchText } from './search';
import type { Editorial, ProductView } from './types';

/** Entrada do view-model. `load.ts` é o único lugar que converte o DTO do Codex para esta forma. */
export interface CatalogProductInput {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  image: { url: string; alt: string; width: number; height: number } | null;
  categories: ReadonlyArray<{ id: string; slug: string; name: string }>;
  offer: { id: string; affiliateUrl: string } | null;
  dailyPickDate: string | null;
  dailyPickRank: number;
  featuredRank: number | null;
  sortOrder: number;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'archived';
}

export function shortenName(name: string, max = 44): string {
  const clean = name.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const window = clean.slice(0, max + 1);
  const at = window.lastIndexOf(' ');
  const base = (at > 20 ? window.slice(0, at) : clean.slice(0, max)).replace(/[\s,.;:–—-]+$/u, '');
  return `${base}…`;
}

export function firstSentence(text: string | null, max = 90): string | null {
  const clean = text?.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const sentence = (clean.match(/^.+?[.!?](\s|$)/)?.[0] ?? clean).trim();
  return sentence.length <= max ? sentence : shortenName(sentence, max);
}

export function toProductView(input: CatalogProductInput, editorial: Editorial | undefined, label: (c: { slug: string; name: string }) => string): ProductView {
  const displayName = editorial?.displayName ?? shortenName(input.name);
  const categories = input.categories.map((c) => ({ slug: c.slug, label: label(c) }));
  // Sem editorial, a descrição do Codex hoje repete o nome do anúncio: não vale como "por que está aqui".
  const fallbackBlurb = input.shortDescription && input.shortDescription.trim() !== input.name.trim() ? firstSentence(input.shortDescription) : null;
  return {
    id: input.id,
    slug: input.slug,
    displayName,
    fullName: input.name,
    blurb: editorial?.tagline ?? fallbackBlurb,
    specs: (editorial?.specs ?? []).slice(0, 2),
    categories,
    image: input.image,
    frame: editorial?.frame ?? null,
    offer: input.offer,
    available: input.offer !== null && (input.status === undefined || input.status === 'active'),
    searchText: buildSearchText([displayName, input.name, ...(editorial?.searchTerms ?? []), ...categories.map((c) => c.label)]),
    dailyPickDate: input.dailyPickDate,
    dailyPickRank: input.dailyPickRank,
  };
}
