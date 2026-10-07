import { readdir,readFile } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
async function files(root:string):Promise<string[]>{const entries=await readdir(root,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(path.join(root,e.name)):[path.join(root,e.name)]))).flat();}
async function main(){nextEnv.loadEnvConfig(process.cwd());const values=[process.env.SUPABASE_SECRET_KEY,process.env.SUPABASE_SERVICE_ROLE_KEY,process.env.CATALOG_REVALIDATION_SECRET].filter((v):v is string=>!!v);const chunks=(await files('.next/static')).filter(f=>f.endsWith('.js'));if(!chunks.length)throw Error('Build ausente');for(const file of chunks){const source=await readFile(file,'utf8');if(/SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|CATALOG_REVALIDATION_SECRET/.test(source)||values.some(value=>source.includes(value)))throw Error('Fronteira de segredo violada no bundle do cliente');}console.log(JSON.stringify({clientChunks:chunks.length,privateEnvNamesFound:0,privateValuesFound:0}));}
main().catch(error=>{console.error((error as Error).message);process.exitCode=1;});
