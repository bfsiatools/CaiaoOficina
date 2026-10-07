import { it,expect } from 'vitest';
import { mkdtemp,mkdir,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
it('client bundle scanner rejects a private value even when the variable name is absent',async()=>{const root=path.resolve(process.cwd()),dir=await mkdtemp(path.join(tmpdir(),'caiao-bundle-test-'));try{await mkdir(path.join(dir,'.next/static'),{recursive:true});await writeFile(path.join(dir,'.next/static/chunk.js'),'const key="test-private-secret-literal";');expect(()=>execFileSync(process.execPath,[path.join(root,'node_modules/tsx/dist/cli.mjs'),path.join(root,'scripts/check-client-bundle.ts')],{cwd:dir,env:{...process.env,SUPABASE_SECRET_KEY:'test-private-secret-literal',SUPABASE_SERVICE_ROLE_KEY:'',CATALOG_REVALIDATION_SECRET:''},stdio:'pipe'})).toThrow();}finally{const target=path.resolve(dir);if(!target.startsWith(path.resolve(tmpdir())+path.sep)||!path.basename(target).startsWith('caiao-bundle-test-'))throw Error('Limite de diretório temporário');await rm(target,{recursive:true,force:true});}});
