import { collectRequest } from '@/lib/tracking/collect';
import { allowEvent } from '@/lib/tracking/rate-limit';
import { recordClick } from '@/lib/tracking/server';
import { readServerEnv } from '@/lib/env/server';
export const runtime='nodejs';
export async function POST(request:Request){const env=readServerEnv();let origin='';try{origin=new URL(env.siteUrl??'').origin;}catch{}return collectRequest(request,{origin,enabled:env.trackingEnabled,appEnv:env.appEnv,allow:allowEvent,record:recordClick});}
