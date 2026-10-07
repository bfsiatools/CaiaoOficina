import type { ProductCard } from '../catalog/types';
const keys=['utm_source','utm_medium','utm_campaign','utm_content','content_id','video_id'];
export function internalQuery(values:Record<string,string|string[]|undefined>){const query=new URLSearchParams();for(const key of keys){const value=values[key];const max=key==='content_id'||key==='video_id'?80:key==='utm_campaign'||key==='utm_content'?128:64;if(typeof value==='string'&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value))query.set(key,value);}return query.size?'?'+query.toString():'';}
export function productHref(product:ProductCard,redirect:boolean,query=''){return redirect?`/go/${product.slug}${query}`:product.offer.affiliateUrl;}
