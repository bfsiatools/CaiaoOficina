import { randomUUID } from 'node:crypto';
import { validateAffiliateUrl } from './urls';
import { campaignContext,isAutomated } from '../tracking/context';
import type { ClickPayload } from '../tracking/schema';
type Destination={id:string;offer:{id:string;affiliateUrl:string}};
export interface RedirectDependencies {enabled:boolean;tracking:boolean;lookup:(slug:string)=>Promise<Destination|null>;record:(event:ClickPayload)=>Promise<unknown>;after:(task:()=>Promise<void>)=>void}
export async function redirectRequest(request:Request,slug:string,deps:RedirectDependencies){
 const response=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
 if(!['GET','HEAD'].includes(request.method))return response(405);
 if(!deps.enabled)return response(503);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>100)return response(404);
 let product:Destination|null;try{product=await deps.lookup(slug);if(product)validateAffiliateUrl(product.offer.affiliateUrl);}catch{return response(503);}
 if(!product)return response(404);
 if(request.method==='GET'&&deps.tracking&&!isAutomated(request)){
  const event:ClickPayload={eventId:randomUUID(),eventType:'product_click',productId:product.id,affiliateLinkId:product.offer.id,pagePath:`/go/${slug}`,placement:'redirect',ctaId:'buy',...campaignContext(new URL(request.url),request.headers.get('referer'))};
  deps.after(async()=>{try{await deps.record(event);}catch{ /* Conversion survives telemetry failure. */ }});
 }
 return new Response(null,{status:302,headers:{Location:product.offer.affiliateUrl,'Cache-Control':'no-store','Referrer-Policy':'strict-origin-when-cross-origin'}});
}
