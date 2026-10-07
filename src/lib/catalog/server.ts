import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { publicClient } from '../supabase/public-server';
import { readServerEnv } from '../env/server';
import { parseCatalog,createCatalogQueries,ensureFreshCatalog,CatalogUnavailableError } from './queries';
export async function fetchCatalog(){const {data,error}=await publicClient().rpc('get_public_catalog').abortSignal(AbortSignal.timeout(2000));if(error)throw new CatalogUnavailableError();return parseCatalog(data,readServerEnv().supabaseUrl);}
const loadFresh=fetchCatalog;
const cached=unstable_cache(loadFresh,['catalog-v1'],{revalidate:60,tags:['catalog-v1']});
export const getCatalog=cache(async()=>ensureFreshCatalog(await cached(),loadFresh));
export const {getProducts,getCategories,getProductBySlug,getProductsByCategory,getFeaturedProducts,getDailyPicks}=createCatalogQueries(getCatalog);
