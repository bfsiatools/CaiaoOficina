import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { adminClient } from './lib/admin-env';
import { readImportState } from './lib/import-state';
import { buildRollbackPlan,type BatchReport } from './lib/operations';
import { revalidateCatalog } from './revalidate-catalog';
import type { Json } from '../src/lib/supabase/database.types';
async function main(){
 const args=process.argv.slice(2),index=args.indexOf('--report');if(index<0||!args[index+1])throw Error('Informe --report');
 const report=JSON.parse(await readFile(args[index+1],'utf8')) as BatchReport,client=adminClient();
 const plan=buildRollbackPlan(report,await readImportState(client));if(!args.includes('--apply')){console.log(JSON.stringify({mode:'dry-run',eligible:plan.rows.length,errors:plan.errors}));return;}
 if(plan.errors.length)throw Error('Rollback tem conflitos; revise o dry-run');if(!plan.rows.length)throw Error('Nenhuma linha elegível');
 const batchId=randomUUID(),result=await client.rpc('apply_product_batch',{p_batch_id:batchId,p_rows:plan.rows as Json});if(result.error)throw Error('Rollback transacional recusado: '+result.error.code);
 await mkdir('private/reports',{recursive:true});await writeFile(`private/reports/rollback-${batchId}.json`,JSON.stringify({source:args[index+1],batchId,result:result.data,cacheInvalidated:await revalidateCatalog()},null,2));
 console.log(JSON.stringify({mode:'apply',batchId,result:result.data}));
}
main().catch(error=>{console.error((error as Error).message);process.exitCode=1;});
