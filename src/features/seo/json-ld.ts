import { SITE } from '@/content/site';

export function buildJsonLd(siteUrl: string) {
  const sameAs = Object.values(SITE.socials).filter((u): u is string => Boolean(u));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: SITE.name, url: siteUrl, inLanguage: 'pt-BR' },
      { '@type': 'Organization', name: SITE.name, url: siteUrl, ...(sameAs.length ? { sameAs } : {}) },
    ],
  };
}

export const serializeJsonLd = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');
