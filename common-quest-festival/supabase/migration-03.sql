-- =====================================================================
-- COMMON QUEST : mise a jour, videos et banderoles
-- A executer dans Supabase > SQL Editor, apres migration-02.sql
-- =====================================================================

alter table public.events
  add column if not exists video_url text;

update public.site_settings
set value = jsonb_build_object(
      'home', jsonb_build_object(
        'fr', coalesce(value->>'fr', 'Qu''avons-nous en commun ? Le hip hop.'),
        'en', coalesce(value->>'en', 'What do we have in common? Hip hop.'),
        'es', coalesce(value->>'es', 'Que tenemos en comun? El hip hop.')
      ),
      'infos', jsonb_build_object(
        'fr', coalesce(value->>'fr', 'Qu''avons-nous en commun ? Le hip hop.'),
        'en', coalesce(value->>'en', 'What do we have in common? Hip hop.'),
        'es', coalesce(value->>'es', 'Que tenemos en comun? El hip hop.')
      ),
      'speed_home', 75,
      'speed_infos', 75
    ),
    updated_at = now()
where key = 'ticker' and value ? 'fr';
