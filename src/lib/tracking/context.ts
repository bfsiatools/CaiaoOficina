import type { ClickPayload } from './schema';
export function campaignContext(url:URL,referrer?:string|null) {
 const pick=(key:string,max:number)=>{const value=url.searchParams.get(key);return value&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value)?value:null;};
 const utmSource=pick('utm_source',64),utmMedium=pick('utm_medium',64),utmCampaign=pick('utm_campaign',128),utmContent=pick('utm_content',128);
 let referrerHost:string|null=null;try{const value=new URL(referrer??'');if(['https:','http:'].includes(value.protocol)&&/^[a-zA-Z0-9.-]{1,253}$/.test(value.hostname))referrerHost=value.hostname;}catch{}
 const attributionMethod:ClickPayload['attributionMethod']=(utmSource||utmMedium||utmCampaign||utmContent)?'utm':referrerHost?'referrer':'unknown';
 return {utmSource,utmMedium,utmCampaign,utmContent,contentId:pick('content_id',80)??pick('video_id',80),referrerHost,attributionMethod};
}
export function isAutomated(request:Request){return /prefetch|prerender/i.test([request.headers.get('purpose'),request.headers.get('sec-purpose'),request.headers.get('x-purpose')].join(' '))|| /bot\b|crawler|spider|facebookexternalhit|preview|slurp/i.test(request.headers.get('user-agent')??'');}
