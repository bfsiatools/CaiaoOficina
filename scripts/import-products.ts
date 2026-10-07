import { readFile,writeFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID,createHash } from 'node:crypto';
import { z } from 'zod';
import { adminClient } from './lib/admin-env';
import { readImportState } from './lib/import-state';
import { buildImportPlan,type ImportManifest,type ImportState } from './lib/import-plan';
import { validateAffiliateUrl } from '../src/lib/affiliate/urls';
import { provisionStorage } from './provision-storage';
import { revalidateCatalog } from './revalidate-catalog';
import type { Json } from '../src/lib/supabase/database.types';
const args=process.argv.slice(2);const argument=(name:string)=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
const productSchema=z.object({id:z.uuid(),import_key:z.string().min(1).max(128),slug:z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),name:z.string().min(1).max(200),short_description:z.string().min(1).max(500).nullable().optional(),image_path:z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f]{64}\.webp$/).nullable().optional(),image_alt:z.string().min(1).max(250).nullable().optional(),image_width:z.number().int().positive().nullable().optional(),image_height:z.number().int().positive().nullable().optional(),status:z.enum(['active','inactive','out_of_stock','archived']).optional(),sort_order:z.number().int().nonnegative().optional(),featured_rank:z.number().int().nonnegative().nullable().optional(),daily_pick_date:z.iso.date().nullable().optional(),daily_pick_rank:z.number().int().nonnegative().optional()}).strict();
async function main(){
 const manifestFile=path.resolve(argument('--manifest')??'private/imports/v1/manifest.json');const root=path.dirname(manifestFile);
 const manifest=JSON.parse((await readFile(manifestFile,'utf8')).replace(/^\uFEFF/,'')) as ImportManifest;
 const apply=args.includes('--apply');if(apply&&args.includes('--dry-run'))throw Error('Escolha dry-run ou apply');if(!Array.isArray(manifest.rows)||manifest.rows.length>100)throw Error('Manifest inválido');
 if(apply&&argument('--state'))throw Error('Estado offline não pode autorizar escrita');
 const errors:unknown[]=[...(manifest.errors??[])];const valid:ImportManifest={expected:manifest.expected,rows:[]};const seen=new Set<string>(),slugs=new Set<string>();
 for(const row of manifest.rows){try{productSchema.parse(row.product);if(!row.link)throw Error('Link ausente');validateAffiliateUrl(String(row.link.affiliate_url));if(!row.category_slugs.length)throw Error('Categoria ausente');if(seen.has(String(row.product.import_key))||slugs.has(String(row.product.slug)))throw Error('Identidade ou slug duplicado');seen.add(String(row.product.import_key));slugs.add(String(row.product.slug));
   if(row.product.status==='active'){if(!row.product.short_description||!row.product.image_path||!row.product.image_alt||!row.product.image_width||!row.product.image_height||!row.preparedFile)throw Error('Produto ativo incompleto');const imageFile=path.resolve(root,row.preparedFile);if(!imageFile.startsWith(root+path.sep))throw Error('Imagem fora da entrada');const image=await readFile(imageFile);const expectedHash=path.basename(String(row.product.image_path),'.webp');if(createHash('sha256').update(image).digest('hex')!==expectedHash)throw Error('Arquivo preparado alterado');}valid.rows.push(row);
  }catch(error){errors.push({key:row.product?.import_key,error:(error as Error).message});}}
 let existing:ImportState[];let client:ReturnType<typeof adminClient>|undefined;
 const stateFile=argument('--state');if(stateFile)existing=JSON.parse((await readFile(stateFile,'utf8')).replace(/^\uFEFF/,''));else{client=adminClient();existing=await readImportState(client);}
 const plan=buildImportPlan(valid,existing);errors.push(...plan.errors);
 const counts={created:plan.rows.filter(r=>r.action==='created').length,updated:plan.rows.filter(r=>r.action==='updated').length,ignored:plan.rows.filter(r=>r.action==='ignored').length};
 if(!apply){console.log(JSON.stringify({mode:'dry-run',expected:manifest.expected,valid:plan.rows.length,...counts,errors}));if(errors.length)process.exitCode=plan.errors.length?3:2;return;}
 if(!plan.rows.length){process.exitCode=2;console.log(JSON.stringify({mode:'apply',imported:0,errors}));return;}
 const batchId=randomUUID();await mkdir('private/reports',{recursive:true});const reportFile=`private/reports/${batchId}.json`;
 const report={batchId,startedAt:new Date().toISOString(),expected:manifest.expected,rows:plan.rows.map(r=>({action:r.action,payload:r.payload,before:r.before})),errors,status:'prepared',result:undefined as unknown,after:undefined as unknown,cacheInvalidated:false};await writeFile(reportFile,JSON.stringify(report,null,2));
 if(plan.rows.some(r=>r.action!=='ignored'&&r.payload.image_path)){const storage=await provisionStorage();for(const row of plan.rows.filter(r=>r.action!=='ignored'&&r.payload.image_path)){const file=path.resolve(root,row.source.preparedFile!);const bytes=await readFile(file);const result=await storage.storage.from('product-images').upload(String(row.payload.image_path),bytes,{contentType:'image/webp',cacheControl:'31536000',upsert:false});if(result.error&&!/already exists|duplicate/i.test(result.error.message))throw Error('Falha no upload: lote não aplicado');}}
 const result=await client!.rpc('apply_product_batch',{p_batch_id:batchId,p_rows:plan.rows.map(r=>r.payload) as Json});if(result.error){report.status='failed';await writeFile(reportFile,JSON.stringify(report,null,2));process.exitCode=/conflict/i.test(result.error.message)?3:1;throw Error('Falha transacional da importação: '+result.error.code);}
 report.status='committed';report.result=result.data;await writeFile(reportFile,JSON.stringify(report,null,2));
 report.after=await readImportState(client!);
 for(const row of plan.rows){row.source.appliedSource=structuredClone({product:row.source.product,link:row.source.link,category_slugs:row.source.category_slugs});row.source.appliedState=(report.after as ImportState[]).find(e=>e.product.import_key===row.payload.import_key);}
 await writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');report.cacheInvalidated=await revalidateCatalog();await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({mode:'apply',batchId,result:result.data,imported:plan.rows.length,errors,cacheInvalidated:report.cacheInvalidated,report:reportFile}));if(errors.length)process.exitCode=plan.errors.length?3:2;
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Erro operacional');process.exitCode||=1;});
