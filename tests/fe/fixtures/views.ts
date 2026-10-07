import type { ProductView } from '@/features/catalog/types';

export const view = (over: Partial<ProductView> = {}): ProductView => ({
  id: 'p1',
  slug: 'compressor-portatil',
  displayName: 'Compressor portátil digital 150 psi',
  fullName: 'Calibrador Compressor Bomba De Air Portátil Recarregável Digital 150Psi',
  blurb: 'Recarregável e sem fio.',
  specs: ['150 PSI', 'Sem fio'],
  categories: [{ slug: 'automotivo', label: 'Carro' }],
  image: { url: 'https://x.test/a.webp', alt: 'Compressor portátil preto', width: 500, height: 495 },
  frame: null,
  offer: { id: 'o1', affiliateUrl: 'https://meli.la/2zyu6V7' },
  available: true,
  searchText: 'compressor portatil carro',
  dailyPickDate: '2026-10-07',
  dailyPickRank: 0,
  ...over,
});

export const direct = { href: 'https://meli.la/2zyu6V7', mode: 'direct' as const, rel: 'sponsored nofollow noopener' };
export const redirect = { href: '/go/compressor-portatil', mode: 'redirect' as const, rel: 'sponsored nofollow' };
