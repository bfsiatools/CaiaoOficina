import { z } from 'zod';
const text = (max: number) => z.string().max(max).regex(/^[^\u0000-\u001f\u007f]*$/).nullable().optional();
export const clickSchema = z.object({
  eventId: z.uuid(), eventType: z.enum(['product_click', 'whatsapp_click']),
  productId: z.uuid().nullable().optional(), affiliateLinkId: z.uuid().nullable().optional(),
  pagePath: z.string().max(256).regex(/^\/(?!\/)[^?#\s\u0000-\u001f\u007f]*$/),
  placement: z.enum(['catalog_card', 'featured', 'daily_pick', 'product_detail', 'whatsapp_cta', 'redirect']),
  ctaId: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  utmSource: text(64), utmMedium: text(64), utmCampaign: text(128), utmContent: text(128), contentId: text(80),
  referrerHost: z.string().max(253).regex(/^[a-zA-Z0-9.-]+$/).nullable().optional(),
  attributionMethod: z.enum(['utm', 'referrer', 'unknown']).default('unknown'),
}).strict().superRefine((value, context) => {
  if (value.eventType === 'product_click' && (!value.productId || !value.affiliateLinkId || value.placement === 'whatsapp_cta')) context.addIssue({ code: 'custom', message: 'Referências de produto obrigatórias' });
  if (value.eventType === 'whatsapp_click' && (value.productId || value.affiliateLinkId || value.placement !== 'whatsapp_cta')) context.addIssue({ code: 'custom', message: 'CTA WhatsApp inválido' });
});
export type ClickPayload = z.infer<typeof clickSchema>;
export function parseClickPayload(input: unknown): ClickPayload { return clickSchema.parse(input); }
