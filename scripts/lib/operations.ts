import { isDeepStrictEqual as equal } from 'node:util';
import type { ImportState,ManifestRow } from './import-plan';
export function imagesToUpload(rows:{action:string;payload:Record<string,unknown>;source:ManifestRow}[]){return rows.filter(row=>row.action!=='ignored'&&row.payload.image_path&&row.payload.image_path===row.source.product.image_path);}
export interface BatchReport {status:string;rows:{action:string;payload:Record<string,unknown>;before:ImportState|null}[];after?:ImportState[]}
export function buildRollbackPlan(report:BatchReport,current:ImportState[]){
 if(report.status!=='committed'||!report.after)throw Error('Rollback exige relatório confirmado e estado posterior completo');
 const rows:Record<string,unknown>[]=[],errors:{key:string;error:string}[]=[];
 for(const entry of report.rows){if(entry.action==='ignored')continue;const key=String(entry.payload.import_key),expected=report.after.find(s=>s.product.import_key===key),now=current.find(s=>s.product.import_key===key);
  if(!expected||!now||!equal(expected,now)){errors.push({key,error:'Estado mudou após o lote; rollback recusado'});continue;}
  const previous=entry.before??now;const product={...previous.product};delete product.created_at;delete product.updated_at;
  const previousLink=entry.before?.link;const link=previousLink?Object.fromEntries(['affiliate_url','marketplace_item_id','marketplace_catalog_id','seller_id'].map(k=>[k,previousLink[k]??null])):undefined;
  rows.push({...product,...(!entry.before?{status:'inactive'}:{}),category_slugs:previous.category_slugs,...(link?{link}:{}),expected_updated_at:now.product.updated_at,expected_link_id:now.link?.id??null});
 }
 return {rows,errors};
}
