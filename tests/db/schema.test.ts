import { it, expect, beforeAll, afterAll } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { createDatabase } from './harness';
let db: PGlite;
beforeAll(async () => { db = await createDatabase(); });
afterAll(async () => { await db.close(); });
it('stores product identity, relation history and events in six protected tables', async () => {
  const result = await db.query<{ count: number; secured: number }>("select count(*)::int as count, count(*) filter(where relrowsecurity)::int as secured from pg_class where relnamespace='public'::regnamespace and relname in ('products','categories','product_categories','affiliate_links','click_events','site_settings') and relkind='r'");
  expect(result.rows[0]).toEqual({ count: 6, secured: 6 });
});
it('accepts inactive editorial drafts but rejects duplicate slugs and incomplete activation', async () => {
  await db.query("insert into public.products(import_key,slug,name) values ('test-a','test-a','Produto A')");
  await expect(db.query("insert into public.products(import_key,slug,name) values ('test-b','test-a','Produto B')")).rejects.toThrow(/unique/i);
  await expect(db.query("update public.products set status='active' where import_key='test-a'")).rejects.toThrow(/check/i);
});
it('keeps product import identity and affiliate history immutable', async () => {
  const result=await db.query<{id:string}>("insert into public.products(import_key,slug,name) values ('history','history','History') returning id");
  const id=result.rows[0].id;
  await expect(db.query("update public.products set import_key='changed' where id=$1",[id])).rejects.toThrow(/immutable/i);
  await db.query("insert into public.affiliate_links(product_id,affiliate_url) values ($1,'https://meli.la/AAA')",[id]);
  await expect(db.query("insert into public.affiliate_links(product_id,affiliate_url) values ($1,'https://meli.la/BBB')",[id])).rejects.toThrow(/unique/i);
  await expect(db.query("update public.affiliate_links set affiliate_url='https://meli.la/BBB' where product_id=$1",[id])).rejects.toThrow(/immutable/i);
});
it('rejects an event linking product A to a version of product B', async () => {
  const products=await db.query<{id:string}>("insert into public.products(import_key,slug,name) values ('event-a','event-a','A'),('event-b','event-b','B') returning id");
  const link=await db.query<{id:string}>("insert into public.affiliate_links(product_id,affiliate_url) values ($1,'https://meli.la/AAA') returning id",[products.rows[1].id]);
  await expect(db.query("insert into public.click_events(event_id,event_type,product_id,affiliate_link_id,page_path,placement,cta_id) values (gen_random_uuid(),'product_click',$1,$2,'/','catalog_card','buy')",[products.rows[0].id,link.rows[0].id])).rejects.toThrow(/foreign key/i);
});
it.each(['anon','authenticated'])('blocks %s writes, private columns and event reads', async role => {
  await db.exec(`set role ${role}`);
  try {
    await expect(db.query("insert into public.products(import_key,slug,name) values ('attack','attack','Attack')")).rejects.toThrow(/permission/i);
    await expect(db.query('select import_key from public.products')).rejects.toThrow(/permission/i);
    await expect(db.query('select * from public.click_events')).rejects.toThrow(/permission/i);
    const result=await db.query('select id from public.products'); expect(result.rows).toEqual([]);
  } finally { await db.exec('reset role'); }
});
