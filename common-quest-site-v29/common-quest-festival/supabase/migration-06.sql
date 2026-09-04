-- =====================================================================
-- COMMON QUEST : favoris
-- A executer dans Supabase > SQL Editor, apres migration-05.sql
-- =====================================================================

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.favorites enable row level security;

drop policy if exists "favoris : lecture de ses propres favoris" on public.favorites;
create policy "favoris : lecture de ses propres favoris"
  on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "favoris : ajout" on public.favorites;
create policy "favoris : ajout"
  on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "favoris : retrait" on public.favorites;
create policy "favoris : retrait"
  on public.favorites for delete using (auth.uid() = user_id);

create index if not exists favorites_user_idx on public.favorites (user_id);
