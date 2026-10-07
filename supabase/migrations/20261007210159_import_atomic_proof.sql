create function public.touch_product_category_revision() returns trigger
language plpgsql security invoker set search_path='' as $$
declare affected uuid[];
begin
 if TG_OP='INSERT' then affected:=array[NEW.product_id];
 elsif TG_OP='DELETE' then affected:=array[OLD.product_id];
 else affected:=array[OLD.product_id,NEW.product_id]; end if;
 perform 1 from public.products where id=any(affected) order by id for update;
 update public.products set updated_at=clock_timestamp() where id=any(affected);
 return null;
end; $$;
revoke all on function public.touch_product_category_revision() from public,anon,authenticated;
grant execute on function public.touch_product_category_revision() to service_role;
create trigger product_categories_revision after insert or update or delete on public.product_categories
 for each row execute function public.touch_product_category_revision();

create or replace function public.apply_product_batch(p_batch_id uuid,p_rows jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare q jsonb; p public.products; desired public.products; current_link public.affiliate_links;
  category_ids uuid[]; current_categories text[]; desired_categories text[];
  created_count integer:=0; updated_count integer:=0; ignored_count integer:=0;
  was_created boolean; same_link boolean; same_product boolean;
  after_state jsonb; changed_keys text[]:=array[]::text[];
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
    changed_keys:=array_append(changed_keys,p.import_key);
    if was_created then created_count:=created_count+1; else updated_count:=updated_count+1; end if;
  end loop;
  select coalesce(jsonb_agg(jsonb_build_object('product',to_jsonb(pr),'link',(select to_jsonb(l) from public.affiliate_links l where l.product_id=pr.id and l.ended_at is null),'category_slugs',(select coalesce(jsonb_agg(c.slug order by c.slug),'[]'::jsonb) from public.product_categories pc join public.categories c on c.id=pc.category_id where pc.product_id=pr.id)) order by pr.id),'[]'::jsonb) into after_state from public.products pr where pr.import_key in(select v->>'import_key' from jsonb_array_elements(p_rows) v);
  return jsonb_build_object('batch_id',p_batch_id,'created',created_count,'updated',updated_count,'ignored',ignored_count,'after',after_state,'changed_keys',changed_keys);
end; $$;

revoke all on function public.apply_product_batch(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.apply_product_batch(uuid,jsonb) to service_role;
