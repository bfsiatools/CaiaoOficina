create table public.products (
  id uuid primary key default gen_random_uuid(),
  import_key text not null unique check (length(import_key) between 1 and 128),
  slug text not null unique check (length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 200),
  short_description text check (length(btrim(short_description)) between 1 and 500),
  image_path text check (image_path ~ '^[0-9a-f-]{36}/[0-9a-f]{64}\.webp$'),
  image_alt text check (length(btrim(image_alt)) between 1 and 250),
  image_width integer check (image_width > 0), image_height integer check (image_height > 0),
  status text not null default 'inactive' check (status in ('active','inactive','out_of_stock','archived')),
  sort_order integer not null default 0 check (sort_order >= 0),
  featured_rank integer check (featured_rank >= 0), daily_pick_date date,
  daily_pick_rank integer not null default 0 check (daily_pick_rank >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint products_active_complete check (status <> 'active' or (short_description is not null and image_path is not null and image_alt is not null and image_width is not null and image_height is not null))
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 80),
  sort_order integer not null default 0 check (sort_order >= 0), is_active boolean not null default true
);
create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  primary key (product_id,category_id)
);
create index product_categories_category_product_idx on public.product_categories(category_id,product_id);
create table public.affiliate_links (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete restrict,
  marketplace text not null default 'mercado_livre' check (marketplace='mercado_livre'),
  affiliate_url text not null check (length(affiliate_url) <= 4096 and affiliate_url ~ '^https://(meli\.la/[A-Za-z0-9]+|((www\.)?mercadolivre\.com\.br)/[^[:space:][:cntrl:]]+)$' and affiliate_url !~* '%0[ad]'),
  marketplace_item_id text check (length(marketplace_item_id) <= 80),
  marketplace_catalog_id text check (length(marketplace_catalog_id) <= 80), seller_id text check (length(seller_id) <= 80),
  created_at timestamptz not null default now(), ended_at timestamptz check (ended_at >= created_at),
  unique(id,product_id)
);
create unique index affiliate_links_one_current_idx on public.affiliate_links(product_id) where ended_at is null;
create index affiliate_links_product_created_idx on public.affiliate_links(product_id,created_at desc);
create table public.site_settings (
  id smallint primary key default 1 check (id=1),
  whatsapp_url text check (length(whatsapp_url) <= 2048 and whatsapp_url ~ '^https://(wa\.me/[0-9]+|api\.whatsapp\.com/send\?[^[:space:][:cntrl:]]+)$'),
  whatsapp_enabled boolean not null default false,
  updated_at timestamptz not null default now(), check (not whatsapp_enabled or whatsapp_url is not null)
);
insert into public.categories(slug,name,sort_order) values
('ferramentas-e-reparos','Ferramentas e reparos',0),('automotivo','Automotivo',1),('casa-e-organizacao','Casa e organização',2),('limpeza-e-cuidados','Limpeza e cuidados',3);
insert into public.site_settings(id) values(1);

create function public.catalog_touch_updated_at() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at := clock_timestamp(); return new; end; $$;
create function public.catalog_protect_import_key() returns trigger language plpgsql security invoker set search_path='' as $$
begin if new.import_key is distinct from old.import_key then raise exception 'import_key immutable'; end if; return new; end; $$;
create function public.catalog_protect_link_history() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if (to_jsonb(new)-'ended_at') is distinct from (to_jsonb(old)-'ended_at') then raise exception 'affiliate link history immutable'; end if;
  if old.ended_at is not null and new.ended_at is distinct from old.ended_at then raise exception 'affiliate link history immutable'; end if;
  return new;
end; $$;
create trigger products_touch_updated before update on public.products for each row execute function public.catalog_touch_updated_at();
create trigger products_protect_import_key before update on public.products for each row execute function public.catalog_protect_import_key();
create trigger settings_touch_updated before update on public.site_settings for each row execute function public.catalog_touch_updated_at();
create trigger affiliate_links_protect_history before update on public.affiliate_links for each row execute function public.catalog_protect_link_history();
revoke all on function public.catalog_touch_updated_at(), public.catalog_protect_import_key(), public.catalog_protect_link_history() from public,anon,authenticated;
grant execute on function public.catalog_touch_updated_at(), public.catalog_protect_import_key(), public.catalog_protect_link_history() to service_role;

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.site_settings enable row level security;
revoke all on public.products, public.categories, public.product_categories, public.affiliate_links, public.site_settings from public, anon, authenticated;
grant all on public.products, public.categories, public.product_categories, public.affiliate_links, public.site_settings to service_role;
grant select(id,slug,name,short_description,image_path,image_alt,image_width,image_height,status,sort_order,featured_rank,daily_pick_date,daily_pick_rank) on public.products to anon,authenticated;
grant select on public.categories,public.product_categories,public.site_settings to anon,authenticated;
grant select(id,product_id,marketplace,affiliate_url,ended_at) on public.affiliate_links to anon,authenticated;
create policy products_public_active on public.products for select to anon,authenticated using(status='active');
create policy categories_public_active on public.categories for select to anon,authenticated using(is_active);
create policy product_categories_public on public.product_categories for select to anon,authenticated using(
 exists(select 1 from public.products p where p.id=product_id and p.status='active') and exists(select 1 from public.categories c where c.id=category_id and c.is_active));
create policy affiliate_links_public_current on public.affiliate_links for select to anon,authenticated using(
 ended_at is null and exists(select 1 from public.products p where p.id=product_id and p.status='active'));
create policy settings_public_read on public.site_settings for select to anon,authenticated using(true);
