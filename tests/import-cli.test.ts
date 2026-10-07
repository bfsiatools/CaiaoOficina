import { it,expect } from 'vitest';
import { mkdtemp,writeFile,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
it('CLI dry-run never persists a manifest change and refuses offline apply',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'caiao-import-test-'));const manifest=path.join(dir,'manifest.json'),state=path.join(dir,'state.json');
 try{const original=JSON.stringify({expected:1,rows:[{product:{id:'12345678-1234-4234-8234-123456789012',import_key:'test',slug:'test',name:'Teste',status:'inactive'},link:{id:'12345678-1234-4234-8234-123456789013',affiliate_url:'https://meli.la/AAA'},category_slugs:['automotivo']}]});await writeFile(manifest,original);await writeFile(state,'[]');
 const result=execFileSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/import-products.ts','--dry-run','--manifest',manifest,'--state',state],{encoding:'utf8'});const report=JSON.parse(result.trim().split('\n').at(-1)!);expect(report.mode).toBe('dry-run');expect(report.created).toBe(1);expect(await readFile(manifest,'utf8')).toBe(original);
 expect(()=>execFileSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/import-products.ts','--apply','--manifest',manifest,'--state',state],{stdio:'pipe'})).toThrow();
 const source=path.join(dir,'wrong.txt');await writeFile(source,'Other:https://meli.la/BBB');expect(()=>execFileSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/import-products.ts','--dry-run','--file',source,'--manifest',manifest,'--state',state],{stdio:'pipe'})).toThrow();
 }finally{const target=path.resolve(dir),root=path.resolve(tmpdir());if(!target.startsWith(root+path.sep)||!path.basename(target).startsWith('caiao-import-test-'))throw Error('Diretório temporário fora do limite');await rm(target,{recursive:true,force:true});}
});
