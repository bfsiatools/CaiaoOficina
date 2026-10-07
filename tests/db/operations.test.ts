import { it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { PGlite } from '@electric-sql/pglite';
import { createDatabase } from './harness';
let db:PGlite;
beforeAll(async()=>{db=await createDatabase();});afterAll(async()=>{await db?.close();});
function row(key:string){const id=randomUUID();return {id,import_key:key,slug:key,name:key,short_description:'Descrição fornecida',image_path:`${id}/${'a'.repeat(64)}.webp`,image_alt:key,image_width:500,image_height:500,status:'active',sort_order:0,category_slugs:['ferramentas-e-reparos'],link:{id:randomUUID(),affiliate_url:'https://meli.la/AAA'}};}
async function batch(rows:unknown[]){return (await db.query<{result:{created:number;updated:number;ignored:number}}>('select public.apply_product_batch($1,$2::jsonb) as result',[randomUUID(),JSON.stringify(rows)])).rows[0].result;}
it('exports the RPC contract before any runtime depends on it',async()=>{const result=await db.query("select proname from pg_proc where pronamespace='public'::regnamespace and proname in ('apply_product_batch','get_public_catalog','replace_affiliate_link','record_click_event')");expect(result.rows).toHaveLength(4);});
it('imports atomically, retries without change and detects stale writes',async()=>{
 const r=row('batch-one');expect(await batch([r])).toEqual(expect.objectContaining({created:1,updated:0,ignored:0}));
 expect(await batch([r])).toEqual(expect.objectContaining({created:0,updated:0,ignored:1}));
 await expect(batch([{...r,name:'Changed',expected_updated_at:'2000-01-01T00:00:00Z'}])).rejects.toThrow(/conflict/i);
 const ok=row('batch-rollback'),bad={...row('bad'),category_slugs:['missing']};await expect(batch([ok,bad])).rejects.toThrow();expect((await db.query("select id from public.products where import_key='batch-rollback'")).rows).toHaveLength(0);
});
it('replaces current link once and accepts old-tab clicks with the original version',async()=>{
 const r=row('old-tab');await batch([r]);const old=r.link.id;
 const replaced=await db.query<{id:string}>('select public.replace_affiliate_link($1,$2,$3::jsonb) as id',[r.id,old,JSON.stringify({affiliate_url:'https://meli.la/BBB'})]);
 await expect(db.query('select public.replace_affiliate_link($1,$2,$3::jsonb)',[r.id,old,JSON.stringify({affiliate_url:'https://meli.la/CCC'})])).rejects.toThrow(/conflict/i);
 const event={event_id:randomUUID(),event_type:'product_click',product_id:r.id,affiliate_link_id:old,page_path:'/',placement:'catalog_card',cta_id:'buy',quality:'test'};
 const write=async(e:unknown)=>(await db.query<{result:string}>('select public.record_click_event($1::jsonb) as result',[JSON.stringify(e)])).rows[0].result;
 expect(await write(event)).toBe('inserted');expect(await write(event)).toBe('duplicate');await expect(write({...event,cta_id:'other'})).rejects.toThrow(/conflict/i);
 const saved=(await db.query<{affiliate_link_id:string;category_snapshot:unknown[]}>('select affiliate_link_id,category_snapshot from public.click_events where event_id=$1',[event.event_id])).rows[0];expect(saved.affiliate_link_id).toBe(old);expect(saved.category_snapshot).toHaveLength(1);expect(replaced.rows[0].id).not.toBe(old);
});
it('public RPC omits administrative columns and incomplete relations',async()=>{
 const r=row('public-good');await batch([r]);await db.query("insert into public.products(import_key,slug,name) values('private','private','Private')");
 await db.exec('set role anon');try{const snapshot=(await db.query<{result:{products:unknown[]}}> ('select public.get_public_catalog() as result')).rows[0].result;expect(snapshot.products.length).toBeGreaterThan(0);expect(JSON.stringify(snapshot)).not.toMatch(/import_key|expected_updated_at|private/);await expect(db.query('select public.apply_product_batch($1,$2::jsonb)',[randomUUID(),'[]'])).rejects.toThrow(/permission/i);}finally{await db.exec('reset role');}
});
