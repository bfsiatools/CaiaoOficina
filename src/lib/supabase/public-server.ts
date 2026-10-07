import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { readServerEnv } from '../env/server';
export function publicClient(){const env=readServerEnv();return createClient<Database>(env.supabaseUrl,env.publishableKey,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store',signal:init?.signal??AbortSignal.timeout(2000)})}});}
