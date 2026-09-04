-- =====================================================================
-- COMMON QUEST : diagnostic du back office
-- A executer dans Supabase > SQL Editor
-- =====================================================================

-- 1. Les colonnes attendues existent-elles ? Vous devez voir 4 lignes.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'events'
  and column_name in ('is_pwyw', 'video_url', 'video_urls', 'social_links')
order by column_name;

-- 2. Qui a acces au back office ?
select u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role in ('admin', 'editor');
