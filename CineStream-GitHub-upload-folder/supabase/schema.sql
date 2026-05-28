create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null,
  movie jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null,
  movie jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

create index if not exists wishlist_user_created_idx on public.wishlist (user_id, created_at desc);
create index if not exists watchlist_user_created_idx on public.watchlist (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.wishlist enable row level security;
alter table public.watchlist enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can read their own wishlist" on public.wishlist;
drop policy if exists "Users can add to their own wishlist" on public.wishlist;
drop policy if exists "Users can update their own wishlist" on public.wishlist;
drop policy if exists "Users can delete from their own wishlist" on public.wishlist;

create policy "Users can read their own wishlist"
  on public.wishlist for select
  using (auth.uid() = user_id);

create policy "Users can add to their own wishlist"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own wishlist"
  on public.wishlist for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete from their own wishlist"
  on public.wishlist for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their own watchlist" on public.watchlist;
drop policy if exists "Users can add to their own watchlist" on public.watchlist;
drop policy if exists "Users can update their own watchlist" on public.watchlist;
drop policy if exists "Users can delete from their own watchlist" on public.watchlist;

create policy "Users can read their own watchlist"
  on public.watchlist for select
  using (auth.uid() = user_id);

create policy "Users can add to their own watchlist"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own watchlist"
  on public.watchlist for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
  on public.watchlist for delete
  using (auth.uid() = user_id);
