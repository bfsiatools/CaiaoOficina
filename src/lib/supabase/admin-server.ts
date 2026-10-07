import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { readServerEnv } from '../env/server';
export function adminClient(){const env=readServerEnv();if(!env.secretKey)throw Error('Credencial administrativa não configurada');return createClient<Database>(env.supabaseUrl,env.secretKey,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store',signal:init?.signal??AbortSignal.timeout(1500)})}});}
