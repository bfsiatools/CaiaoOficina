import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/supabase/database.types';
import type { ImportState } from './import-plan';
export async function readImportState(client:SupabaseClient<Database>):Promise<ImportState[]> {
  const [products,links,categories]=await Promise.all([client.from('products').select('*'),client.from('affiliate_links').select('*').is('ended_at',null),client.from('product_categories').select('product_id,categories(slug)')]);
  if(products.error||links.error||categories.error)throw Error('Falha ao ler estado administrativo');
  return products.data!.map(product=>({product,link:links.data!.find(l=>l.product_id===product.id)??null,category_slugs:categories.data!.filter(c=>c.product_id===product.id).map(c=>c.categories.slug)}));
}
