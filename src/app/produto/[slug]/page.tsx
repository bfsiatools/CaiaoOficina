import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/catalog/server';
import { readServerEnv } from '@/lib/env/server';
import { internalQuery,productHref } from '@/lib/affiliate/href';
import { ProductImage } from '@/components/ProductImage';
import { TrackedAnchor } from '@/components/TrackedAnchor';
export const dynamic='force-dynamic';
export default async function ProductPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){const {slug}=await params,p=await getProductBySlug(slug);if(!p)notFound();const redirect=readServerEnv().redirectEnabled,query=internalQuery(await searchParams);return <><h1>{p.name}</h1><ProductImage image={p.image}/><p>{p.shortDescription}</p><TrackedAnchor product={p} placement="product_detail" href={productHref(p,redirect,query)} redirect={redirect}>Ver no Mercado Livre</TrackedAnchor></>;}
