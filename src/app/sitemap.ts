import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  return ['/', '/como-escolho', '/privacidade'].map((path) => ({ url: `${base}${path}` }));
}
