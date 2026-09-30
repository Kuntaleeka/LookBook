-- Phase 2: categories (aesthetics) with editable themes.
-- Run in the Supabase dashboard → SQL Editor, after 0001.

-- ─── Categories ────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 60),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description     text,
  keywords        text[] not null default '{}',
  theme           jsonb not null default '{}',
  moodboard_urls  text[] not null default '{}',
  parent_id       uuid references public.categories (id) on delete set null,
  cover_outfit_id uuid references public.outfits (id) on delete set null,
  sort_order      integer not null default 0,
  is_visible      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (parent_id is distinct from id)
);

create index if not exists categories_sort_idx on public.categories (sort_order);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists "Public can read visible categories" on public.categories;
create policy "Public can read visible categories"
  on public.categories for select
  using (is_visible or (select public.is_admin()));

drop policy if exists "Admin can insert categories" on public.categories;
create policy "Admin can insert categories"
  on public.categories for insert
  with check ((select public.is_admin()));

drop policy if exists "Admin can update categories" on public.categories;
create policy "Admin can update categories"
  on public.categories for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin can delete categories" on public.categories;
create policy "Admin can delete categories"
  on public.categories for delete
  using ((select public.is_admin()));

-- ─── Outfit ↔ category links (used from Phase 3) ──────────────────────────
alter table public.outfits
  add column if not exists primary_category_id uuid
  references public.categories (id) on delete set null;

create index if not exists outfits_primary_category_idx
  on public.outfits (primary_category_id);

-- Extra (secondary) category tags.
create table if not exists public.outfit_categories (
  outfit_id   uuid not null references public.outfits (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (outfit_id, category_id)
);

create index if not exists outfit_categories_category_idx
  on public.outfit_categories (category_id);

alter table public.outfit_categories enable row level security;

drop policy if exists "Public can read published outfit tags" on public.outfit_categories;
create policy "Public can read published outfit tags"
  on public.outfit_categories for select
  using (
    (select public.is_admin())
    or exists (
      select 1
      from public.outfits o
      join public.categories c on c.id = outfit_categories.category_id
      where o.id = outfit_categories.outfit_id and o.is_published and c.is_visible
    )
  );

drop policy if exists "Admin can manage outfit tags" on public.outfit_categories;
create policy "Admin can manage outfit tags"
  on public.outfit_categories for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ─── Admin operations ──────────────────────────────────────────────────────
-- Delete a category. Its outfits either move to p_move_to (a merge) or go
-- back to the inbox, unpublished, when p_move_to is null.
create or replace function public.delete_category(p_id uuid, p_move_to uuid default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the admin can delete categories' using errcode = '42501';
  end if;
  if p_move_to = p_id then
    raise exception 'Cannot merge a category into itself';
  end if;

  if p_move_to is null then
    update public.outfits
       set primary_category_id = null, status = 'inbox', is_published = false
     where primary_category_id = p_id;
  else
    update public.outfits
       set primary_category_id = p_move_to
     where primary_category_id = p_id;

    insert into public.outfit_categories (outfit_id, category_id)
    select outfit_id, p_move_to from public.outfit_categories where category_id = p_id
    on conflict do nothing;

    -- An outfit shouldn't have the same category as both main and extra.
    delete from public.outfit_categories oc
     using public.outfits o
     where oc.outfit_id = o.id
       and oc.category_id = p_move_to
       and o.primary_category_id = p_move_to;
  end if;

  delete from public.categories where id = p_id;
end;
$$;

-- Save a new order from the drag-and-drop list.
create or replace function public.reorder_categories(p_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.categories c
     set sort_order = t.ord
    from unnest(p_ids) with ordinality as t(id, ord)
   where c.id = t.id;
$$;

grant execute on function public.delete_category(uuid, uuid) to authenticated;
grant execute on function public.reorder_categories(uuid[]) to authenticated;

-- ─── Starter aesthetics (edit or delete them in the studio) ────────────────
insert into public.categories (name, slug, description, keywords, theme, sort_order, is_visible)
values
  ('Soft / Coquette', 'coquette', 'Hyper-feminine and romantic: bows, lace, ribbons, pearls and ballet flats in blush and cream.',
   array['bows', 'lace', 'ribbons', 'pearls', 'ballet flats', 'pastel pink', 'frills', 'mary janes'],
   '{"bg":"#fff4f6","surface":"#ffffff","fg":"#5b2b3a","mutedFg":"#8a5a69","accent":"#f2b8c6","accentFg":"#5b2b3a","fontDisplay":"Playfair Display","fontBody":"Lora","radius":24,"motif":"bow"}'::jsonb, 1, true),
  ('Grunge', 'grunge', 'Lived-in and undone: flannel, ripped denim, band tees, combat boots and faded layers.',
   array['flannel', 'ripped denim', 'band tee', 'combat boots', 'layering', 'distressed', 'beanie'],
   '{"bg":"#2b2a26","surface":"#3a3832","fg":"#ece6d4","mutedFg":"#b3ab94","accent":"#d0764a","accentFg":"#1c1a17","fontDisplay":"Special Elite","fontBody":"IBM Plex Mono","radius":2,"motif":"star"}'::jsonb, 2, true),
  ('Goth', 'goth', 'Dark and dramatic: black lace, velvet, corsets, silver jewelry and platform boots.',
   array['black lace', 'velvet', 'corset', 'silver jewelry', 'platforms', 'fishnets', 'oxblood'],
   '{"bg":"#0e0b0d","surface":"#1a1417","fg":"#ede6ea","mutedFg":"#a3959c","accent":"#8b1e3f","accentFg":"#f5edf0","fontDisplay":"UnifrakturMaguntia","fontBody":"Cormorant Garamond","radius":0,"motif":"cross"}'::jsonb, 3, true),
  ('Acubi', 'acubi', 'Korean minimal with an edge: washed greys, layered tanks, cargo skirts and subtle tech details.',
   array['washed grey', 'layered tanks', 'cargo', 'mesh', 'minimal', 'silver', 'shrug', 'ice blue'],
   '{"bg":"#eef0f2","surface":"#f8f9fa","fg":"#2e3338","mutedFg":"#5f6770","accent":"#9db4c8","accentFg":"#1f2a33","fontDisplay":"Space Grotesk","fontBody":"Inter","radius":6,"motif":"sparkle"}'::jsonb, 4, true),
  ('Office Siren', 'office-siren', 'Sharp and seductive corporate: pencil skirts, fitted blazers, kitten heels and rimless glasses.',
   array['pencil skirt', 'fitted blazer', 'kitten heels', 'rimless glasses', 'burgundy', 'sleek bun', 'pinstripe'],
   '{"bg":"#f4f1ee","surface":"#ffffff","fg":"#1a1a1d","mutedFg":"#5e575b","accent":"#6e1423","accentFg":"#ffffff","fontDisplay":"Bodoni Moda","fontBody":"Inter","radius":4,"motif":"none"}'::jsonb, 5, true)
on conflict (slug) do nothing;
