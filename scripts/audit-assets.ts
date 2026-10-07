import { readFile,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { validateAffiliateUrl } from '../src/lib/affiliate/urls';
import type { ImportManifest } from './lib/import-plan';
async function main(){
 const root=path.resolve('private/imports/v1'),manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8')) as ImportManifest;
 const hashes=new Set<string>(),links=new Set<string>(),slugs=new Set<string>();let images=0;const errors:unknown[]=[...(manifest.errors??[])],tiles:{input:Buffer;left:number;top:number}[]=[];
 const escape=(text:string)=>text.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]!));
 for(const [index,row] of manifest.rows.entries()){
  try{const url=validateAffiliateUrl(String(row.link?.affiliate_url));if(links.has(url))throw Error('Link duplicado');links.add(url);const slug=String(row.product.slug);if(slugs.has(slug))throw Error('Slug duplicado');slugs.add(slug);
   const file=path.resolve(root,row.preparedFile!),bytes=await readFile(file),hash=createHash('sha256').update(bytes).digest('hex');if(hashes.has(hash))throw Error('Imagem duplicada');hashes.add(hash);if(path.basename(String(row.product.image_path),'.webp')!==hash)throw Error('Hash inconsistente');
   const metadata=await sharp(bytes).metadata();if(metadata.format!=='webp'||metadata.width!==row.product.image_width||metadata.height!==row.product.image_height)throw Error('Dimensões inconsistentes');images++;
   const image=await sharp(bytes).resize(240,190,{fit:'contain',background:'#fff'}).png().toBuffer();const label=Buffer.from(`<svg width="240" height="50"><rect width="240" height="50" fill="white"/><text x="4" y="18" font-size="12">${index+1}. ${escape(String(row.product.name).slice(0,28))}</text><text x="4" y="36" font-size="12">${escape(String(row.product.name).slice(28,58))}</text></svg>`);const tile=await sharp({create:{width:240,height:240,channels:3,background:'#fff'}}).composite([{input:image,top:0,left:0},{input:label,top:190,left:0}]).png().toBuffer();tiles.push({input:tile,left:(index%4)*240,top:(Math.floor(index/4)%3)*240});
  }catch(error){errors.push({key:row.product.import_key,error:(error as Error).message});}
  if(index%12===11||index===manifest.rows.length-1){const file=path.join(root,`audit-sheet-${Math.floor(index/12)+1}.png`);await sharp({create:{width:960,height:720,channels:3,background:'#ddd'}}).composite(tiles).png().toFile(file);tiles.length=0;}
 }
 const report={expected:47,products:manifest.rows.length,validLinks:links.size,validImages:images,duplicateImages:manifest.rows.length-hashes.size,errors};await writeFile(path.join(root,'asset-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length||manifest.rows.length!==47)process.exitCode=2;
}
main().catch(error=>{console.error((error as Error).message);process.exitCode=1;});
