import { createHash } from 'node:crypto';
import { validateAffiliateUrl } from '../../src/lib/affiliate/urls';
export interface ParsedProduct { line:number;name:string;url:string;importKey:string }
export const normalizeName=(name:string)=>name.normalize('NFC').trim().replace(/\s+/g,' ');
export function parseProductsTxt(text:string) {
  const rows:ParsedProduct[]=[];const errors:{line:number;error:string}[]=[];let duplicates=0;
  const byUrl=new Map<string,ParsedProduct>();const badUrls=new Set<string>();const byName=new Map<string,ParsedProduct>();
  for(const [index,raw] of text.replace(/^\uFEFF/,'').split(/\r?\n/).entries()) {
    const line=raw.trim();if(!line||/^=+$/.test(line))continue;
    const separator=line.indexOf('|');const pair=separator>=0?[line.slice(0,separator),line.slice(separator+1)]:line.match(/^(.+?)\s*:\s*(https?:\/\/.*)$/)?.slice(1);
    if(!pair){errors.push({line:index+1,error:'Linha sem nome/link válido'});continue;}
    const name=normalizeName(pair[0]);const url=pair[1].trim();
    try {if(name.length<1||name.length>200)throw Error('Nome inválido');validateAffiliateUrl(url);}catch{errors.push({line:index+1,error:'Nome ou URL inválido'});continue;}
    const prior=byUrl.get(url);if(prior){if(prior.name===name)duplicates++;else{badUrls.add(url);errors.push({line:index+1,error:'URL repetida com nomes divergentes'});}continue;}
    const priorName=byName.get(name.toLowerCase());if(priorName&&priorName.url!==url){badUrls.add(priorName.url);badUrls.add(url);errors.push({line:index+1,error:'Mesmo nome com URLs diferentes: revisar identidade'});}
    const row={line:index+1,name,url,importKey:'txt-sha256:'+createHash('sha256').update(url).digest('hex')};byUrl.set(url,row);byName.set(name.toLowerCase(),row);rows.push(row);
  }
  return {rows:rows.filter(r=>!badUrls.has(r.url)),errors,duplicates};
}
export function makeSlug(name:string,key:string):string {
  let slug=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  if(!slug)throw Error('Nome sem slug ASCII');
  if(slug.length>100){let base=slug.slice(0,91);const end=base.lastIndexOf('-');if(end>0)base=base.slice(0,end);slug=base+'-'+key.slice(-64,-56);}
  return slug;
}
