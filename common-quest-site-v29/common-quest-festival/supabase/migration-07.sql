-- =====================================================================
-- COMMON QUEST : plusieurs videos et reseaux sociaux par evenement
-- A executer dans Supabase > SQL Editor, apres migration-06.sql
-- =====================================================================

alter table public.events
  add column if not exists video_urls jsonb not null default '[]'::jsonb,
  add column if not exists social_links jsonb not null default '{}'::jsonb;

-- L ancienne video unique devient le premier element de la liste
update public.events
set video_urls = jsonb_build_array(video_url)
where video_url is not null and video_url <> '' and video_urls = '[]'::jsonb;
