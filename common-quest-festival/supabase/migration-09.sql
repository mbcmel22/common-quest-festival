-- =====================================================================
-- COMMON QUEST : nouvelles disciplines et champs de fiche evenement
-- A executer dans Supabase > SQL Editor, apres reparation-rls.sql
-- =====================================================================

-- 1. Nouvelles disciplines : workshop, projection, scene ouverte
alter table public.events drop constraint if exists events_category_check;
alter table public.events add constraint events_category_check
  check (category in (
    'soiree', 'atelier', 'workshop', 'dj', 'graffiti', 'rap', 'danse',
    'talk', 'projection', 'scene_ouverte', 'autre'
  ));

-- 2. Credit de la photo d entete
alter table public.events
  add column if not exists photo_credit text;

-- 3. Champs traduits : type d evenement, mention partenaires, note line-up
alter table public.event_translations
  add column if not exists event_type text,
  add column if not exists partner_note text,
  add column if not exists lineup_note text;

-- =====================================================================
-- 4. Les deux battles, contenu complet en trois langues
-- =====================================================================

insert into public.events
  (slug, day_index, event_date, start_time, end_time, category, venue, address,
   price_label, ticket_url, is_free, is_pwyw, is_published, is_highlight, sort_order)
values
  ('qualifications-battle-common-quest', 3, '2026-10-03', '15:00', '23:00', 'danse',
   'Galerie 5 des Halles 1 & 2 et Halle 6 Ouest', 'Quartier de la Création, île de Nantes',
   '10 € en prévente / 12 € sur place',
   'https://www.billetweb.fr/battle-common-quest-qualifications-break-danse-debout',
   false, false, true, false, 33),
  ('finales-battle-common-quest', 3, '2026-10-03', '19:00', '23:00', 'danse',
   'Magmaa, Nantes', 'Quartier de la Création, île de Nantes',
   '23 € en prévente / 25 € sur place',
   'https://www.billetweb.fr/battle-international-common-quest-finales-after-party',
   false, false, true, true, 34)
on conflict (slug) do update set
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  category = excluded.category,
  venue = excluded.venue,
  address = excluded.address,
  price_label = excluded.price_label,
  ticket_url = excluded.ticket_url,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order,
  updated_at = now();

with t(slug, locale, title, tagline, description, event_type, partner_note, lineup_note) as (values
  ('qualifications-battle-common-quest', 'fr', 'Qualifications du Battle International Common Quest', 'Quatre places à décrocher pour les finales du soir', 'Avant les finales, place aux qualifications du Battle Common Quest. L’après-midi réunira plusieurs catégories et plusieurs générations de danseur·euses autour de deux rendez-vous.

BREAK ET TOPROCK
2vs2 Break
1vs1 Toprock

DANSE DEBOUT
3vs3 Hip hop, House, Funkstyle (Popping et Locking)

À la clé : 4 places pour les finales le soir même.

Les qualifications se dérouleront dans deux espaces du Quartier de la Création : la Galerie 5 des Halles 1 & 2 et la Halle 6 Ouest. Le billet donne accès aux deux espaces : vous pourrez passer de l’un à l’autre au fil de l’après-midi, dans la limite des capacités d’accueil de chaque lieu.

À l’issue des qualifications, les danseur·euses qui décrocheront leur place rejoindront les invité·es internationaux pour les finales du Battle Common Quest, le soir même à Magmaa. Une après-midi pour voir les danseur·euses en action, suivre les différentes catégories et découvrir celles et ceux qui gagneront leur place pour la suite.', 'Battle de danse', 'Co-organisé par PRISM, la SAMOA et Nantes Université', 'TBA'),
  ('qualifications-battle-common-quest', 'en', 'Common Quest International Battle qualifiers', 'Four spots to grab for the evening finals', 'Before the finals, the Common Quest Battle qualifiers take over the afternoon, with several categories and several generations of dancers across two sessions.

BREAKING AND TOPROCK
2vs2 Breaking
1vs1 Toprock

STANDING STYLES
3vs3 Hip hop, House, Funk styles (Popping and Locking)

At stake: 4 spots for the finals the same evening.

The qualifiers take place in two venues of the Quartier de la Création: Galerie 5 of Halles 1 & 2 and Halle 6 Ouest. One ticket gives access to both: you can move from one to the other during the afternoon, within the capacity of each venue.

The qualified dancers will then join the international guests for the Common Quest Battle finals, the same evening at Magmaa. An afternoon to watch the dancers at work, follow every category and discover who earns a place for what comes next.', 'Dance battle', 'Co-organised by PRISM, SAMOA and Nantes Université', 'TBA'),
  ('qualifications-battle-common-quest', 'es', 'Clasificatorias del Battle Internacional Common Quest', 'Cuatro plazas en juego para las finales de la noche', 'Antes de las finales llegan las clasificatorias del Battle Common Quest. La tarde reunirá varias categorías y varias generaciones de bailarines en dos citas.

BREAK Y TOPROCK
2vs2 Break
1vs1 Toprock

DANZAS DE PIE
3vs3 Hip hop, House, Funk styles (Popping y Locking)

En juego: 4 plazas para las finales esa misma noche.

Las clasificatorias tendrán lugar en dos espacios del Quartier de la Création: la Galerie 5 de las Halles 1 & 2 y la Halle 6 Ouest. La entrada da acceso a ambos espacios, según el aforo de cada uno.

Los clasificados se unirán después a los invitados internacionales para las finales del Battle Common Quest, esa misma noche en Magmaa.', 'Battle de danza', 'Coorganizado por PRISM, la SAMOA y Nantes Université', 'TBA'),
  ('finales-battle-common-quest', 'fr', 'Finales du Battle International Common Quest', 'Trois catégories, une seule arène', 'Après les qualifications de l’après-midi, les danseur·euses qualifié·es retrouveront les invité·es internationaux du Battle Common Quest pour les finales.

Pour cette première édition, trois catégories se disputeront le carré :
2vs2 Break
1vs1 Toprock
3vs3 Danse debout : Hip hop, House et Funk Styles (Popping et Locking)

Des danseur·euses venu·es notamment du Japon, des États-Unis, du Royaume-Uni, de Belgique, de France et d’ailleurs se retrouveront à Nantes pour cette soirée internationale.

Pour l’occasion, Magmaa se transforme en arène : le food hall sera réorganisé autour du carré de danse, avec une partie du public au plus près des danseur·euses et d’autres spectateur·rices pouvant prendre de la hauteur depuis la mezzanine. La restauration de Magmaa reste accessible pendant la soirée.

APRÈS LE BATTLE
Parce qu’on ne s’arrête pas au dernier round, la soirée se poursuivra avec Tsara, collectif rennais, pour un afterparty aux sonorités malagasy et de l’océan Indien, entre hip hop, dancehall et influences club.', 'Battle de danse', 'Co-organisé par PRISM et Magmaa', 'TBA'),
  ('finales-battle-common-quest', 'en', 'Common Quest International Battle finals', 'Three categories, one arena', 'After the afternoon qualifiers, the qualified dancers meet the international guests of the Common Quest Battle for the finals.

For this first edition, three categories will fight for the floor:
2vs2 Breaking
1vs1 Toprock
3vs3 Standing styles: Hip hop, House and Funk Styles (Popping and Locking)

Dancers from Japan, the United States, the United Kingdom, Belgium, France and elsewhere will meet in Nantes for this international night.

For the occasion, Magmaa turns into an arena: the food hall is rearranged around the dance floor, with part of the audience right next to the dancers and others watching from the mezzanine. Magmaa food service stays open during the night.

AFTER THE BATTLE
Because we do not stop at the last round, the night carries on with Tsara, a collective from Rennes, for an afterparty of Malagasy and Indian Ocean sounds, between hip hop, dancehall and club influences.', 'Dance battle', 'Co-organised by PRISM and Magmaa', 'TBA'),
  ('finales-battle-common-quest', 'es', 'Finales del Battle Internacional Common Quest', 'Tres categorías, una sola arena', 'Tras las clasificatorias de la tarde, los bailarines clasificados se reúnen con los invitados internacionales del Battle Common Quest para las finales.

En esta primera edición, tres categorías se disputarán la pista:
2vs2 Break
1vs1 Toprock
3vs3 Danzas de pie: Hip hop, House y Funk Styles (Popping y Locking)

Bailarines de Japón, Estados Unidos, Reino Unido, Bélgica, Francia y otros países se darán cita en Nantes para esta noche internacional.

Para la ocasión, Magmaa se convierte en arena: el food hall se reorganiza alrededor de la pista, con parte del público junto a los bailarines y otros espectadores en la mezzanine. La restauración de Magmaa sigue abierta durante la noche.

DESPUÉS DEL BATTLE
La noche continúa con Tsara, colectivo de Rennes, para un afterparty de sonidos malgaches y del océano Índico, entre hip hop, dancehall e influencias club.', 'Battle de danza', 'Coorganizado por PRISM y Magmaa', 'TBA')
)
insert into public.event_translations
  (event_id, locale, title, tagline, description, event_type, partner_note, lineup_note)
select e.id, t.locale, t.title, t.tagline, t.description, t.event_type, t.partner_note, t.lineup_note
from t join public.events e on e.slug = t.slug
on conflict (event_id, locale) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  event_type = excluded.event_type,
  partner_note = excluded.partner_note,
  lineup_note = excluded.lineup_note;
