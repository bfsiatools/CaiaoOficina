import { readFile,writeFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash,randomUUID } from 'node:crypto';
import { parseProductsTxt,makeSlug,normalizeName } from './lib/parse-products';
import { prepareImage } from './lib/images';
import type { ImportManifest,ManifestRow } from './lib/import-plan';
const root=path.resolve('private/imports/v1');const manifestFile=path.join(root,'manifest.json');
const parsed=parseProductsTxt(await readFile(path.join(root,'products.txt'),'utf8'));
interface Extracted { source_name:string;short_url:string;title:string;item_id?:string;images:{file:string;width:number;height:number}[] }
const report=JSON.parse(await readFile(path.join(root,'image/relatorio.json'),'utf8')) as {results:Extracted[]};
let previous:ImportManifest={rows:[]};try{previous=JSON.parse(await readFile(manifestFile,'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
const rows:ManifestRow[]=[];const errors:unknown[]=[...parsed.errors];const images=new Map<string,string>();const slugs=new Set<string>();
function categories(name:string){const n=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const result:string[]=[];if(/calibrador|scanner automotivo|macaco|endoscopio|torquimetro|snow foam|politriz/.test(n))result.push('automotivo');if(/aspirador|lavadora|soprador|extratora|snow foam|politriz/.test(n))result.push('limpeza-e-cuidados');if(/bolsa|painel|lanterna|termometro/.test(n))result.push('casa-e-organizacao');if(!result.length)result.push('ferramentas-e-reparos');return result;}
await mkdir(path.join(root,'prepared'),{recursive:true});
for(const input of parsed.rows){
 try{
  const matches=report.results.filter(r=>r.short_url===input.url);if(matches.length!==1||normalizeName(matches[0].source_name)!==input.name||matches[0].images.length!==1)throw Error('Correspondência de nome/link/imagem ambígua');
  const extracted=matches[0],image=extracted.images[0];const parts=image.file.split('/');const relative=path.join('image',parts.at(-2)!,parts.at(-1)!);const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep))throw Error('Imagem fora do diretório de entrada');
  const bytes=await readFile(file);const hash=createHash('sha256').update(bytes).digest('hex');if(images.has(hash))throw Error('Imagem duplicada: '+images.get(hash));images.set(hash,input.importKey);
  const previousRow=previous.rows.find(r=>r.product.import_key===input.importKey);const id=String(previousRow?.product.id??randomUUID());const prepared=await prepareImage(bytes,id);
  if(prepared.width!==image.width||prepared.height!==image.height)throw Error('Dimensões divergentes do relatório');
  let slug=String(previousRow?.product.slug??makeSlug(input.name,input.importKey));if(slugs.has(slug))slug=slug.slice(0,91).replace(/-$/,'')+'-'+input.importKey.slice(-64,-56);if(slugs.has(slug))throw Error('Colisão de slug residual');slugs.add(slug);
  const preparedFile=path.join('prepared',path.basename(prepared.path));await writeFile(path.join(root,preparedFile),prepared.bytes);
  rows.push({product:{id,import_key:input.importKey,slug,name:input.name,short_description:extracted.title,image_path:prepared.path,image_alt:input.name,image_width:prepared.width,image_height:prepared.height,status:'active',sort_order:rows.length,featured_rank:null,daily_pick_date:null,daily_pick_rank:0},link:{id:previousRow?.link?.id??randomUUID(),affiliate_url:input.url,marketplace_item_id:extracted.item_id??null,marketplace_catalog_id:null,seller_id:null},category_slugs:categories(input.name),sourceFile:relative,preparedFile,appliedSource:previousRow?.appliedSource,appliedState:previousRow?.appliedState});
 }catch(error){errors.push({line:input.line,name:input.name,error:(error as Error).message});}
}
const manifest:ImportManifest={expected:47,rows,errors};await writeFile(manifestFile,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({expected:47,prepared:rows.length,duplicates:parsed.duplicates,errors,descriptionSource:'Título do relatório fornecido, sem informações adicionadas',categories:'Classificação editorial inferida dos nomes, editável no manifest'}));if(errors.length)process.exitCode=2;
