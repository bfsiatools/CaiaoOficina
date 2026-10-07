import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/supabase/database.types';
nextEnv.loadEnvConfig(process.cwd());
export function adminClient() {
  const url=process.env.SUPABASE_URL;const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(url!=='https://lyhybytsfbdiodtsytqc.supabase.co'||!key)throw Error('Configuração administrativa ausente para o projeto correto');
  return createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:init?.signal??AbortSignal.timeout(10000)})}});
}
