import { mkdir,writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { adminClient } from './lib/admin-env';
async function main(){
 const args=process.argv.slice(2),client=adminClient(),cutoff=new Date(Date.now()-90*86400000).toISOString();
 const count=await client.from('click_events').select('event_id',{count:'exact',head:true}).lt('received_at',cutoff);if(count.error)throw Error('Falha ao consultar retenção');
 if(!args.includes('--apply')){console.log(JSON.stringify({mode:'dry-run',cutoff,eligible:count.count}));return;}
 await mkdir('private/event-exports',{recursive:true});let deleted=0;
 for(;;){const batch=await client.from('click_events').select('*').lt('received_at',cutoff).order('event_id').limit(500);if(batch.error)throw Error('Falha ao ler eventos');if(!batch.data.length)break;
  const file=`private/event-exports/${randomUUID()}.json`;await writeFile(file,JSON.stringify({cutoff,exportedAt:new Date().toISOString(),events:batch.data},null,2),{flag:'wx'});
  const result=await client.from('click_events').delete().in('event_id',batch.data.map(e=>e.event_id)).lt('received_at',cutoff).select('event_id');if(result.error)throw Error('Exportação preservada; exclusão não confirmada');deleted+=result.data.length;
 }
 console.log(JSON.stringify({mode:'apply',cutoff,deleted,exportRetentionDays:90}));
}
main().catch(error=>{console.error((error as Error).message);process.exitCode=1;});
