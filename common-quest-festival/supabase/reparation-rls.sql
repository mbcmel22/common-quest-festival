-- =====================================================================
-- COMMON QUEST : reparation des droits d ecriture du back office
-- A executer dans Supabase > SQL Editor. Le message "Potential issue
-- detected" est normal : le script remplace des regles existantes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Fonction d aide reconstruite proprement
-- Le schema auth est ajoute au chemin de recherche et le droit
-- d execution est donne explicitement aux comptes connectes.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- ---------------------------------------------------------------------
-- 2. Regles d ecriture reecrites sans dependre de la fonction
-- La verification est faite directement dans la regle : si la fonction
-- pose probleme, l ecriture continue de fonctionner.
-- ---------------------------------------------------------------------
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

grant execute on function public.est_admin_direct() to authenticated, anon;

do $$
declare
  t text;
begin
  foreach t in array array['events', 'event_translations', 'artists', 'event_artists', 'team_members', 'partners', 'site_settings']
  loop
    execute format('drop policy if exists %I on public.%I', 'ecriture back office', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.est_admin_direct()) with check (public.est_admin_direct())',
      'ecriture back office', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 3. Anciennes regles d ecriture retirees pour eviter les doublons
-- ---------------------------------------------------------------------
drop policy if exists "events : ecriture admin" on public.events;
drop policy if exists "traductions : ecriture admin" on public.event_translations;
drop policy if exists "artistes : ecriture admin" on public.artists;
drop policy if exists "affiches : ecriture admin" on public.event_artists;
drop policy if exists "equipe : ecriture admin" on public.team_members;
drop policy if exists "partenaires : ecriture admin" on public.partners;
drop policy if exists "reglages : ecriture admin" on public.site_settings;

-- ---------------------------------------------------------------------
-- 4. Stockage des images, meme logique
-- ---------------------------------------------------------------------
drop policy if exists "media : envoi admin" on storage.objects;
drop policy if exists "media : mise a jour admin" on storage.objects;
drop policy if exists "media : suppression admin" on storage.objects;

create policy "media : envoi admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.est_admin_direct());
create policy "media : mise a jour admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.est_admin_direct());
create policy "media : suppression admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.est_admin_direct());

-- ---------------------------------------------------------------------
-- 5. Verification : la liste des comptes ayant acces au back office
-- ---------------------------------------------------------------------
select u.email, p.role, length(p.role) as longueur_du_role
from public.profiles p
join auth.users u on u.id = p.id
where p.role in ('admin', 'editor');
