create extension if not exists pgcrypto;

create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Top','Bottom','Shoes','Outerwear','Accessory')),
  color text not null default 'Unspecified',
  size text,
  fit text,
  tags text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'New outfit',
  item_ids text[] not null default '{}',
  occasion text,
  aesthetic text,
  notes text,
  favorite boolean not null default false,
  worn_at timestamptz,
  scheduled_for date,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  notes text,
  purchased boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.wardrobe_items enable row level security;
alter table public.outfits enable row level security;
alter table public.wishlist_items enable row level security;

create policy "wardrobe owner only" on public.wardrobe_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "outfits owner only" on public.outfits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist owner only" on public.wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create a Storage bucket named wardrobe-images in Supabase.
-- These policies restrict each user's files to their own top-level folder.
insert into storage.buckets (id, name, public) values ('wardrobe-images','wardrobe-images',true)
on conflict (id) do nothing;
create policy "users upload own wardrobe images" on storage.objects for insert to authenticated
with check (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own wardrobe images" on storage.objects for update to authenticated
using (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own wardrobe images" on storage.objects for delete to authenticated
using (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);
