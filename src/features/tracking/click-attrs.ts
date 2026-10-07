export interface ClickAttrs {
  eventType: 'product_click' | 'whatsapp_click';
  placement: string;
  ctaId: string;
  productId: string | null;
  affiliateLinkId: string | null;
}

/** Lê os `data-*` de um CTA. `null` = este clique não é contado pelo navegador (modo `/go` ou atributo faltando). */
export function readClickAttrs(el: { dataset: Record<string, string | undefined> }): ClickAttrs | null {
  const d = el.dataset;
  const eventType = d.event;
  if ((eventType !== 'product_click' && eventType !== 'whatsapp_click') || !d.ctaId || !d.placement) return null;
  if (d.ctaMode === 'redirect') return null;
  if (eventType === 'product_click') {
    if (!d.productId || !d.linkId) return null;
    return { eventType, placement: d.placement, ctaId: d.ctaId, productId: d.productId, affiliateLinkId: d.linkId };
  }
  return { eventType, placement: d.placement, ctaId: d.ctaId, productId: null, affiliateLinkId: null };
}
