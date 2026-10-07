import 'server-only';
import { CatalogUnavailableError } from '@/lib/catalog/queries';
import { getCatalog, getDailyPicks } from '@/lib/catalog/server';
import type { ProductCard } from '@/lib/catalog/types';
import { readServerEnv } from '@/lib/env/server';
import type { CatalogProductInput } from './view-model';

/** Único adaptador entre o DAL do Codex e o frontend. Nenhum componente conhece o DTO. */
export interface LoadedCatalog {
  products: CatalogProductInput[];
  categories: Array<{ id: string; slug: string; name: string }>;
  picks: CatalogProductInput[];
  whatsapp: { enabled: boolean; url: string | null };
  redirectEnabled: boolean;
}

export class CatalogUnavailable extends Error {}
export const isCatalogUnavailable = (e: unknown): e is CatalogUnavailable => e instanceof CatalogUnavailable;

export function toInput(card: ProductCard): CatalogProductInput {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    shortDescription: card.shortDescription,
    image: { url: card.image.url, alt: card.image.alt, width: card.image.width, height: card.image.height },
    categories: card.categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name })),
    offer: { id: card.offer.id, affiliateUrl: card.offer.affiliateUrl },
    dailyPickDate: card.dailyPickDate,
    dailyPickRank: card.dailyPickRank,
    featuredRank: card.featuredRank,
    sortOrder: card.sortOrder,
  };
}

const DEV_MODES = new Set(['local', 'local-recent', 'one', 'long', 'empty', 'error']);

export async function loadCatalog(devMode?: string): Promise<LoadedCatalog> {
  // Pré-visualização só em desenvolvimento (o ramo inteiro some do build de produção).
  if (process.env.NODE_ENV !== 'production' && devMode && DEV_MODES.has(devMode)) {
    if (devMode === 'error') throw new CatalogUnavailable('simulado');
    if (devMode === 'empty') return { products: [], categories: [], picks: [], whatsapp: { enabled: false, url: null }, redirectEnabled: false };
    const { loadLocalCatalog } = await import('@/dev/local-catalog');
    return loadLocalCatalog(devMode as 'local' | 'local-recent' | 'one' | 'long');
  }
  try {
    const [snapshot, picks] = await Promise.all([getCatalog(), getDailyPicks()]);
    return {
      products: snapshot.products.map(toInput),
      categories: snapshot.categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name })),
      picks: picks.map(toInput),
      whatsapp: { enabled: Boolean(snapshot.whatsapp.enabled && snapshot.whatsapp.url), url: snapshot.whatsapp.url },
      redirectEnabled: readServerEnv().redirectEnabled,
    };
  } catch (error) {
    if (error instanceof CatalogUnavailableError) throw new CatalogUnavailable(error.message);
    throw error;
  }
}
