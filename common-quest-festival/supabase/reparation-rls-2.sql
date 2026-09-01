-- =====================================================================
-- COMMON QUEST : reparation des droits d ecriture, version detaillee
-- A executer d un seul bloc dans Supabase > SQL Editor.
-- Chaque etape est independante : si une echoue, les suivantes passent.
-- =====================================================================

-- ETAPE 1 : la fonction qui verifie les droits
create or replace function public.est_admin_direct()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (select role in ('admin', 'editor') from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.est_admin_direct() to authenticated, anon, service_role;

-- ETAPE 2 : suppression de toutes les anciennes regles d ecriture
drop policy if exists "events : ecriture admin" on public.events;
drop policy if exists "ecriture back office" on public.events;
drop policy if exists "traductions : ecriture admin" on public.event_translations;
drop policy if exists "ecriture back office" on public.event_translations;
drop policy if exists "artistes : ecriture admin" on public.artists;
drop policy if exists "ecriture back office" on public.artists;
drop policy if exists "affiches : ecriture admin" on public.event_artists;
drop policy if exists "ecriture back office" on public.event_artists;
drop policy if exists "equipe : ecriture admin" on public.team_members;
drop policy if exists "ecriture back office" on public.team_members;
drop policy if exists "partenaires : ecriture admin" on public.partners;
drop policy if exists "ecriture back office" on public.partners;
drop policy if exists "reglages : ecriture admin" on public.site_settings;
drop policy if exists "ecriture back office" on public.site_settings;

-- ETAPE 3 : une regle d ecriture par table, ecrite explicitement
create policy "ecriture back office" on public.events
  for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct());

create policy "ecriture back office" on public.event_translations
  for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct());

create policy "ecriture back office" on public.artists
  for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct());

create policy "ecriture back office" on public.event_artists
  for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct());

create policy "ecriture back office" on public.team_members
  for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct());

create policy "ecriture back office" on public.partners
  for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct());

create policy "ecriture back office" on public.site_settings
  for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct());

-- ETAPE 4 : le stockage des images
drop policy if exists "media : envoi admin" on storage.objects;
drop policy if exists "media : mise a jour admin" on storage.objects;
drop policy if exists "media : suppression admin" on storage.objects;

create policy "media : envoi admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.est_admin_direct());
create policy "media : mise a jour admin" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.est_admin_direct());
create policy "media : suppression admin" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.est_admin_direct());

-- ETAPE 5 : verification, deux tableaux doivent s afficher
select 'COMPTES ADMIN' as controle, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role in ('admin', 'editor');

select 'REGLES ECRITURE' as controle, tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and policyname = 'ecriture back office'
order by tablename;
