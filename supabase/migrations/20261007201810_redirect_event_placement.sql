alter table public.click_events drop constraint click_events_placement_check;
alter table public.click_events add constraint click_events_placement_check
 check(placement in ('catalog_card','featured','daily_pick','product_detail','whatsapp_cta','redirect'));
