-- Items tagged on an outfit photo: a pin position plus where the piece is from.
-- Run in the Supabase dashboard → SQL Editor, after 0002.

do $$ begin
  create type public.item_source as enum ('shop', 'instagram', 'local', 'unknown');
exception when duplicate_object then null;
end $$;

create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  outfit_id   uuid not null references public.outfits (id) on delete cascade,
  name        text not null default '' check (char_length(name) <= 80),
  -- pin position as a fraction of the photo's width/height (0 = left/top)
  pin_x       real not null check (pin_x between 0 and 1),
  pin_y       real not null check (pin_y between 0 and 1),
  source      public.item_source not null default 'unknown',
  shop_url    text check (shop_url is null or shop_url ~ '^https?://'),
  ig_handle   text check (ig_handle is null or ig_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  place       text check (place is null or char_length(place) <= 120),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists items_outfit_idx on public.items (outfit_id, sort_order);

alter table public.items enable row level security;

drop policy if exists "Public can read items on published outfits" on public.items;
create policy "Public can read items on published outfits"
  on public.items for select
  using (
    (select public.is_admin())
    or exists (select 1 from public.outfits o where o.id = items.outfit_id and o.is_published)
  );

drop policy if exists "Admin can manage items" on public.items;
create policy "Admin can manage items"
  on public.items for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
