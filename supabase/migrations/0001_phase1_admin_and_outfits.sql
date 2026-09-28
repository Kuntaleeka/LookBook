-- Phase 1: single admin, outfit inbox, photo storage.
-- Run this in the Supabase dashboard → SQL Editor (or with `supabase db push`).

-- ─── Admins ────────────────────────────────────────────────────────────────
-- Only users listed here can write anything. The table has RLS on and no
-- policies, so it is invisible to the public API; is_admin() reads it.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ─── Outfits ───────────────────────────────────────────────────────────────
do $$ begin
  create type public.outfit_status as enum ('inbox', 'sorted', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.outfits (
  id           uuid primary key default gen_random_uuid(),
  image_path   text not null unique,          -- path inside the "outfits" bucket
  image_width  integer,
  image_height integer,
  title        text,
  notes        text,
  status       public.outfit_status not null default 'inbox',
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists outfits_status_created_idx
  on public.outfits (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists outfits_set_updated_at on public.outfits;
create trigger outfits_set_updated_at
  before update on public.outfits
  for each row execute function public.set_updated_at();

alter table public.outfits enable row level security;

drop policy if exists "Public can read published outfits" on public.outfits;
create policy "Public can read published outfits"
  on public.outfits for select
  using (is_published or (select public.is_admin()));

drop policy if exists "Admin can insert outfits" on public.outfits;
create policy "Admin can insert outfits"
  on public.outfits for insert
  with check ((select public.is_admin()));

drop policy if exists "Admin can update outfits" on public.outfits;
create policy "Admin can update outfits"
  on public.outfits for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin can delete outfits" on public.outfits;
create policy "Admin can delete outfits"
  on public.outfits for delete
  using ((select public.is_admin()));

-- ─── Photo storage ─────────────────────────────────────────────────────────
-- Public bucket: anyone can view a photo by its URL, but there is no select
-- policy, so nobody can list the bucket. Only the admin can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('outfits', 'outfits', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "Admin can upload outfit photos" on storage.objects;
create policy "Admin can upload outfit photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'outfits' and (select public.is_admin()));

drop policy if exists "Admin can update outfit photos" on storage.objects;
create policy "Admin can update outfit photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'outfits' and (select public.is_admin()));

drop policy if exists "Admin can delete outfit photos" on storage.objects;
create policy "Admin can delete outfit photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'outfits' and (select public.is_admin()));
