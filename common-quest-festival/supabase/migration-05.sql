-- =====================================================================
-- COMMON QUEST : symbole euro et correction de la page equipe
-- A executer dans Supabase > SQL Editor, apres migration-04.sql
-- =====================================================================

update public.events
set price_label = replace(price_label, ' EUR', ' €')
where price_label like '%EUR%';

update public.event_translations
set description = replace(description, ' EUR', ' €'),
    practical_info = replace(practical_info, ' EUR', ' €')
where description like '%EUR%' or practical_info like '%EUR%';
