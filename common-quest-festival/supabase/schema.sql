-- =====================================================================
-- COMMON QUEST : schema de base de donnees (Supabase / PostgreSQL)
-- A executer dans Supabase > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PROFILS UTILISATEURS
-- Les mots de passe ne sont JAMAIS stockes ici : ils vivent uniquement
-- dans le schema auth de Supabase, hashes en bcrypt, inaccessibles
-- depuis l'application comme depuis le tableau de bord.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member','editor','admin')),
  locale text not null default 'fr' check (locale in ('fr','en','es')),
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, locale)
  values (new.id, nullif(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'locale','fr'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper : l'utilisateur courant est-il administrateur ?
create or replace function public.is_admin()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','editor')
  );
$$;

-- ---------------------------------------------------------------------
-- 2. EVENEMENTS
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  day_index smallint not null check (day_index between 1 and 4), -- 1 = jeudi ... 4 = dimanche
  event_date date not null,
  start_time time,
  end_time time,
  doors_time time,
  category text not null default 'autre'
    check (category in ('danse','rap','graffiti','dj','atelier','talk','soiree','autre')),
  venue text,
  address text,
  price_label text,           -- ex : "12 EUR sur place / 10 EUR en prevente"
  price_from numeric(6,2),
  ticket_url text,            -- lien billetterie externe (HelloAsso, Shotgun...)
  is_free boolean not null default false,
  cover_url text,             -- visuel large
  is_published boolean not null default false,
  is_highlight boolean not null default false,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_translations (
  event_id uuid references public.events(id) on delete cascade,
  locale text not null check (locale in ('fr','en','es')),
  title text not null,
  tagline text,
  description text,
  practical_info text,
  primary key (event_id, locale)
);

-- ---------------------------------------------------------------------
-- 3. ARTISTES / TETES D'AFFICHE
-- ---------------------------------------------------------------------
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discipline text,
  country text,
  photo_url text,
  instagram_url text,
  bio_fr text, bio_en text, bio_es text,
  is_headliner boolean not null default false,
  sort_order smallint not null default 0
);

create table if not exists public.event_artists (
  event_id uuid references public.events(id) on delete cascade,
  artist_id uuid references public.artists(id) on delete cascade,
  billing text default 'lineup' check (billing in ('headliner','lineup','guest','jury')),
  sort_order smallint not null default 0,
  primary key (event_id, artist_id)
);

-- ---------------------------------------------------------------------
-- 4. EQUIPE PRISM ET PARTENAIRES
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  role_fr text, role_en text, role_es text,
  quote_fr text, quote_en text, quote_es text,
  photo_url text,
  instagram_url text,
  sort_order smallint not null default 0,
  is_published boolean not null default true
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  kind text default 'partenaire' check (kind in ('partenaire','institution','media','lieu')),
  sort_order smallint not null default 0
);

-- ---------------------------------------------------------------------
-- 5. REGLAGES DU SITE (textes de la page d'accueil, infos pratiques...)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- Lecture publique du contenu publie, ecriture reservee aux admins.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_translations enable row level security;
alter table public.artists enable row level security;
alter table public.event_artists enable row level security;
alter table public.team_members enable row level security;
alter table public.partners enable row level security;
alter table public.site_settings enable row level security;

-- Profils : chacun ne voit et ne modifie que le sien
create policy "profil : lecture de son propre profil"
  on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profil : mise a jour de son propre profil"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Evenements
create policy "events : lecture publique des publies"
  on public.events for select using (is_published or public.is_admin());
create policy "events : ecriture admin"
  on public.events for all using (public.is_admin()) with check (public.is_admin());

create policy "traductions : lecture publique"
  on public.event_translations for select using (true);
create policy "traductions : ecriture admin"
  on public.event_translations for all using (public.is_admin()) with check (public.is_admin());

create policy "artistes : lecture publique"
  on public.artists for select using (true);
create policy "artistes : ecriture admin"
  on public.artists for all using (public.is_admin()) with check (public.is_admin());

create policy "affiches : lecture publique"
  on public.event_artists for select using (true);
create policy "affiches : ecriture admin"
  on public.event_artists for all using (public.is_admin()) with check (public.is_admin());

create policy "equipe : lecture publique"
  on public.team_members for select using (is_published or public.is_admin());
create policy "equipe : ecriture admin"
  on public.team_members for all using (public.is_admin()) with check (public.is_admin());

create policy "partenaires : lecture publique"
  on public.partners for select using (true);
create policy "partenaires : ecriture admin"
  on public.partners for all using (public.is_admin()) with check (public.is_admin());

create policy "reglages : lecture publique"
  on public.site_settings for select using (true);
create policy "reglages : ecriture admin"
  on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. STOCKAGE DES IMAGES
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media : lecture publique"
  on storage.objects for select using (bucket_id = 'media');
create policy "media : envoi admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media : mise a jour admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "media : suppression admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------
-- 8. INDEX
-- ---------------------------------------------------------------------
create index if not exists events_day_idx on public.events (day_index, start_time);
create index if not exists events_slug_idx on public.events (slug);
