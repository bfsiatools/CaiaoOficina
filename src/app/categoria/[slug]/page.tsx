import { notFound } from 'next/navigation';
import { getCategories,getProductsByCategory } from '@/lib/catalog/server';
import { internalQuery } from '@/lib/affiliate/href';
export const dynamic='force-dynamic';
export default async function CategoryPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){const {slug}=await params,category=(await getCategories()).find(c=>c.slug===slug);if(!category)notFound();const products=await getProductsByCategory(slug),query=internalQuery(await searchParams);return <><h1>{category.name}</h1><ul>{products.map(p=><li key={p.id}><a href={`/produto/${p.slug}${query}`}>{p.name}</a></li>)}</ul></>;}
