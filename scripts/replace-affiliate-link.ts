import { randomUUID } from 'node:crypto';
import { adminClient } from './lib/admin-env';
import { validateAffiliateUrl } from '../src/lib/affiliate/urls';
import { revalidateCatalog } from './revalidate-catalog';
const args=process.argv.slice(2),value=(key:string)=>args[args.indexOf(key)+1];
async function main(){
 const slug=args.includes('--slug')?value('--slug'):undefined,url=args.includes('--url')?value('--url'):undefined;
 if(!slug||!url)throw Error('Informe --slug e --url');validateAffiliateUrl(url);const client=adminClient();
 const product=await client.from('products').select('id').eq('slug',slug).single();if(product.error)throw Error('Produto ausente');
 const current=await client.from('affiliate_links').select('id').eq('product_id',product.data.id).is('ended_at',null).maybeSingle();if(current.error)throw Error('Falha ao consultar versão atual');
 const expected=current.data?.id??null;if(args.includes('--expected-link-id')&&value('--expected-link-id')!==(expected??'null'))throw Error('Versão informada diverge; não aplicado');
 if(!args.includes('--apply')){console.log(JSON.stringify({mode:'dry-run',productId:product.data.id,expectedLinkId:expected}));return;}
 const result=await client.rpc('replace_affiliate_link',{p_product_id:product.data.id,p_expected_link_id:expected!,p_link:{id:randomUUID(),affiliate_url:url}});if(result.error)throw Error('Troca de link recusada: '+result.error.code);
 console.log(JSON.stringify({mode:'apply',linkId:result.data,cacheInvalidated:await revalidateCatalog()}));
}
main().catch(error=>{console.error((error as Error).message);process.exitCode=1;});
