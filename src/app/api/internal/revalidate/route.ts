import { revalidateTag } from 'next/cache';
import { readServerEnv } from '@/lib/env/server';
import { handleRevalidation } from '@/lib/catalog/revalidation';
export const runtime='nodejs';
export async function POST(request:Request){return handleRevalidation(request,readServerEnv().revalidationSecret,()=>revalidateTag('catalog-v1',{expire:0}));}
