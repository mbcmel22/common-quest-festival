-- =====================================================================
-- COMMON QUEST : reglages avances
-- A executer dans Supabase > SQL Editor, apres migration-03.sql
-- =====================================================================

insert into public.site_settings (key, value) values
  ('copy', '{}'),
  ('typography', '{"scale": 1}'),
  ('socials', '{"instagram": "https://www.instagram.com/commonquest_", "tiktok": "https://www.tiktok.com/@common.quest", "facebook": "https://www.facebook.com/share/19HsLRBsB5/?mibextid=wwXIfr", "youtube": "", "linkedin": ""}')
on conflict (key) do nothing;

-- L ancien champ instagram des infos pratiques migre vers les reseaux sociaux
update public.site_settings
set value = value - 'instagram', updated_at = now()
where key = 'practical' and value ? 'instagram';
