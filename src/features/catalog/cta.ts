export type CtaMode = 'direct' | 'redirect';
export interface ResolvedCta { href: string; mode: CtaMode; rel: string; target?: '_blank' }

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'video_id'] as const;
type CampaignKey = (typeof KEYS)[number];
export type CampaignParams = Partial<Record<CampaignKey, string>>;
const MAX: Record<CampaignKey, number> = { utm_source: 64, utm_medium: 64, utm_campaign: 128, utm_content: 128, video_id: 80 };

export function pickCampaignParams(search: Record<string, string | string[] | undefined>): CampaignParams {
  const picked: CampaignParams = {};
  for (const key of KEYS) {
    const value = search[key];
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw === 'string' && raw.length > 0 && raw.length <= MAX[key] && /^[A-Za-z0-9._-]+$/.test(raw)) picked[key] = raw;
  }
  return picked;
}

/**
 * Único lugar que decide para onde o CTA aponta.
 * Flag desligada (padrão): link oficial do Mercado Livre, byte a byte (cláusula 1.8), e o navegador registra o clique.
 * Flag ligada: /go/[slug], o servidor registra o clique e redireciona (sem beacon, para não contar duas vezes).
 */
export function resolveCta(
  product: { slug: string; affiliateUrl: string },
  opts: { redirectEnabled: boolean; openInNewTab: boolean; campaign?: CampaignParams },
): ResolvedCta {
  const target = opts.openInNewTab ? ({ target: '_blank' } as const) : {};
  if (opts.redirectEnabled) {
    const query = new URLSearchParams(opts.campaign as Record<string, string> | undefined).toString();
    return { href: `/go/${encodeURIComponent(product.slug)}${query ? `?${query}` : ''}`, mode: 'redirect', rel: opts.openInNewTab ? 'sponsored nofollow noopener' : 'sponsored nofollow', ...target };
  }
  return { href: product.affiliateUrl, mode: 'direct', rel: 'sponsored nofollow noopener', ...target };
}
