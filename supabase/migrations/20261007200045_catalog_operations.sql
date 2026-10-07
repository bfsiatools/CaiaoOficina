create function public.replace_affiliate_link(p_product_id uuid,p_expected_link_id uuid,p_link jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare current_id uuid; result_id uuid;
begin
  perform 1 from public.products where id=p_product_id for update;
  if not found then raise exception 'product not found'; end if;
  select id into current_id from public.affiliate_links where product_id=p_product_id and ended_at is null;
  if current_id is distinct from p_expected_link_id then raise exception 'link version conflict'; end if;
  if current_id is not null then update public.affiliate_links set ended_at=clock_timestamp() where id=current_id; end if;
  insert into public.affiliate_links(id,product_id,affiliate_url,marketplace_item_id,marketplace_catalog_id,seller_id)
  values(coalesce((p_link->>'id')::uuid,gen_random_uuid()),p_product_id,p_link->>'affiliate_url',p_link->>'marketplace_item_id',p_link->>'marketplace_catalog_id',p_link->>'seller_id')
  returning id into result_id;
  return result_id;
end; $$;

create function public.apply_product_batch(p_batch_id uuid,p_rows jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare q jsonb; p public.products; desired public.products; current_link public.affiliate_links;
  category_ids uuid[]; current_categories text[]; desired_categories text[];
  created_count integer:=0; updated_count integer:=0; ignored_count integer:=0;
  was_created boolean; same_link boolean; same_product boolean;
begin
  if p_batch_id is null or jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>100 then raise exception 'invalid batch'; end if;
  -- Stable lock ordering for all writers touching a product identity.
  perform 1 from public.products where import_key in(select v->>'import_key' from jsonb_array_elements(p_rows) v) order by id for update;
  for q in select v from jsonb_array_elements(p_rows) v order by v->>'import_key' loop
    select * into p from public.products where import_key=q->>'import_key' for update;
    was_created:=not found;
    if was_created then
      insert into public.products(id,import_key,slug,name) values(coalesce((q->>'id')::uuid,gen_random_uuid()),q->>'import_key',q->>'slug',q->>'name') returning * into p;
    elsif (q->>'id')::uuid is distinct from p.id then raise exception 'product identity conflict'; end if;
    desired:=jsonb_populate_record(p,q);
    select * into current_link from public.affiliate_links where product_id=p.id and ended_at is null;
    select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into current_categories from public.product_categories pc join public.categories c on c.id=pc.category_id where pc.product_id=p.id;
    if q ? 'category_slugs' then
      select coalesce(array_agg(distinct value order by value),'{}'::text[]) into desired_categories from jsonb_array_elements_text(q->'category_slugs');
    else desired_categories:=current_categories; end if;
    select coalesce(array_agg(id),'{}'::uuid[]) into category_ids from public.categories where slug=any(desired_categories) and is_active;
    if cardinality(category_ids)<>cardinality(desired_categories) then raise exception 'invalid or inactive category'; end if;
    same_link:=not (q ? 'link') or (current_link.id is not null and
      (to_jsonb(current_link)-'id'-'product_id'-'marketplace'-'created_at'-'ended_at') = jsonb_build_object(
        'affiliate_url',q->'link'->>'affiliate_url','marketplace_item_id',q->'link'->>'marketplace_item_id','marketplace_catalog_id',q->'link'->>'marketplace_catalog_id','seller_id',q->'link'->>'seller_id'));
    same_product:=(to_jsonb(p)-'updated_at'-'created_at')=(to_jsonb(desired)-'updated_at'-'created_at');
    if not was_created and same_link and same_product and current_categories=desired_categories then ignored_count:=ignored_count+1; continue; end if;
    if not was_created and (not (q ? 'expected_updated_at') or (q->>'expected_updated_at')::timestamptz is distinct from p.updated_at) then raise exception 'product edit conflict'; end if;
    if q ? 'link' and not same_link then
      if not was_created and ((q->>'expected_link_id')::uuid is distinct from current_link.id) then raise exception 'link version conflict'; end if;
      perform public.replace_affiliate_link(p.id,current_link.id,q->'link');
    end if;
    if desired.status='active' and (cardinality(category_ids)=0 or not exists(select 1 from public.affiliate_links where product_id=p.id and ended_at is null)) then raise exception 'product not publishable'; end if;
    update public.products set slug=desired.slug,name=desired.name,short_description=desired.short_description,image_path=desired.image_path,image_alt=desired.image_alt,
      image_width=desired.image_width,image_height=desired.image_height,status=desired.status,sort_order=desired.sort_order,featured_rank=desired.featured_rank,daily_pick_date=desired.daily_pick_date,daily_pick_rank=desired.daily_pick_rank where id=p.id;
    delete from public.product_categories where product_id=p.id and not(category_id=any(category_ids));
    insert into public.product_categories(product_id,category_id) select p.id,unnest(category_ids) on conflict do nothing;
    if was_created then created_count:=created_count+1; else updated_count:=updated_count+1; end if;
  end loop;
  return jsonb_build_object('batch_id',p_batch_id,'created',created_count,'updated',updated_count,'ignored',ignored_count);
end; $$;

create function public.record_click_event(p_event jsonb) returns text language plpgsql security invoker set search_path='' as $$
declare e public.click_events; existing public.click_events; snapshot jsonb; inserted_count integer;
begin
  e:=jsonb_populate_record(null::public.click_events,jsonb_build_object('schema_version',1,'attribution_method','unknown','quality','accepted')||p_event);
  if e.event_type='product_click' and not exists(select 1 from public.affiliate_links where id=e.affiliate_link_id and product_id=e.product_id) then return 'invalid_reference'; end if;
  if e.event_type='whatsapp_click' and not exists(select 1 from public.site_settings where id=1 and whatsapp_enabled) then return 'invalid_reference'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'slug',c.slug,'name',c.name) order by c.slug),'[]') into snapshot
    from public.product_categories pc join public.categories c on c.id=pc.category_id where pc.product_id=e.product_id and c.is_active;
  e.received_at:=clock_timestamp(); e.category_snapshot:=snapshot;
  insert into public.click_events select e.* on conflict(event_id) do nothing;
  get diagnostics inserted_count=row_count;
  if inserted_count=1 then return 'inserted'; end if;
  select * into existing from public.click_events where event_id=e.event_id;
  if (to_jsonb(existing)-'received_at'-'category_snapshot') is distinct from (to_jsonb(e)-'received_at'-'category_snapshot') then raise exception 'event_id conflict'; end if;
  return 'duplicate';
end; $$;

create function public.get_public_catalog() returns jsonb language sql stable security invoker set search_path='' as $$
  select jsonb_build_object(
    'generatedAt',statement_timestamp(),
    'products',coalesce((select jsonb_agg(row_data order by sort_order,id) from (
      select p.id,p.sort_order,jsonb_build_object('id',p.id,'slug',p.slug,'name',p.name,'shortDescription',p.short_description,
        'image',jsonb_build_object('path',p.image_path,'alt',p.image_alt,'width',p.image_width,'height',p.image_height),
        'sortOrder',p.sort_order,'featuredRank',p.featured_rank,'dailyPickDate',p.daily_pick_date,'dailyPickRank',p.daily_pick_rank,
        'categories',(select jsonb_agg(jsonb_build_object('id',c.id,'slug',c.slug,'name',c.name) order by c.sort_order,c.id) from public.product_categories pc join public.categories c on c.id=pc.category_id where pc.product_id=p.id and c.is_active),
        'offer',jsonb_build_object('id',l.id,'marketplace',l.marketplace,'affiliateUrl',l.affiliate_url)) as row_data
      from public.products p join public.affiliate_links l on l.product_id=p.id and l.ended_at is null
      where p.status='active' and p.short_description is not null and p.image_path is not null and p.image_alt is not null and p.image_width is not null and p.image_height is not null
      and exists(select 1 from public.product_categories pc join public.categories c on c.id=pc.category_id where pc.product_id=p.id and c.is_active)
    ) visible_products),'[]'::jsonb),
    'categories',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'slug',c.slug,'name',c.name) order by c.sort_order,c.id)
      from public.categories c where c.is_active and exists(select 1 from public.product_categories pc join public.products p on p.id=pc.product_id join public.affiliate_links l on l.product_id=p.id and l.ended_at is null where pc.category_id=c.id and p.status='active')),'[]'::jsonb),
    'whatsapp',coalesce((select jsonb_build_object('enabled',whatsapp_enabled,'url',case when whatsapp_enabled then whatsapp_url else null end) from public.site_settings where id=1),'{}'::jsonb)
  );
$$;
revoke all on function public.apply_product_batch(uuid,jsonb),public.replace_affiliate_link(uuid,uuid,jsonb),public.record_click_event(jsonb),public.get_public_catalog() from public,anon,authenticated;
grant execute on function public.apply_product_batch(uuid,jsonb),public.replace_affiliate_link(uuid,uuid,jsonb),public.record_click_event(jsonb),public.get_public_catalog() to service_role;
grant execute on function public.get_public_catalog() to anon,authenticated;
-- Platform event trigger stays intact; only unnecessary direct execution grants are removed.
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then execute 'revoke execute on function public.rls_auto_enable() from public,anon,authenticated'; end if;
end; $$;
