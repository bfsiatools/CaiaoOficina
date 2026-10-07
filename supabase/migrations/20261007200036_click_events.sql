create table public.click_events (
  event_id uuid primary key, schema_version smallint not null default 1 check(schema_version=1),
  event_type text not null check(event_type in ('product_click','whatsapp_click')),
  received_at timestamptz not null default now(),
  product_id uuid references public.products(id) on delete restrict,
  affiliate_link_id uuid, foreign key(affiliate_link_id,product_id) references public.affiliate_links(id,product_id) on delete restrict,
  category_snapshot jsonb not null default '[]' check(jsonb_typeof(category_snapshot)='array'),
  page_path text not null check(length(page_path) between 1 and 256 and page_path ~ '^/[^[:space:][:cntrl:]?#]*$' and page_path !~ '^//'),
  placement text not null check(placement in ('catalog_card','featured','daily_pick','product_detail','whatsapp_cta')),
  cta_id text not null check(length(cta_id) between 1 and 64 and cta_id ~ '^[A-Za-z0-9_-]+$'),
  utm_source text check(length(utm_source)<=64 and utm_source !~ '[[:cntrl:]]'),
  utm_medium text check(length(utm_medium)<=64 and utm_medium !~ '[[:cntrl:]]'),
  utm_campaign text check(length(utm_campaign)<=128 and utm_campaign !~ '[[:cntrl:]]'),
  utm_content text check(length(utm_content)<=128 and utm_content !~ '[[:cntrl:]]'),
  content_id text check(length(content_id)<=80 and content_id !~ '[[:cntrl:]]'),
  referrer_host text check(length(referrer_host)<=253 and referrer_host ~ '^[A-Za-z0-9.-]+$'),
  attribution_method text not null default 'unknown' check(attribution_method in ('utm','referrer','unknown')),
  quality text not null default 'accepted' check(quality in ('accepted','suspected','test')),
  check((event_type='product_click' and product_id is not null and affiliate_link_id is not null and placement <> 'whatsapp_cta') or
        (event_type='whatsapp_click' and product_id is null and affiliate_link_id is null and placement='whatsapp_cta'))
);
create index click_events_received_idx on public.click_events(received_at);
create index click_events_product_received_idx on public.click_events(product_id,received_at);
create index click_events_content_received_idx on public.click_events(content_id,received_at);
alter table public.click_events enable row level security;
revoke all on public.click_events from public,anon,authenticated;
grant all on public.click_events to service_role;
