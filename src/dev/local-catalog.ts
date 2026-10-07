/**
 * SÓ DESENVOLVIMENTO. Lê o manifest REAL que o Codex preparou para a importação
 * (nomes, slugs, categorias, links e imagens dos 47 produtos) para o QA visual
 * enquanto o banco não está populado. Nunca é importado em produção (ver load.ts).
 * Imagens: `node scripts/fe-dev-images.mjs` copia as WebP preparadas para public/__dev (ignorado pelo Git).
 */
import 'server-only';
import { readFile } from 'node:fs/promises';
import { addDays, todayIso } from '@/features/catalog/dates';
import type { LoadedCatalog } from '@/features/catalog/load';
import type { CatalogProductInput } from '@/features/catalog/view-model';

interface ManifestRow {
  product: { id: string; slug: string; name: string; short_description: string; image_alt: string; image_width: number; image_height: number; sort_order: number };
  link: { id: string; affiliate_url: string };
  category_slugs: string[];
  preparedFile: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  'ferramentas-e-reparos': 'Ferramentas e reparos',
  automotivo: 'Automotivo',
  'casa-e-organizacao': 'Casa e organização',
  'limpeza-e-cuidados': 'Limpeza e cuidados',
};

export async function loadLocalCatalog(mode: 'local' | 'local-recent' | 'one' | 'long'): Promise<LoadedCatalog> {
  const path = process.env.DEV_LOCAL_MANIFEST ?? 'C:/dev/CaiaoOficina/private/imports/v1/manifest.json';
  const manifest = JSON.parse(await readFile(path, 'utf8')) as { rows: ManifestRow[] };
  const today = todayIso();
  const products: CatalogProductInput[] = manifest.rows.map((row, index) => ({
    id: row.product.id,
    slug: row.product.slug,
    name: row.product.name,
    shortDescription: row.product.short_description,
    image: { url: `/__dev/${row.preparedFile.split(/[\\/]/).pop()}`, alt: row.product.image_alt, width: row.product.image_width, height: row.product.image_height },
    categories: row.category_slugs.map((slug) => ({ id: slug, slug, name: CATEGORY_NAMES[slug] ?? slug })),
    offer: { id: row.link.id, affiliateUrl: row.link.affiliate_url },
    // O compressor é o produto do primeiro vídeo: simula a configuração de lançamento (daily_pick_date = hoje).
    dailyPickDate: index === 0 ? today : mode === 'local-recent' && index >= 1 && index <= 6 ? addDays(today, -index) : null,
    dailyPickRank: 0,
    featuredRank: null,
    sortOrder: row.product.sort_order,
  }));
  let list = products;
  if (mode === 'one') list = products.slice(0, 1);
  if (mode === 'long') {
    list = products.map((p, i) => (i === 3 ? { ...p, image: null } : i === 5 ? { ...p, offer: null } : i === 8 ? { ...p, slug: `${p.slug}-sem-editorial` } : p));
  }
  const used = new Set(list.flatMap((p) => p.categories.map((c) => c.slug)));
  return {
    products: list,
    categories: Object.entries(CATEGORY_NAMES).filter(([slug]) => used.has(slug)).map(([slug, name]) => ({ id: slug, slug, name })),
    picks: list.filter((p) => p.dailyPickDate === today),
    whatsapp: mode === 'local-recent' ? { enabled: true, url: 'https://example.com/whatsapp-dev' } : { enabled: false, url: null },
    redirectEnabled: process.env.AFFILIATE_REDIRECT_ENABLED === 'true',
  };
}
