import type { ClickPayload } from '@/lib/tracking/schema';
import type { ClickAttrs } from './click-attrs';

/**
 * Monta o evento no formato que o endpoint do Codex valida (`clickSchema`).
 * Substituir por `trackClick` do Codex quando o cliente dele for publicado.
 */
export function buildClickPayload(attrs: ClickAttrs, href: string, referrer: string, eventId: string): ClickPayload {
  const url = new URL(href);
  const pick = (key: string, max: number) => {
    const value = url.searchParams.get(key);
    return value && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) ? value : null;
  };
  const utmSource = pick('utm_source', 64);
  const utmMedium = pick('utm_medium', 64);
  const utmCampaign = pick('utm_campaign', 128);
  const utmContent = pick('utm_content', 128);
  let referrerHost: string | null = null;
  try {
    const ref = new URL(referrer);
    if (['https:', 'http:'].includes(ref.protocol) && ref.hostname !== url.hostname && /^[a-zA-Z0-9.-]{1,253}$/.test(ref.hostname)) referrerHost = ref.hostname;
  } catch {
    referrerHost = null;
  }
  return {
    eventId,
    eventType: attrs.eventType,
    productId: attrs.productId,
    affiliateLinkId: attrs.affiliateLinkId,
    pagePath: url.pathname,
    placement: attrs.placement as ClickPayload['placement'],
    ctaId: attrs.ctaId,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    contentId: pick('content_id', 80) ?? pick('video_id', 80),
    referrerHost,
    attributionMethod: utmSource || utmMedium || utmCampaign || utmContent ? 'utm' : referrerHost ? 'referrer' : 'unknown',
  };
}

/** Envio best-effort: nunca bloqueia nem atrasa a navegação. */
export function sendClick(payload: ClickPayload): void {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.('/api/events', new Blob([body], { type: 'application/json' }))) return;
  } catch {
    // segue para o fetch
  }
  void fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
}
