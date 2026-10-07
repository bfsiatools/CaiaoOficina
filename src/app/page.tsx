import { getCatalog } from '@/lib/catalog/server';
import { readServerEnv } from '@/lib/env/server';
import { internalQuery,productHref } from '@/lib/affiliate/href';
import { ProductImage } from '@/components/ProductImage';
import { TrackedAnchor } from '@/components/TrackedAnchor';
export const dynamic='force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [catalog,params]=await Promise.all([getCatalog(),searchParams]),query=internalQuery(params),redirect=readServerEnv().redirectEnabled;
 return <><h1>Produtos selecionados</h1><nav aria-label="Categorias">{catalog.categories.map(c=><a key={c.id} href={`/categoria/${c.slug}${query}`}>{c.name} </a>)}</nav>{!catalog.products.length?<p>Nenhum produto disponível no momento.</p>:<ul>{catalog.products.map(p=><li key={p.id} data-product-slug={p.slug}><ProductImage image={p.image}/><h2><a href={`/produto/${p.slug}${query}`}>{p.name}</a></h2><p>{p.shortDescription}</p><TrackedAnchor product={p} href={productHref(p,redirect,query)} redirect={redirect}>Ver no Mercado Livre</TrackedAnchor></li>)}</ul>}{catalog.whatsapp.enabled&&catalog.whatsapp.url&&<TrackedAnchor href={catalog.whatsapp.url} placement="whatsapp_cta">Falar no WhatsApp</TrackedAnchor>}</>;
}
