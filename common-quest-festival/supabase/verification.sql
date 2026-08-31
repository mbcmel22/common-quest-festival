-- =====================================================================
-- COMMON QUEST : verifier que toutes les colonnes attendues existent
-- A executer dans Supabase > SQL Editor. Vous devez voir 4 lignes.
-- =====================================================================

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'events'
  and column_name in ('is_pwyw', 'video_url', 'video_urls', 'social_links')
order by column_name;
