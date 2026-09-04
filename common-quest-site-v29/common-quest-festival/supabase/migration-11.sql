-- =====================================================================
-- COMMON QUEST : cadrage des visuels d evenement
-- A executer dans Supabase > SQL Editor
-- =====================================================================

alter table public.events
  add column if not exists cover_fit text not null default 'cover';

alter table public.events drop constraint if exists events_cover_fit_check;
alter table public.events add constraint events_cover_fit_check
  check (cover_fit in ('cover', 'contain'));
