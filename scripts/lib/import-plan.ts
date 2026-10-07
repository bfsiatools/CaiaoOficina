import { isDeepStrictEqual as equal } from 'node:util';
export interface ImportState { product:Record<string,unknown>;link:Record<string,unknown>|null;category_slugs:string[] }
export interface ManifestRow extends ImportState { sourceFile?:string;preparedFile?:string;appliedSource?:ImportState;appliedState?:ImportState }
export interface ImportManifest { expected?:number;rows:ManifestRow[];errors?:unknown[] }
const linkFields=['affiliate_url','marketplace_item_id','marketplace_catalog_id','seller_id'];
const normalizedLink=(link:Record<string,unknown>|null)=>Object.fromEntries(linkFields.map(k=>[k,link?.[k]??null]));
const sorted=(slugs:string[])=>[...slugs].sort();
export function buildImportPlan(manifest:ImportManifest,existing:ImportState[]) {
  const rows:{source:ManifestRow;action:'created'|'updated'|'ignored';payload:Record<string,unknown>;before:ImportState|null}[]=[];
  const errors:{key:string;error:string}[]=[];
  for(const source of manifest.rows) {
    const key=String(source.product.import_key);const current=existing.find(e=>e.product.import_key===key);
    const product={...source.product};let link=source.link;let categories=source.category_slugs;let conflict=false;
    if(current) {
      product.id=current.product.id;product.slug=current.product.slug;
      if(!source.appliedSource||!source.appliedState){const matches=Object.keys(product).every(k=>equal(product[k],current.product[k]))&&equal(normalizedLink(link),normalizedLink(current.link))&&equal(sorted(categories),sorted(current.category_slugs));if(!matches){errors.push({key,error:'Baseline ausente; divergência editorial exige conciliação explícita'});continue;}}
      for(const field of Object.keys(source.product).filter(f=>!['id','slug','import_key'].includes(f))) {
        if(source.appliedSource&&equal(source.product[field],source.appliedSource.product[field])) product[field]=current.product[field];
        else if(source.appliedState&&!equal(current.product[field],source.appliedState.product[field])&&!equal(current.product[field],source.product[field])) conflict=true;
      }
      if(source.appliedSource&&equal(normalizedLink(source.link),normalizedLink(source.appliedSource.link)))link=current.link;
      else if(source.appliedState&&!equal(normalizedLink(current.link),normalizedLink(source.appliedState.link))&&!equal(normalizedLink(current.link),normalizedLink(source.link)))conflict=true;
      if(source.appliedSource&&equal(sorted(source.category_slugs),sorted(source.appliedSource.category_slugs)))categories=current.category_slugs;
      else if(source.appliedState&&!equal(sorted(current.category_slugs),sorted(source.appliedState.category_slugs))&&!equal(sorted(current.category_slugs),sorted(source.category_slugs)))conflict=true;
    }
    if(conflict){errors.push({key,error:'Edição de origem conflita com edição editorial'});continue;}
    if(current&&link&&!equal(normalizedLink(link),normalizedLink(current.link))){link={...link};delete link.id;}
    const unchanged=current&&Object.keys(product).every(k=>equal(product[k],current.product[k]))&&equal(normalizedLink(link),normalizedLink(current.link))&&equal(sorted(categories),sorted(current.category_slugs));
    rows.push({source,action:!current?'created':unchanged?'ignored':'updated',before:current??null,payload:{...product,category_slugs:categories,...(link?{link}:{}),...(current?{expected_updated_at:current.product.updated_at,expected_link_id:current.link?.id??null}:{})}});
  }
  return {rows,errors};
}
