-- =====================================================================
-- COMMON QUEST : disciplines multiples par evenement + partenaires
-- A executer dans Supabase > SQL Editor
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Un evenement peut porter plusieurs disciplines
--    La colonne "category" est conservee : elle reste la discipline
--    principale, celle affichee sur la carte du programme.
-- ---------------------------------------------------------------------
alter table public.events
  add column if not exists categories text[] not null default '{}';

-- Reprise de l existant : chaque evenement herite de sa discipline actuelle
update public.events
  set categories = array[category]
  where cardinality(categories) = 0;

create index if not exists events_categories_idx
  on public.events using gin (categories);

-- ---------------------------------------------------------------------
-- 2. Partenaires : publication et logos de depart
-- ---------------------------------------------------------------------
alter table public.partners
  add column if not exists is_published boolean not null default true;

-- Les dix logos livres avec le site (fichiers dans /public/partners).
-- on conflict : relancer la migration ne cree pas de doublon.
create unique index if not exists partners_name_key on public.partners (name);

insert into public.partners (name, logo_url, website_url, kind, sort_order) values
  ('Ville de Nantes',            '/partners/ville-de-nantes.png',    'https://metropole.nantes.fr',        'institution', 10),
  ('Loire-Atlantique',           '/partners/departement-44.png',     'https://www.loire-atlantique.fr',    'institution', 20),
  ('Crédit Agricole',            '/partners/credit-agricole.png',    'https://www.credit-agricole.fr',     'partenaire',  30),
  ('Samoa',                      '/partners/samoa.png',              'https://www.samoa-nantes.fr',        'institution', 40),
  ('Beaux-Arts Nantes Saint-Nazaire', '/partners/beaux-arts-nantes.png', 'https://www.beauxartsnantes.fr', 'lieu',        50),
  ('Halle 6 Ouest',              '/partners/halle-6-ouest.png',      'https://halle6ouest.univ-nantes.fr', 'lieu',        60),
  ('Magmaa',                     '/partners/magmaa.png',             'https://www.magmaa-nantes.fr',       'lieu',        70),
  ('Askip',                      '/partners/askip.png',              'https://askipaskipaskip.com',        'lieu',        80),
  ('Culture Bar-Bars',           '/partners/culture-bar-bars.png',   'https://www.bar-bars.com',           'partenaire',  90),
  ('Douze Mille Prod',           '/partners/dmp.png',                null,                                 'partenaire', 100)
on conflict (name) do nothing;
