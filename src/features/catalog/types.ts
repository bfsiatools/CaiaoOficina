import type { StaticImageData } from 'next/image';

export interface Editorial {
  readonly displayName: string;
  readonly tagline: string;
  readonly specs: readonly string[];
  readonly searchTerms?: readonly string[];
  /** Apelidos curtos aceitos em `?p=` (ex.: `?p=compressor`). */
  readonly aliases?: readonly string[];
  readonly frame?: StaticImageData;
}

export interface ProductImageView { url: string; alt: string; width: number; height: number }

export interface ProductView {
  id: string;
  slug: string;
  displayName: string;
  fullName: string;
  blurb: string | null;
  specs: readonly string[];
  categories: ReadonlyArray<{ slug: string; label: string }>;
  image: ProductImageView | null;
  frame: StaticImageData | null;
  offer: { id: string; affiliateUrl: string } | null;
  available: boolean;
  searchText: string;
  dailyPickDate: string | null;
  dailyPickRank: number;
}
