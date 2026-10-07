import { z } from 'zod';
import { validateAffiliateUrl } from '../affiliate/urls';
import type { CatalogSnapshot } from './types';
export class CatalogUnavailableError extends Error { constructor(options?:ErrorOptions){super('Catálogo temporariamente indisponível',options);this.name='CatalogUnavailableError';} }
const category=z.object({id:z.uuid(),slug:z.string().min(1),name:z.string().min(1)}).strict();
const rawSnapshot=z.object({generatedAt:z.iso.datetime({offset:true}),products:z.array(z.object({id:z.uuid(),slug:z.string().min(1).max(100),name:z.string().min(1).max(200),shortDescription:z.string().min(1).max(500),image:z.object({path:z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f]{64}\.webp$/),alt:z.string().min(1).max(250),width:z.number().int().positive(),height:z.number().int().positive()}).strict(),categories:z.array(category).min(1),offer:z.object({id:z.uuid(),marketplace:z.literal('mercado_livre'),affiliateUrl:z.string()}).strict(),sortOrder:z.number().int().nonnegative(),featuredRank:z.number().int().nonnegative().nullable(),dailyPickDate:z.iso.date().nullable(),dailyPickRank:z.number().int().nonnegative()}).strict()),categories:z.array(category),whatsapp:z.object({enabled:z.boolean(),url:z.string().nullable()}).strict()}).strict();
export function parseCatalog(raw:unknown,url:string):CatalogSnapshot {
 try{if(url!=='https://lyhybytsfbdiodtsytqc.supabase.co')throw Error('Unexpected project');const value=rawSnapshot.parse(raw);return {...value,products:value.products.map(p=>({...p,image:{url:`${url}/storage/v1/object/public/product-images/${p.image.path}`,alt:p.image.alt,width:p.image.width,height:p.image.height},offer:{...p.offer,affiliateUrl:validateAffiliateUrl(p.offer.affiliateUrl)}}))};}catch(error){throw new CatalogUnavailableError({cause:error});}
}
export async function ensureFreshCatalog(snapshot:CatalogSnapshot,load:()=>Promise<CatalogSnapshot>,now=Date.now()):Promise<CatalogSnapshot> {
 const age=now-Date.parse(snapshot.generatedAt);if(age>=-60000&&age<=300000)return snapshot;
 try{return await load();}catch(error){throw new CatalogUnavailableError({cause:error});}
}
const order=(a:{sortOrder:number;id:string},b:{sortOrder:number;id:string})=>a.sortOrder-b.sortOrder||a.id.localeCompare(b.id);
function today(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(type=>parts.find(p=>p.type===type)!.value).join('-');}
export function createCatalogQueries(load:()=>Promise<CatalogSnapshot>) {
 return {
  getProducts:async()=>[...(await load()).products].sort(order),getCategories:async()=>(await load()).categories,
  getProductBySlug:async(slug:string)=>(await load()).products.find(p=>p.slug===slug)??null,
  getProductsByCategory:async(slug:string)=>(await load()).products.filter(p=>p.categories.some(c=>c.slug===slug)).sort(order),
  getFeaturedProducts:async(limit=8)=>{if(!Number.isInteger(limit)||limit<1||limit>50)throw Error('Limite inválido');return (await load()).products.filter(p=>p.featuredRank!==null).sort((a,b)=>a.featuredRank!-b.featuredRank!||order(a,b)).slice(0,limit);},
  getDailyPicks:async(date=today())=>{z.iso.date().parse(date);return (await load()).products.filter(p=>p.dailyPickDate===date).sort((a,b)=>a.dailyPickRank-b.dailyPickRank||order(a,b));},
 };
}
