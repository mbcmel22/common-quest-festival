-- =====================================================================
-- COMMON QUEST : contenu de depart (issu du communique de presse)
-- A executer APRES schema.sql. Tout est modifiable ensuite dans le back office.
-- =====================================================================

insert into public.events
  (slug, day_index, event_date, start_time, end_time, category, venue, price_label, is_free, is_published, is_highlight, sort_order)
values
  ('back-dans-les-bars', 1, '2026-10-01', '19:00', '01:00', 'soiree', 'Bars du collectif Bar-Bars, Nantes', 'Gratuit', true, true, false, 10),
  ('workshops-danse-vendredi', 2, '2026-10-02', '14:00', '17:00', 'atelier', 'Quartier de la Creation', 'Gratuit', true, true, false, 20),
  ('bal-hip-hop-blind-test', 2, '2026-10-02', '17:00', '19:30', 'dj', 'Village du festival', 'Gratuit', true, true, false, 21),
  ('fresque-participative', 2, '2026-10-02', '11:00', '19:00', 'graffiti', 'Quartier de la Creation', 'Gratuit', true, true, false, 22),
  ('clash-crew-rap', 2, '2026-10-02', '20:00', '21:30', 'rap', 'Quartier de la Creation', 'Sur billet soiree', false, true, true, 23),
  ('4vs4-exhibition-congo-bolingo', 2, '2026-10-02', '21:30', '23:30', 'danse', 'Quartier de la Creation', 'Billet + don libre au profit de Congo Bolingo', false, true, true, 24),
  ('afterparty-vendredi', 2, '2026-10-02', '23:30', '02:00', 'soiree', 'Quartier de la Creation', 'Inclus dans le billet du soir', false, true, false, 25),
  ('workshops-danse-samedi', 3, '2026-10-03', '10:00', '13:00', 'atelier', 'Quartier de la Creation', '10 EUR le workshop', false, true, false, 30),
  ('parcours-graffiti-douze-mille-prod', 3, '2026-10-03', '11:00', '18:00', 'graffiti', 'Quartier de la Creation', 'Gratuit', true, true, false, 31),
  ('ateliers-kontrat-dixtion', 3, '2026-10-03', '14:00', '17:00', 'atelier', 'Village du festival', 'Gratuit', true, true, false, 32),
  ('qualifications-battle-common-quest', 3, '2026-10-03', '13:00', '18:00', 'danse', 'Magmaa Food Hall', '8 EUR', false, true, false, 33),
  ('finales-battle-common-quest', 3, '2026-10-03', '20:00', '00:00', 'danse', 'Magmaa Food Hall', '18 EUR prevente / 22 EUR sur place', false, true, true, 34),
  ('soiree-rap-og', 3, '2026-10-03', '20:30', '01:00', 'rap', 'Quartier de la Creation', '20 EUR prevente / 24 EUR sur place', false, true, true, 35),
  ('tsara-club', 3, '2026-10-03', '01:00', '04:00', 'dj', 'Quartier de la Creation', 'Inclus dans le billet du soir', false, true, false, 36),
  ('dimanche-en-construction', 4, '2026-10-04', '12:00', '20:00', 'autre', 'Quartier de la Creation', 'A venir', false, true, false, 40)
on conflict (slug) do nothing;

with t(slug, locale, title, tagline, description) as (values
  ('back-dans-les-bars','fr','Back dans les bars','Le warm-up avec le collectif Bar-Bars','Avant de prendre ses quartiers sur l ile de Nantes, le festival commence dans les bars nantais. Chaque etablissement propose sa propre soiree aux couleurs du hip hop : open mic, DJ set, projection, concert. Des lieux differents, des formats differents, un meme point commun.'),
  ('back-dans-les-bars','en','Back in the bars','Warm-up night with the Bar-Bars collective','Before moving to the island, the festival kicks off in Nantes bars. Each venue hosts its own hip hop night: open mic, DJ set, screening, live show. Different places, different formats, one thing in common.'),
  ('back-dans-les-bars','es','De vuelta a los bares','Calentamiento con el colectivo Bar-Bars','Antes de instalarse en la isla, el festival empieza en los bares de Nantes. Cada local propone su propia noche hip hop: micro abierto, DJ set, proyeccion, concierto.'),
  ('workshops-danse-vendredi','fr','Workshops de danse','Avec les artistes internationaux du Battle','Les danseurs invites du Battle Common Quest partagent leur pratique avec les festivalieres et festivaliers, avant de retrouver le carre de danse le lendemain. Ouvert a tous les niveaux.'),
  ('workshops-danse-vendredi','en','Dance workshops','With the battle international guests','The international dancers of the Battle Common Quest share their practice with the audience before hitting the dance floor the next day. All levels welcome.'),
  ('workshops-danse-vendredi','es','Talleres de danza','Con los artistas internacionales del battle','Los bailarines invitados del Battle Common Quest comparten su practica con el publico antes de subir al ruedo al dia siguiente. Todos los niveles.'),
  ('bal-hip-hop-blind-test','fr','Bal hip hop et blind test','Une piste ouverte a toutes les generations','DJ sets, bal hip hop et blind test : un temps gratuit pense pour venir en famille, entre amis ou entre generations, sans rien connaitre ou en connaissant tout.'),
  ('bal-hip-hop-blind-test','en','Hip hop ball and blind test','A dance floor open to every generation','DJ sets, a hip hop ball and a blind test: a free moment built for families, friends and generations to mix, whether you know everything or nothing.'),
  ('bal-hip-hop-blind-test','es','Baile hip hop y blind test','Una pista abierta a todas las generaciones','DJ sets, baile hip hop y blind test: un momento gratuito pensado para venir en familia, entre amigos o entre generaciones.'),
  ('fresque-participative','fr','Fresque participative et graffiti','La rue comme atelier','La culture graffiti prend ses marques dans le quartier avec une programmation construite avec les acteurs nantais du street art. Bombe en main ou simple curiosite, la fresque avance avec le public.'),
  ('fresque-participative','en','Community mural and graffiti','The street as a studio','Graffiti culture settles into the neighbourhood with a programme built alongside Nantes street art figures. Spray can in hand or just curious, the mural grows with the audience.'),
  ('fresque-participative','es','Mural participativo y grafiti','La calle como taller','La cultura grafiti se instala en el barrio con una programacion construida con los artistas nanteses del street art.'),
  ('clash-crew-rap','fr','Clash Crew Rap','N+1 contre 4Feyder, en trois manches','Deux groupes de la scene rap nantaise se font face dans un format en trois manches, hoste par Falconn et anime par DJ Sylaar. Un clash entre artistes independants, departage par un jury nantais et par le public.'),
  ('clash-crew-rap','en','Rap Crew Clash','N+1 versus 4Feyder, three rounds','Two crews from the Nantes rap scene face off in a three round format hosted by Falconn with DJ Sylaar on the beats. A clash between independent artists, decided by a local jury and by the audience.'),
  ('clash-crew-rap','es','Clash Crew Rap','N+1 contra 4Feyder, en tres asaltos','Dos grupos de la escena rap de Nantes se enfrentan en tres asaltos, presentado por Falconn y animado por DJ Sylaar. Decide un jurado local y el publico.'),
  ('4vs4-exhibition-congo-bolingo','fr','4vs4 exhibition x Congo Bolingo','Prendre position, transmettre','Six crews, trois en break et trois en hip hop, reunissent des danseurs de generations differentes. Ni jury ni vainqueur : les equipes se repondent et montrent comment une culture se transmet. Parmi les invites, Bboy Junior, double champion du monde avec Wanted Posse. Un don libre au profit de Congo Bolingo peut etre ajoute au billet.'),
  ('4vs4-exhibition-congo-bolingo','en','4vs4 exhibition x Congo Bolingo','Take a stand, pass it on','Six crews, three breaking and three hip hop, bring together dancers from different generations. No jury, no winner: the teams answer each other and show how a culture is passed on. Guests include Bboy Junior, two time world champion with Wanted Posse. A free donation to Congo Bolingo can be added to your ticket.'),
  ('4vs4-exhibition-congo-bolingo','es','4vs4 exhibicion x Congo Bolingo','Tomar posicion, transmitir','Seis crews, tres de break y tres de hip hop, reunen bailarines de distintas generaciones. Sin jurado ni ganador. Entre los invitados, Bboy Junior, doble campeon del mundo con Wanted Posse.'),
  ('afterparty-vendredi','fr','Afterparty du vendredi','On prolonge la soiree','La soiree se poursuit apres le carre de danse, avec les DJs du festival et celles et ceux qui veulent rester encore un peu.'),
  ('afterparty-vendredi','en','Friday afterparty','Keep the night going','The night carries on after the dance floor with the festival DJs and everyone who wants to stay a little longer.'),
  ('afterparty-vendredi','es','Afterparty del viernes','La noche continua','La noche sigue despues del ruedo con los DJs del festival.'),
  ('workshops-danse-samedi','fr','Workshops de danse du samedi','Rencontrer les danseurs et les juges','De nouveaux workshops proposes avec les artistes internationaux du Battle Common Quest, pour decouvrir les disciplines du line-up du soir en rencontrant directement les danseurs et les juges invites.'),
  ('workshops-danse-samedi','en','Saturday dance workshops','Meet the dancers and the judges','New workshops with the international artists of the Battle Common Quest, to discover the evening line-up disciplines directly with the dancers and invited judges.'),
  ('workshops-danse-samedi','es','Talleres de danza del sabado','Encuentro con bailarines y jueces','Nuevos talleres con los artistas internacionales del Battle Common Quest para descubrir las disciplinas del line-up de la noche.'),
  ('parcours-graffiti-douze-mille-prod','fr','Parcours graffiti avec Douze Mille Prod','Visite guidee, jam et table ronde','Visite guidee de l art dans l espace public au coeur du Quartier de la Creation, suite de la fresque participative, graffiti jam avec six artistes nantais, ateliers de peinture sur objets upcycles avec la street artiste Nina Missir et table ronde sur l engagement dans l art urbain.'),
  ('parcours-graffiti-douze-mille-prod','en','Graffiti trail with Douze Mille Prod','Guided walk, jam and round table','A guided walk through public art in the Quartier de la Creation, the mural continues, a graffiti jam with six Nantes artists, upcycled painting workshops with street artist Nina Missir and a round table on commitment in urban art.'),
  ('parcours-graffiti-douze-mille-prod','es','Recorrido grafiti con Douze Mille Prod','Visita guiada, jam y mesa redonda','Visita guiada del arte en el espacio publico, continuacion del mural, jam de grafiti con seis artistas de Nantes y mesa redonda sobre el compromiso en el arte urbano.'),
  ('ateliers-kontrat-dixtion','fr','Ateliers beatmaking, beatbox et ecriture','Avec Kontrat Dixtion','Trois ateliers gratuits pour mettre les mains dedans : fabriquer un beat, poser sa voix, ecrire un couplet. Aucun prerequis, juste l envie d essayer.'),
  ('ateliers-kontrat-dixtion','en','Beatmaking, beatbox and writing workshops','With Kontrat Dixtion','Three free workshops to get hands on: build a beat, use your voice, write a verse. No experience needed, just the will to try.'),
  ('ateliers-kontrat-dixtion','es','Talleres de beatmaking, beatbox y escritura','Con Kontrat Dixtion','Tres talleres gratuitos para meter las manos: crear un beat, usar la voz, escribir una estrofa. Sin requisitos previos.'),
  ('qualifications-battle-common-quest','fr','Qualifications du Battle Common Quest','Break, toprock et danse debout','Deux sessions de qualifications : l une consacree au break et au toprock, l autre a la danse debout house, hip hop et funk styles. Les quatre qualifies de chaque categorie rejoindront les invites internationaux en finale.'),
  ('qualifications-battle-common-quest','en','Battle Common Quest qualifiers','Breaking, toprock and standing styles','Two qualifying sessions: one for breaking and toprock, one for house, hip hop and funk styles. The four qualifiers in each category join the international guests for the finals.'),
  ('qualifications-battle-common-quest','es','Clasificatorias del Battle Common Quest','Break, toprock y danzas de pie','Dos sesiones clasificatorias: break y toprock por un lado, house, hip hop y funk styles por otro. Los cuatro clasificados de cada categoria pasan a la final.'),
  ('finales-battle-common-quest','fr','Finales du Battle Common Quest','Trois categories, une seule arene','Pour la premiere fois a Nantes, une meme soiree reunit plusieurs disciplines issues de l histoire du hip hop autour de trois categories : 2vs2 break, 1vs1 toprock et 3vs3 danse debout. Des danseurs venus du Japon, des Etats-Unis, du Royaume-Uni, de Russie, de Belgique et de France se retrouvent dans le food hall de Magmaa transforme en arene.'),
  ('finales-battle-common-quest','en','Battle Common Quest finals','Three categories, one arena','For the first time in Nantes, one night brings together several hip hop disciplines across three categories: 2vs2 breaking, 1vs1 toprock and 3vs3 standing styles. Dancers from Japan, the United States, the United Kingdom, Russia, Belgium and France meet in the Magmaa food hall turned into an arena.'),
  ('finales-battle-common-quest','es','Finales del Battle Common Quest','Tres categorias, una sola arena','Por primera vez en Nantes, una misma noche reune varias disciplinas del hip hop en tres categorias: 2vs2 break, 1vs1 toprock y 3vs3 danzas de pie, con bailarines de Japon, Estados Unidos, Reino Unido, Rusia, Belgica y Francia.'),
  ('soiree-rap-og','fr','Soiree rap francais OG','Factor X, Ul team Atomatum et Gboumah','Une soiree pour celles et ceux qui ont grandi avec ce rap la. A l affiche : Factor X avec Ol Kainry, Kamnouze et Jango Jack, ainsi que Ul team Atomatum avec Grodash. Le rap nantais est represente par l artiste independant Gboumah en premiere partie.'),
  ('soiree-rap-og','en','French OG rap night','Factor X, Ul team Atomatum and Gboumah','A night for everyone who grew up with this rap. On the bill: Factor X with Ol Kainry, Kamnouze and Jango Jack, plus Ul team Atomatum with Grodash. Nantes rap is represented by independent artist Gboumah opening the night.'),
  ('soiree-rap-og','es','Noche de rap frances OG','Factor X, Ul team Atomatum y Gboumah','Una noche para quienes crecieron con este rap. En cartel: Factor X con Ol Kainry, Kamnouze y Jango Jack, y Ul team Atomatum con Grodash. Gboumah abre la noche.'),
  ('tsara-club','fr','Tsara, cap sur l ocean Indien','La nuit se prolonge','Le collectif rennais Tsara fait voyager la soiree vers les sonorites malagasy et de l ocean Indien, entre hip hop, dancehall et influences club.'),
  ('tsara-club','en','Tsara, heading to the Indian Ocean','The night goes on','Rennes based collective Tsara takes the night towards Malagasy and Indian Ocean sounds, between hip hop, dancehall and club influences.'),
  ('tsara-club','es','Tsara, rumbo al oceano Indico','La noche continua','El colectivo Tsara lleva la noche hacia sonidos malgaches y del oceano Indico, entre hip hop, dancehall e influencias club.'),
  ('dimanche-en-construction','fr','Dimanche, avec les activistes nantais','Programmation devoilee bientot','Pour clore cette premiere edition, le festival continue avec les activistes hip hop nantais. La programmation du dimanche se construit avec la scene locale et sera devoilee prochainement.'),
  ('dimanche-en-construction','en','Sunday, with the Nantes activists','Line-up revealed soon','To close this first edition, the festival keeps going with Nantes hip hop activists. The Sunday programme is being built with the local scene and will be revealed soon.'),
  ('dimanche-en-construction','es','Domingo, con los activistas de Nantes','Programacion proximamente','Para cerrar esta primera edicion, el festival continua con los activistas hip hop de Nantes. La programacion del domingo se anunciara pronto.')
)
insert into public.event_translations (event_id, locale, title, tagline, description)
select e.id, t.locale, t.title, t.tagline, t.description
from t join public.events e on e.slug = t.slug
on conflict (event_id, locale) do update
set title = excluded.title, tagline = excluded.tagline, description = excluded.description;

insert into public.artists (name, discipline, country, is_headliner, sort_order) values
  ('Bboy Junior', 'Breaking', 'France', true, 1),
  ('Factor X', 'Rap', 'France', true, 2),
  ('Ul team Atomatum', 'Rap', 'France', true, 3),
  ('Gboumah', 'Rap', 'Nantes', false, 4),
  ('Tsara', 'DJ set', 'Rennes', false, 5),
  ('Falconn', 'Host', 'Nantes', false, 6),
  ('DJ Sylaar', 'DJ', 'Nantes', false, 7),
  ('Nina Missir', 'Street art', 'Nantes', false, 8)
on conflict do nothing;

insert into public.site_settings (key, value) values
  ('hero', '{"edition":"1re edition","dates":"1 > 4 octobre 2026","place":"Quartier de la Creation, ile de Nantes"}'),
  ('practical', '{"address":"Quartier de la Creation, ile de Nantes","transport":"Tram 1 arret Chantiers Navals, Busway 5, station velo a proximite","accessibility":"Site accessible en fauteuil, contactez-nous pour preparer votre venue","instagram":"https://www.instagram.com/commonquest_"}')
on conflict (key) do update set value = excluded.value, updated_at = now();
