import { beforeAll,afterAll,it,expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { PGlite } from '@electric-sql/pglite';
import { createDatabase } from './harness';
import { buildImportPlan,type ImportState } from '../../scripts/lib/import-plan';
import { buildRollbackPlan,parseBatchProof } from '../../scripts/lib/operations';
let db:PGlite;beforeAll(async()=>{db=await createDatabase();});afterAll(async()=>{await db?.close();});
async function apply(rows:unknown[]){return (await db.query<{result:Record<string,unknown>}>('select public.apply_product_batch($1,$2::jsonb) result',[randomUUID(),JSON.stringify(rows)])).rows[0].result;}
async function state(id:string){return (await db.query<{state:ImportState}>(`select jsonb_build_object('product',to_jsonb(p),'link',(select to_jsonb(l) from public.affiliate_links l where l.product_id=p.id and l.ended_at is null),'category_slugs',(select jsonb_agg(c.slug order by c.slug) from public.product_categories pc join public.categories c on c.id=pc.category_id where pc.product_id=p.id)) state from public.products p where id=$1`,[id])).rows[0].state;}
async function fixture(key:string){const id=randomUUID(),product={id,import_key:key,slug:key,name:'Before',status:'inactive'},link={id:randomUUID(),affiliate_url:'https://meli.la/AAA'},category_slugs=['automotivo'];await apply([{...product,link,category_slugs}]);const current=await state(id);return {product,link,category_slugs,appliedSource:{product,link,category_slugs},appliedState:current};}
it('category Dashboard edits invalidate importer CAS and remain intact on failure',async()=>{
 const source=await fixture('review-category'),current=source.appliedState;source.product={...source.product,name:'Imported'};const plan=buildImportPlan({rows:[source]},[current]);
 await db.query("insert into public.product_categories(product_id,category_id) select $1,id from public.categories where slug='ferramentas-e-reparos'",[source.product.id]);
 await expect(apply(plan.rows.map(r=>r.payload))).rejects.toThrow(/conflict/i);expect((await state(source.product.id)).category_slugs).toHaveLength(2);
});
it('RPC proof freezes applied state and rejects rollback after a subsequent manual edit',async()=>{
 const source=await fixture('review-proof'),before=source.appliedState;source.product={...source.product,name:'Imported'};const plan=buildImportPlan({rows:[source]},[before]),result=await apply(plan.rows.map(r=>r.payload));
 expect((result.after as ImportState[]|undefined)?.[0]?.product.name).toBe('Imported');const proof=parseBatchProof(result,plan.rows.map(r=>r.payload));
 await db.query("update public.products set name='Manual after commit' where id=$1",[source.product.id]);const report={proofVersion:1,status:'committed',rows:plan.rows.map(r=>({action:r.action,payload:r.payload,before:r.before})),after:proof.after};
 expect(buildRollbackPlan(report,[await state(source.product.id)]).errors).toHaveLength(1);
 const retry=await apply([{...source.product,category_slugs:source.category_slugs,link:source.link,name:'Manual after commit'}]);expect(retry.changed_keys).toEqual([]);
});
it('editing only source URL creates a new link identity and stable reimport',async()=>{
 const source=await fixture('review-link'),before=source.appliedState;source.link={...source.link,affiliate_url:'https://meli.la/BBB'};const plan=buildImportPlan({rows:[source]},[before]);await apply(plan.rows.map(r=>r.payload));
 const after=await state(source.product.id);expect(after.link?.id).not.toBe(before.link?.id);expect(after.link?.affiliate_url).toBe('https://meli.la/BBB');source.appliedSource={product:source.product,link:source.link,category_slugs:source.category_slugs};source.appliedState=after;const retry=buildImportPlan({rows:[source]},[after]);expect(retry.rows[0].action).toBe('ignored');expect((await apply(retry.rows.map(r=>r.payload))).ignored).toBe(1);
});
