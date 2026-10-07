import { campaignContext } from './context';
import { parseClickPayload,type ClickPayload } from './schema';
export type ClickInput=Pick<ClickPayload,'eventType'|'placement'|'ctaId'|'productId'|'affiliateLinkId'> & {pagePath?:string;redirect?:boolean};
interface BrowserEnvironment {url:URL;referrer:string;eventId:()=>string;beacon:(url:string,data:Blob)=>boolean;fetch:typeof fetch}
export function trackClick(input:ClickInput,environment?:BrowserEnvironment):void{
 if(input.redirect)return;if(!environment&&typeof window==='undefined')return;
 try{
  const env=environment??{url:new URL(location.href),referrer:document.referrer,eventId:()=>crypto.randomUUID(),beacon:(url:string,data:Blob)=>navigator.sendBeacon(url,data),fetch};
  const {redirect:_redirect,...fields}=input;void _redirect;
  const body=JSON.stringify(parseClickPayload({...fields,eventId:env.eventId(),pagePath:input.pagePath??env.url.pathname,...campaignContext(env.url,env.referrer)}));
  let sent=false;try{sent=env.beacon('/api/events',new Blob([body],{type:'application/json'}));}catch{}
  if(!sent)void env.fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});
 }catch{ /* Tracking never owns navigation. */ }
}
