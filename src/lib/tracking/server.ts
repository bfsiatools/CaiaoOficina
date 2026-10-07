import 'server-only';
import { adminClient } from '../supabase/admin-server';
import type { Json } from '../supabase/database.types';
import type { ClickPayload } from './schema';
export function eventToDatabase(event:ClickPayload,quality:'test'|'accepted'){
 return {event_id:event.eventId,schema_version:1,event_type:event.eventType,product_id:event.productId??null,affiliate_link_id:event.affiliateLinkId??null,page_path:event.pagePath,placement:event.placement,cta_id:event.ctaId,utm_source:event.utmSource??null,utm_medium:event.utmMedium??null,utm_campaign:event.utmCampaign??null,utm_content:event.utmContent??null,content_id:event.contentId??null,referrer_host:event.referrerHost??null,attribution_method:event.attributionMethod,quality};
}
export async function recordClick(event:ClickPayload,quality:'test'|'accepted'){
 const value=eventToDatabase(event,quality);
 const result=await adminClient().rpc('record_click_event',{p_event:value as Json}).abortSignal(AbortSignal.timeout(1500));
 if(result.error){if(result.error.message.includes('event_id conflict'))return 'conflict';throw Error('Event persistence unavailable');}
 return String(result.data);
}
