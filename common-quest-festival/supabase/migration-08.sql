-- =====================================================================
-- COMMON QUEST : bouton de soutien et slogan
-- A executer dans Supabase > SQL Editor, apres migration-07.sql
-- =====================================================================

insert into public.site_settings (key, value) values
  ('support', '{"url": "https://www.billetweb.fr/don-libre-soutien-a-la-premiere-edition-du-festival-common-quest?multi=u289326&margin=no_margin&ref=u289326&color=635BFF&parent=1"}')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Slogan anglais avec espace insecable avant le point d interrogation,
-- dans les deux banderoles et dans les trois langues
update public.site_settings
set value = jsonb_build_object(
      'home', jsonb_build_object(
        'fr', 'What do we have in common ? Hip hop.',
        'en', 'What do we have in common ? Hip hop.',
        'es', 'What do we have in common ? Hip hop.'
      ),
      'infos', jsonb_build_object(
        'fr', 'What do we have in common ? Hip hop.',
        'en', 'What do we have in common ? Hip hop.',
        'es', 'What do we have in common ? Hip hop.'
      ),
      'speed_home', coalesce((value->>'speed_home')::int, 75),
      'speed_infos', coalesce((value->>'speed_infos')::int, 75)
    ),
    updated_at = now()
where key = 'ticker';
