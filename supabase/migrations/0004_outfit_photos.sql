-- Extra photos of the same outfit (other angles, details). The outfit's own
-- image_path stays the main photo: the one that is tagged and shown in grids.
-- Run in the Supabase dashboard → SQL Editor, after 0003.

create table if not exists public.outfit_photos (
  id            uuid primary key default gen_random_uuid(),
  outfit_id     uuid not null references public.outfits (id) on delete cascade,
  image_path    text not null,
  image_width   integer,
  image_height  integer,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists outfit_photos_outfit_idx on public.outfit_photos (outfit_id, sort_order);

alter table public.outfit_photos enable row level security;

drop policy if exists "Public can read photos of published outfits" on public.outfit_photos;
create policy "Public can read photos of published outfits"
  on public.outfit_photos for select
  using (
    (select public.is_admin())
    or exists (select 1 from public.outfits o where o.id = outfit_photos.outfit_id and o.is_published)
  );

drop policy if exists "Admin can manage outfit photos" on public.outfit_photos;
create policy "Admin can manage outfit photos"
  on public.outfit_photos for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
