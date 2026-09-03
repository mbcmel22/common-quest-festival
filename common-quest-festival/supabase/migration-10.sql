-- =====================================================================
-- COMMON QUEST : contact email des membres de l equipe
-- A executer dans Supabase > SQL Editor
-- =====================================================================

alter table public.team_members
  add column if not exists email text;
