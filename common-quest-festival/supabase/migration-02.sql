-- =====================================================================
-- COMMON QUEST : mise a jour du 30 aout 2026
-- A executer dans Supabase > SQL Editor, apres schema.sql et seed.sql.
-- Ajoute le prix libre sur les evenements et les reglages de marque.
-- =====================================================================

alter table public.events
  add column if not exists is_pwyw boolean not null default false;

insert into public.site_settings (key, value) values
  ('brand', '{"logo_url": null}'),
  ('ticker', '{"fr": "Qu avons-nous en commun ? Le hip hop.", "en": "What do we have in common? Hip hop.", "es": "Que tenemos en comun? El hip hop."}')
on conflict (key) do nothing;
