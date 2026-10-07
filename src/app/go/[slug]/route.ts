import { after } from 'next/server';
import { redirectRequest } from '@/lib/affiliate/redirect';
import { fetchCatalog } from '@/lib/catalog/server';
import { recordClick } from '@/lib/tracking/server';
import { allowEvent } from '@/lib/tracking/rate-limit';
import { readServerEnv } from '@/lib/env/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function handle(request:Request,context:{params:Promise<{slug:string}>}){
 const env=readServerEnv(),{slug}=await context.params;
 return redirectRequest(request,slug,{enabled:env.redirectEnabled,tracking:env.trackingEnabled&&allowEvent(request),lookup:async(value)=>(await fetchCatalog()).products.find(p=>p.slug===value)??null,after,record:(event)=>recordClick(event,env.appEnv==='production'?'accepted':'test')});
}
export const GET=handle;
export const HEAD=handle;
